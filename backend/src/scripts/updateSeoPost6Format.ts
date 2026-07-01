import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'shows-de-rock-no-brasil-2026'

// Imagem inline ja hospedada no MinIO (post #6) — reutilizada.
const INLINE_URL =
  'https://blog.tribhus.com.br/minio-images/1781864981752-photo-1501386761578-eac5c94b800a'

const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

// HTML PURO (o editor do admin e Tiptap, que so entende HTML — markdown aparece
// literal). Sem <table> (StarterKit nao tem extensao de tabela e o blog nao estiliza
// tabela). Blocos separados por \n\n por seguranca no render publico (PostContent).
function buildBlocks(): string[] {
  return [
    `<p>Procurando <strong>shows de rock no Brasil em 2026</strong>? Esse ano promete — dos megafestivais que lotam estádios aos shows de banda autoral no bar da esquina. Este guia separa os dois mundos: os grandes eventos que você já pode colocar no radar e, principalmente, como descobrir a cena de rock independente que acontece o ano inteiro pertinho de você.</p>`,

    `<h2>Os grandes festivais de rock no Brasil em 2026</h2>`,

    `<p>O calendário brasileiro de festivais é um dos mais fortes do mundo. Estes são os nomes que todo fã de rock acompanha — clique em cada um para ir direto ao site oficial:</p>`,

    `<ul>` +
      `<li><strong>${A('https://rockinrio.com', 'Rock in Rio')}</strong> — Rio de Janeiro (RJ): o maior do país, com line-ups gigantes que cruzam rock e pop.</li>` +
      `<li><strong>${A('https://thetown.com.br', 'The Town')}</strong> — São Paulo (SP): megafestival paulistano, do rock ao pop e ao hip-hop.</li>` +
      `<li><strong>${A('https://www.lollapaloozabr.com', 'Lollapalooza Brasil')}</strong> — São Paulo (SP): rock alternativo, indie e eletrônico no Autódromo de Interlagos.</li>` +
      `<li><strong>${A('https://www.joaorock.com.br', 'João Rock')}</strong> — Ribeirão Preto (SP): festival 100% nacional, do rock ao rap e ao reggae.</li>` +
      `<li><strong>${A('https://www.bestofbluesandrock.com.br', 'Best of Blues and Rock')}</strong> — São Paulo (SP): clássicos do blues e do rock, com nomes nacionais e internacionais.</li>` +
      `<li><strong>${A('https://www.rockfestsbo.com', 'Santa Bárbara Rock Fest')}</strong> — Santa Bárbara d'Oeste (SP): gratuito e crescendo a cada ano, é considerado o maior festival de bandas de rock independentes do Brasil.</li>` +
    `</ul>`,

    `<p>Vale um destaque pro <strong>Santa Bárbara Rock Fest</strong>: gratuito e movido a bandas autorais, ele provou que dá pra montar um festival gigante valorizando a cena independente — exatamente o espírito da Tribhus. Não à toa, vem crescendo rápido e já se firma entre os grandes festivais de rock do país.</p>`,

    `<p><em>Importante: datas e atrações mudam a cada edição. Confirme sempre as informações de 2026 nos sites oficiais de cada festival antes de comprar ingresso ou se programar.</em></p>`,

    `<h2>O rock que acontece o ano todo (e quase ninguém divulga)</h2>`,

    `<p>Os grandes festivais são só a ponta do iceberg. Toda semana, em casas pequenas, bares e centros culturais Brasil afora, rola show de banda autoral — e é aí que mora a parte mais viva da cena. São esses shows, de ingresso barato e energia gigante, que sustentam o rock independente no país.</p>`,

    `<img class="max-w-full rounded-lg my-4" src="${INLINE_URL}" alt="Plateia animada num show de rock">`,

    `<p><em>A cena independente é onde o rock acontece o ano inteiro. Foto: Nicholas Green / Unsplash.</em></p>`,

    `<p>O problema de sempre? Descobrir que esses shows existem. É exatamente esse furo que a ${A('https://tribhus.com.br', 'Tribhus')} ajuda a resolver.</p>`,

    `<h2>Como achar shows de rock perto de você</h2>`,

    `<p>Na Tribhus, a ${A('https://tribhus.com.br/eventos', 'agenda de eventos')} reúne shows de bandas independentes — e dá pra filtrar pela sua cidade. Alguns dos polos mais ativos da cena nacional:</p>`,

    `<ul>` +
      `<li>${A('https://tribhus.com.br/cidade/sao-paulo', 'Shows em São Paulo')}</li>` +
      `<li>${A('https://tribhus.com.br/cidade/rio-de-janeiro', 'Shows no Rio de Janeiro')}</li>` +
      `<li>${A('https://tribhus.com.br/cidade/belo-horizonte', 'Shows em Belo Horizonte')}</li>` +
      `<li>${A('https://tribhus.com.br/cidade/porto-alegre', 'Shows em Porto Alegre')}</li>` +
      `<li>${A('https://tribhus.com.br/cidade/curitiba', 'Shows em Curitiba')}</li>` +
    `</ul>`,

    `<p>A dica de ouro: <strong>siga as bandas que você curte</strong> dentro da plataforma. Assim você fica sabendo quando elas anunciam show na sua cidade. Pra começar, dá uma conferida em nomes como ${A('https://tribhus.com.br/bandas/bandabocarra', 'Bocarra')} (São Paulo), ${A('https://tribhus.com.br/bandas/bertola', 'Bertola')} (Belo Horizonte) e ${A('https://tribhus.com.br/bandas/jhon', 'JR')} (Rio de Janeiro) — e entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')} pra trocar indicação de show e banda nova.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> não espere só os grandes festivais. A próxima banda que vai te marcar pode estar tocando na sua cidade neste fim de semana. ${A('https://tribhus.com.br/eventos', 'Veja a agenda de shows &rarr;')}</p></blockquote>`,

    `<p>E pra entrar no clima, vale ler também nossos guias sobre o ${A('https://blog.tribhus.com.br/rock-nacional', 'rock nacional dos clássicos às novas bandas')} e sobre o ${A('https://blog.tribhus.com.br/dia-nacional-do-rock', 'Dia Nacional do Rock')}. Em 2026, o melhor show de rock pode estar bem mais perto do que você imagina.</p>`,
  ]
}

async function run() {
  const blocks = buildBlocks()
  const content = blocks.join('\n\n')

  // Guarda-corpo: nenhum residuo de markdown (Tiptap mostraria literal)
  const md = content.match(/(^|\n)#{1,4}\s|(^|\n)-\s|(^|\n)>\s|\*\*/g)
  if (md) { console.error('ABORTADO: residuo de markdown encontrado:', md); process.exit(1) }
  // So tags suportadas pelo Tiptap/sanitize
  console.log('Blocos:', blocks.length, '| markdown:', md ? 'SIM' : 'nenhum', '| chars:', content.length)

  const existing = await prisma.blogPost.findUnique({ where: { slug: SLUG } })
  if (!existing) { console.error(`Post nao encontrado: ${SLUG}`); process.exit(1) }

  const updated = await prisma.blogPost.update({ where: { slug: SLUG }, data: { content } })
  console.log(`[ok] #6 reescrito em HTML puro: ${updated.id} (status=${updated.status})`)
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
