import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

// IDs reais: categoria EVENTOS + autor Tribhus
const CATEGORY_EVENTOS = 'e6ff9765-23ba-4463-a820-a3e0b4158703'
const AUTHOR_TRIBHUS = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'

const SLUG = 'shows-de-rock-no-brasil-2026'
const TITLE = 'Shows de rock no Brasil em 2026: guia dos festivais e da cena local'
const EXCERPT =
  'Dos grandes festivais aos shows de bandas independentes: o guia pra não perder nenhum show de rock no Brasil em 2026 — e achar a cena perto de você.'
const META_TITLE = 'Shows de rock no Brasil em 2026: festivais e a cena local'
const META_DESCRIPTION =
  'Guia dos shows de rock no Brasil em 2026: os grandes festivais e como achar shows de bandas independentes perto de você pela agenda da Tribhus.'
const FOCUS_KEYWORD = 'shows de rock no brasil 2026'

// Capa Unsplash (Danny Howe) -> MinIO
const COVER_SRC = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80'
const COVER_CREDIT = 'Foto: Danny Howe / Unsplash'
const COVER_CREDIT_URL = 'https://unsplash.com/photos/bn-D2bCvpik'

// Inline Unsplash (Nicholas Green) -> MinIO
const INLINE_SRC = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400&q=80'

const TAGS = ['shows de rock', 'festivais', 'rock nacional', 'agenda', 'bandas independentes']

const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

function buildContent(inlineUrl: string): string {
  return [
    `<p>Procurando <strong>shows de rock no Brasil em 2026</strong>? Esse ano promete — dos megafestivais que lotam estádios aos shows de banda autoral no bar da esquina. Este guia separa os dois mundos: os grandes eventos que você já pode colocar no radar e, principalmente, como descobrir a cena de rock independente que acontece o ano inteiro pertinho de você.</p>`,

    `<h2>Os grandes festivais de rock no Brasil em 2026</h2>`,
    `<p>O calendário brasileiro de festivais é um dos mais fortes do mundo. Estes são os nomes que todo fã de rock acompanha — vale ficar de olho nos anúncios oficiais de cada edição:</p>`,
    `<table><thead><tr><th>Festival</th><th>Onde acontece</th><th>O que esperar</th></tr></thead><tbody>` +
      `<tr><td>Rock in Rio</td><td>Rio de Janeiro (RJ)</td><td>O maior do país, com line-ups gigantes que cruzam rock e pop.</td></tr>` +
      `<tr><td>The Town</td><td>São Paulo (SP)</td><td>Megafestival paulistano, do rock ao pop e ao hip-hop.</td></tr>` +
      `<tr><td>Lollapalooza Brasil</td><td>São Paulo (SP)</td><td>Rock alternativo, indie e eletrônico no Autódromo de Interlagos.</td></tr>` +
      `<tr><td>João Rock</td><td>Ribeirão Preto (SP)</td><td>Festival 100% nacional, do rock ao rap e ao reggae.</td></tr>` +
      `<tr><td>Best of Blues and Rock</td><td>São Paulo (SP)</td><td>Clássicos do blues e do rock, com nomes nacionais e internacionais.</td></tr>` +
      `<tr><td>Summer Breeze Brasil</td><td>São Paulo (SP)</td><td>A edição brasileira do tradicional festival alemão de metal.</td></tr>` +
    `</tbody></table>`,
    `<p><em>Importante: datas e atrações mudam a cada edição. Confirme sempre as informações de 2026 nos canais oficiais de cada festival antes de comprar ingresso ou se programar.</em></p>`,

    `<h2>O rock que acontece o ano todo (e quase ninguém divulga)</h2>`,
    `<p>Os grandes festivais são só a ponta do iceberg. Toda semana, em casas pequenas, bares e centros culturais Brasil afora, rola show de banda autoral — e é aí que mora a parte mais viva da cena. São esses shows, de ingresso barato e energia gigante, que sustentam o rock independente no país.</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${inlineUrl}" alt="Plateia animada num show de rock">`,
    `<p><em>A cena independente é onde o rock acontece o ano inteiro. Foto: Nicholas Green / Unsplash.</em></p>`,
    `<p>O problema de sempre? Descobrir que esses shows existem. É exatamente esse furo que a ${A('https://tribhus.com.br', 'Tribhus')} ajuda a resolver.</p>`,

    `<h2>Como achar shows de rock perto de você</h2>`,
    `<p>Na Tribhus, a ${A('https://tribhus.com.br/eventos', 'agenda de eventos')} reúne shows de bandas independentes — e dá pra filtrar pela sua cidade. Alguns dos polos mais ativos da cena nacional:</p>`,
    `<ul>` +
      `<li><p>${A('https://tribhus.com.br/cidade/sao-paulo', 'Shows em São Paulo')}</p></li>` +
      `<li><p>${A('https://tribhus.com.br/cidade/rio-de-janeiro', 'Shows no Rio de Janeiro')}</p></li>` +
      `<li><p>${A('https://tribhus.com.br/cidade/belo-horizonte', 'Shows em Belo Horizonte')}</p></li>` +
      `<li><p>${A('https://tribhus.com.br/cidade/porto-alegre', 'Shows em Porto Alegre')}</p></li>` +
      `<li><p>${A('https://tribhus.com.br/cidade/curitiba', 'Shows em Curitiba')}</p></li>` +
    `</ul>`,
    `<p>A dica de ouro: <strong>siga as bandas que você curte</strong> dentro da plataforma. Assim você fica sabendo quando elas anunciam show na sua cidade. Pra começar, dá uma conferida em nomes como ${A('https://tribhus.com.br/bandas/bandabocarra', 'Bocarra')} (São Paulo), ${A('https://tribhus.com.br/bandas/bertola', 'Bertola')} (Belo Horizonte) e ${A('https://tribhus.com.br/bandas/jhon', 'JR')} (Rio de Janeiro) — e entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')} pra trocar indicação de show e banda nova.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> não espere só os grandes festivais. A próxima banda que vai te marcar pode estar tocando na sua cidade neste fim de semana. ${A('https://tribhus.com.br/eventos', 'Veja a agenda de shows &rarr;')}</p></blockquote>`,

    `<p>E pra entrar no clima, vale ler também nossos guias sobre o ${A('https://blog.tribhus.com.br/rock-nacional', 'rock nacional dos clássicos às novas bandas')} e sobre o ${A('https://blog.tribhus.com.br/dia-nacional-do-rock', 'Dia Nacional do Rock')}. Em 2026, o melhor show de rock pode estar bem mais perto do que você imagina.</p>`,
  ].join('')
}

