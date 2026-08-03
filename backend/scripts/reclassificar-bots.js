#!/usr/bin/env node
/**
 * reclassificar-bots.js
 *
 * Reprocessa o historico de blog_post_views aplicando a deteccao de bot por IP
 * (datacenter/VPN) que passou a valer no incrementViews. Ate 31/07/2026 a unica
 * camada era o BOT_REGEX do user-agent — crawler que se apresenta como Chrome
 * comum (Alibaba Cloud, Baidu, Meta, Googlebot) entrava como leitor humano e
 * inflava tanto o contador do post quanto o painel de analytics.
 *
 * Usa o endpoint /batch do ip-api.com (gratis, 100 IPs por chamada, 15 req/min).
 *
 * Uso:
 *   node scripts/reclassificar-bots.js            # so relatorio, nao grava nada
 *   node scripts/reclassificar-bots.js --aplicar  # grava is_bot e recalcula views
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const APLICAR = process.argv.includes('--aplicar')
const BATCH_URL = 'http://ip-api.com/batch?fields=status,query,countryCode,city,hosting,proxy,as'

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

async function consultarLote(ips) {
  const res = await fetch(BATCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ips),
  })
  if (!res.ok) throw new Error(`ip-api respondeu ${res.status}`)
  return res.json()
}

async function main() {
  console.log(APLICAR ? '>> MODO APLICAR (grava no banco)\n' : '>> MODO RELATORIO (nao grava nada)\n')

  const linhas = await prisma.$queryRaw`
    SELECT DISTINCT ip FROM blog_post_views
    WHERE is_bot = false AND ip IS NOT NULL AND ip <> 'unknown'`
  const ips = linhas.map((l) => l.ip)
  console.log(`IPs distintos ainda classificados como humano: ${ips.length}`)

  const suspeitos = []
  for (let i = 0; i < ips.length; i += 100) {
    const lote = ips.slice(i, i + 100)
    const resultado = await consultarLote(lote)
    for (const r of resultado) {
      if (r.status !== 'success') continue
      if (r.hosting || r.proxy) {
        suspeitos.push({ ip: r.query, motivo: r.hosting ? 'datacenter' : 'vpn/proxy', rede: r.as, pais: r.countryCode })
      }
    }
    console.log(`  lote ${i / 100 + 1}: ${lote.length} IPs consultados`)
    if (i + 100 < ips.length) await dormir(4500) // teto de 15 req/min
  }

  console.log(`\nIPs de datacenter/VPN encontrados: ${suspeitos.length}`)
  const porRede = {}
  for (const s of suspeitos) porRede[s.rede || '(sem ASN)'] = (porRede[s.rede || '(sem ASN)'] || 0) + 1
  for (const [rede, qtd] of Object.entries(porRede).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${String(qtd).padStart(3)} IP(s)  ${rede}`)
  }

  if (!suspeitos.length) return

  const listaIps = suspeitos.map((s) => s.ip)
  const afetadas = await prisma.blogPostView.count({
    where: { ip: { in: listaIps }, isBot: false },
  })
  console.log(`\nVisitas que serao reclassificadas como robo: ${afetadas}`)

  if (!APLICAR) {
    console.log('\nNada foi gravado. Rode com --aplicar para valer.')
    return
  }

  const upd = await prisma.blogPostView.updateMany({
    where: { ip: { in: listaIps }, isBot: false },
    data: { isBot: true },
  })
  console.log(`Marcadas como robo: ${upd.count}`)

  // Recalcula o contador publico de cada post a partir dos eventos que sobraram.
  // Colunas da tabela de dentro SEMPRE qualificadas com o alias: sem isso o
  // Postgres resolve o nome para a tabela errada e roda "com sucesso"
  // destruindo dado (mesma pegadinha do criado_por_id no CRM).
  //
  // O gatilho update_blog_posts_updated_at carimba updated_at a CADA update, e
  // updated_at sai no dateModified do JSON-LD de cada post. Sem desligar ele,
  // corrigir contador de visita faz o blog inteiro anunciar pro Google que os
  // 340 artigos foram reescritos hoje. Contador nao e edicao de conteudo:
  // preserva a data. (Aconteceu de verdade em 31/07/2026.)
  const recalc = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      'ALTER TABLE blog_posts DISABLE TRIGGER update_blog_posts_updated_at'
    )
    try {
      return await tx.$executeRaw`
        UPDATE blog_posts p
           SET views = (
             SELECT COUNT(*)::int
               FROM blog_post_views v
              WHERE v.post_id = p.id AND v.is_bot = false
           )`
    } finally {
      await tx.$executeRawUnsafe(
        'ALTER TABLE blog_posts ENABLE TRIGGER update_blog_posts_updated_at'
      )
    }
  })
  console.log(`Contador de views recalculado em ${recalc} post(s).`)
}

main()
  .catch((e) => {
    console.error('Falhou:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
