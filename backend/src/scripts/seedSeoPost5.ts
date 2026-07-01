import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

const CATEGORY_CURIOSIDADES = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a'
const AUTHOR_TRIBHUS = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'

const SLUG = 'bandas-de-heavy-metal-brasileiras'
const TITLE = 'Bandas de heavy metal brasileiras: dos pioneiros à cena atual'
const EXCERPT =
  'De Sepultura e Angra à nova cena underground: as bandas de heavy metal brasileiras que você precisa ouvir — e onde encontrá-las na Tribhus.'
const META_TITLE = 'Bandas de heavy metal brasileiras: dos pioneiros à cena atual'
const META_DESCRIPTION =
  'As melhores bandas de heavy metal brasileiras: dos pioneiros como Sepultura e Angra à cena underground atual que você descobre e ouve na Tribhus.'
const FOCUS_KEYWORD = 'bandas de heavy metal'

// Capa Unsplash (Tijs van Leur) -> MinIO
const COVER_SRC = 'https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=1600&q=80'
const COVER_CREDIT = 'Foto: Tijs van Leur / Unsplash'
const COVER_CREDIT_URL = 'https://unsplash.com/photos/So6YckShOVA'

// Inline Unsplash (Roberto Rendon) -> MinIO
const INLINE_SRC = 'https://images.unsplash.com/photo-1692271931628-adc2b16670dd?w=1400&q=80'

const TAGS = ['heavy metal', 'metal nacional', 'rock brasileiro', 'bandas independentes', 'metal']

const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

function buildContent(inlineUrl: string): string {
  return [
    `<p>As <strong>bandas de heavy metal</strong> brasileiras colocaram o país no mapa do metal mundial — e seguem fazendo barulho até hoje. Neste guia a gente passa pelos pioneiros que abriram o caminho e, principalmente, mostra a cena underground atual que mantém o metal nacional vivo e pesado na Tribhus.</p>`,

    `<h2>As bandas de heavy metal brasileiras que abriram caminho</h2>`,
    `<p>Quando o assunto é <strong>heavy metal</strong> brasileiro, dois nomes são incontornáveis. O <strong>Sepultura</strong>, de Belo Horizonte, levou o peso e a brasilidade do metal nacional para o mundo inteiro. E o <strong>Angra</strong> firmou o Brasil no mapa do metal melódico e do power metal, com virtuosismo de sobra.</p>`,
    `<p>"Roots Bloody Roots", do álbum <em>Roots</em> (1996), é talvez o hino mais conhecido do metal brasileiro:</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/F_6IjeprfEs?rel=0"></iframe></div>`,
    `<p>Já o Angra mostra o outro lado da força do metal nacional, com técnica e melodia, em "Nothing to Say":</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/GcdFH6pAUPs?rel=0"></iframe></div>`,
    `<p>Mas a história do metal brasileiro vai muito além deles: <strong>Sarcófago</strong>, <strong>Dorsal Atlântica</strong>, <strong>Korzus</strong> e <strong>Viper</strong> também são parte fundamental dessa fundação, cada um puxando um fio diferente do gênero.</p>`,

    `<h2>Do thrash ao death: a diversidade do metal nacional</h2>`,
    `<p>O <strong>heavy metal</strong> brasileiro nunca foi uma coisa só. Ele abraça o thrash veloz, o death metal extremo, o power metal melódico, o doom mais arrastado e o metal progressivo cheio de viradas. Essa diversidade é justamente o que mantém a cena rica — e é nela que a nova geração se encontra.</p>`,

    `<h2>A cena atual: bandas de heavy metal independentes pra ouvir agora</h2>`,
    `<p>Longe das grandes gravadoras, uma porção de <strong>bandas de heavy metal</strong> autorais segue gravando, tocando e construindo público. Na ${A('https://tribhus.com.br', 'Tribhus')}, várias delas estão entre as mais ouvidas — e você pode conferir agora mesmo:</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${inlineUrl}" alt="Plateia de um show de heavy metal com as mãos pra cima">`,
    `<p><em>O metal nacional segue pesado na cena independente. Foto: Roberto Rendon / Unsplash.</em></p>`,
    `<ul>` +
      `<li><p>${A('https://tribhus.com.br/bandas/ultreya', 'Ultreya')} — de Anápolis (GO), heavy metal de raiz com pegada hard rock.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/bloodydragonband', 'Bloody Dragon')} — de Natal (RN), heavy metal clássico e rock and roll.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/symmetry', 'Symmetry in Chaos')} — do Rio de Janeiro (RJ), no terreno do metal progressivo.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/revolta', 'Revolta')} — de Belo Horizonte (MG), misturando thrash, metal progressivo e nu metal.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/agressivium', 'Agressivium')} — de Fortaleza (CE), no peso do death metal, deathcore e djent.</p></li>` +
    `</ul>`,
    `<p>Todas elas já emplacaram música entre as mais tocadas do Palco da Tribhus. E pra garimpar ainda mais nomes do underground, a tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')} é uma comunidade dedicada a indicar bandas independentes.</p>`,

    `<h2>Onde ouvir as melhores bandas de heavy metal</h2>`,
    `<p>Pra continuar a headbangada, explore o hub de ${A('https://tribhus.com.br/genero/heavy-metal', 'heavy metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo completo de bandas')} da Tribhus. E pra ampliar a viagem pelo rock feito no Brasil, vale ler também nossos posts sobre o ${A('https://blog.tribhus.com.br/rock-nacional', 'rock nacional dos clássicos às novas bandas')} e sobre o ${A('https://blog.tribhus.com.br/dia-nacional-do-rock', 'Dia Nacional do Rock')}.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> o metal nacional não vive só de lenda — tem banda nova pesando agora mesmo, esperando pra ser ouvida. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,
    `<p>Dos pioneiros que conquistaram o mundo às bandas que ensaiam hoje no underground, o heavy metal brasileiro continua firme e pesado. Coloca o fone, sobe o volume e descubra a sua próxima banda favorita.</p>`,
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
      authorId: AUTHOR_TRIBHUS, categoryId: CATEGORY_CURIOSIDADES,
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
