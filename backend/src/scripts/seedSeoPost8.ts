import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

const CATEGORY_CURIOSIDADES = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a'
const AUTHOR_TRIBHUS = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'

const SLUG = 'bandas-de-nu-metal'
const TITLE = 'Bandas de nu metal que marcaram época (e as novas do Brasil)'
const EXCERPT =
  'Do peso de Korn e Linkin Park às bandas de nu metal independentes do Brasil: o guia do gênero que marcou os anos 2000 — e segue vivo na Tribhus.'
const META_TITLE = 'Bandas de nu metal que marcaram época — e as novas do Brasil'
const META_DESCRIPTION =
  'As bandas de nu metal que marcaram época, de Korn e Linkin Park ao nu metal nacional independente que você ouve agora mesmo na Tribhus.'
const FOCUS_KEYWORD = 'bandas de nu metal'

const COVER_SRC = 'https://images.unsplash.com/photo-1515890326200-a07ce46010a1?w=1600&q=80'
const COVER_CREDIT = 'Foto: Diego Ornelas-Tapia / Unsplash'
const COVER_CREDIT_URL = 'https://unsplash.com/photos/man-playing-electric-guitar-inside-black-room-KazZtMYsPGs'

const INLINE_SRC = 'https://images.unsplash.com/photo-1574123331112-a1b1d3d93c2d?w=1400&q=80'

const TAGS = ['nu metal', 'metal', 'rock brasileiro', 'bandas independentes', 'anos 2000']

const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

function buildBlocks(inlineUrl: string): string[] {
  return [
    `<p>Poucos gêneros definiram os anos 2000 como o nu metal. Se você cresceu ouvindo guitarra grave, scratch de DJ e refrão pra gritar junto, esse guia é pra você: reunimos as <strong>bandas de nu metal</strong> que marcaram época e, no fim, a nova geração do estilo que está rolando agora na cena independente brasileira.</p>`,

    `<h2>O que é o nu metal</h2>`,
    `<p>O <strong>nu metal</strong> nasceu nos anos 90 misturando o peso do heavy metal com a batida e a atitude do hip-hop, do funk e do groove. Guitarras de afinação grave, baixo estalado, vocais que alternam entre o melódico e o gritado — e, muitas vezes, um DJ ou samplers na banda. É pesado, mas é dançante; agressivo, mas grudento.</p>`,

    `<h2>As bandas de nu metal que marcaram época</h2>`,
    `<p>Os nomes que fundaram e popularizaram o gênero são incontornáveis: <strong>Korn</strong> (os pioneiros de Bakersfield), <strong>Linkin Park</strong>, <strong>Slipknot</strong>, <strong>Limp Bizkit</strong>, <strong>Deftones</strong>, <strong>System of a Down</strong> e <strong>Papa Roach</strong>. Eles dominaram as rádios, a MTV e os festivais do começo do milênio.</p>`,
    `<p>Dois clássicos que definem o som da época:</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/jRGrNDV2mKc?rel=0"></iframe></div>`,
    `<p>"Freak on a Leash", do Korn, é praticamente a certidão de nascimento do nu metal.</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/eVTXPUF4Oz4?rel=0"></iframe></div>`,
    `<p>E "In the End", do Linkin Park, levou o gênero ao topo do mundo e a uma geração inteira.</p>`,

    `<h2>O nu metal nacional: a cena independente</h2>`,
    `<p>O nu metal nunca morreu — e no Brasil ele vive num momento fértil, com bandas autorais misturando peso, groove e identidade própria. Na ${A('https://tribhus.com.br', 'Tribhus')}, dá pra ouvir e seguir esses nomes agora mesmo:</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${inlineUrl}" alt="Guitarrista de nu metal tocando ao vivo">`,
    `<p><em>O nu metal nacional segue pesado na cena independente. Foto: Honey Yanibel Minaya Cruz / Unsplash.</em></p>`,
    `<ul>` +
      `<li><strong>${A('https://tribhus.com.br/bandas/bonecavoodoo', 'Boneca Voo Doo')}</strong> — Estância Velha (RS): nu metal com um tempero de metal industrial e psicodelia.</li>` +
      `<li><strong>${A('https://tribhus.com.br/bandas/letargia', 'Letargia')}</strong> — Salvador (BA): nu metal puro e prolífico, com um vasto repertório autoral.</li>` +
      `<li><strong>${A('https://tribhus.com.br/bandas/humerusbanda', 'HUMERUS')}</strong> — São Paulo (SP): nu metal cruzado com grunge e hard rock.</li>` +
      `<li><strong>${A('https://tribhus.com.br/bandas/aetherloreband', 'AETHERLORE')}</strong> — Presidente Prudente (SP): nu metal somado a heavy e grunge.</li>` +
      `<li><strong>${A('https://tribhus.com.br/bandas/codeveronica_oficial', 'Code Veronica')}</strong> — Tubarão (SC): a turma do nu metal revival, com pegada moderna.</li>` +
    `</ul>`,
    `<p>Quer descobrir ainda mais peso? A tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')} é uma comunidade dedicada a indicar bandas independentes do underground nacional.</p>`,

    `<h2>Onde ouvir nu metal hoje</h2>`,
    `<p>Pra mergulhar no estilo, explore o hub de ${A('https://tribhus.com.br/genero/nu-metal', 'nu metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo completo de bandas')} da Tribhus. E se você curte o lado mais pesado em geral, vale ver também nosso guia das ${A('https://blog.tribhus.com.br/bandas-de-heavy-metal-brasileiras', 'bandas de heavy metal brasileiras')}.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> o nu metal nacional tem nome novo pesando agora mesmo — não fica só nos clássicos dos anos 2000. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,

    `<p>Dos riffs graves que marcaram uma geração às bandas que estão reinventando o peso hoje, o nu metal segue vivo. Sobe o volume e descobre a tua próxima favorita.</p>`,
  ]
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

  const blocks = buildBlocks(inline.url)
  const content = blocks.join('\n\n')
  const md = content.match(/(^|\n)#{1,4}\s|(^|\n)-\s|(^|\n)>\s|\*\*/g)
  if (md) { console.error('ABORTADO: markdown:', md); process.exit(1) }

  const tagIds = await upsertTags(TAGS)
  const post = await prisma.blogPost.create({
    data: {
      title: TITLE, slug: SLUG, excerpt: EXCERPT, content,
      coverImage: cover.url, imageCredit: COVER_CREDIT, imageCreditUrl: COVER_CREDIT_URL,
      status: 'draft', featured: false,
      authorId: AUTHOR_TRIBHUS, categoryId: CATEGORY_CURIOSIDADES,
      metaTitle: META_TITLE, metaDescription: META_DESCRIPTION, focusKeyword: FOCUS_KEYWORD,
    },
  })
  for (const tagId of tagIds) {
    await prisma.blogPostTag.create({ data: { postId: post.id, tagId } }).catch(() => {})
  }
  console.log(`[ok] Rascunho criado: ${post.id} — ${post.title}`)
  console.log(`     blocos ${blocks.length} | metaTitle ${META_TITLE.length} | metaDescription ${META_DESCRIPTION.length} | content ${content.length}`)
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