async function upsertTags(names: string[]): Promise<string[]> {
  const ids: string[] = []
  for (const name of names) {
    const slug = slugify(name, { lower: true, strict: true })
    const tag = await prisma.blogTag.upsert({ where: { slug }, update: {}, create: { name, slug } })
    ids.push(tag.id)
  }
  return ids
}

async function run() {
  const existing = await prisma.blogPost.findUnique({ where: { slug: SLUG } })
  if (existing) { console.log(`[skip] ja existe: ${SLUG} (${existing.id})`); return }

  console.log(`Capa: ${COVER_SRC}`)
  const cover = await uploadImageFromUrl(COVER_SRC)
  console.log(`-> ${cover.url}`)
  console.log(`Inline: ${INLINE_SRC}`)
  const inline = await uploadImageFromUrl(INLINE_SRC)
  console.log(`-> ${inline.url}`)

  const content = buildContent(inline.url)
  const tagIds = await upsertTags(TAGS)

  const post = await prisma.blogPost.create({
    data: {
      title: TITLE, slug: SLUG, excerpt: EXCERPT, content,
      coverImage: cover.url, imageCredit: COVER_CREDIT, imageCreditUrl: COVER_CREDIT_URL,
      status: 'draft', featured: false,
      authorId: AUTHOR_TRIBHUS, categoryId: CATEGORY_EVENTOS,
      metaTitle: META_TITLE, metaDescription: META_DESCRIPTION, focusKeyword: FOCUS_KEYWORD,
    },
  })
  for (const tagId of tagIds) {
    await prisma.blogPostTag.create({ data: { postId: post.id, tagId } }).catch(() => {})
  }
  console.log(`[ok] Rascunho criado: ${post.id} — ${post.title}`)
  console.log(`     metaTitle ${META_TITLE.length} | metaDescription ${META_DESCRIPTION.length} | content ${content.length}`)
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
