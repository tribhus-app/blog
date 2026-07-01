import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

const CATEGORY_CURIOSIDADES = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a'
const AUTHOR_TRIBHUS = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'

const SLUG = 'pop-rock-nacional'
const TITLE = 'Pop rock nacional: as melhores bandas e músicas pra ouvir agora'
const EXCERPT =
  'Do pop rock nacional dos clássicos às revelações independentes: as melhores bandas e músicas do estilo pra você ouvir e seguir na Tribhus.'
const META_TITLE = 'Pop rock nacional: as melhores bandas e músicas pra ouvir'
const META_DESCRIPTION =
  'O melhor do pop rock nacional: dos clássicos de Jota Quest e Capital Inicial às bandas independentes que você descobre e ouve agora mesmo na Tribhus.'
const FOCUS_KEYWORD = 'pop rock nacional'

// Capa Unsplash (Simon Weisser) -> MinIO
const COVER_SRC = 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=1600&q=80'
const COVER_CREDIT = 'Foto: Simon Weisser / Unsplash'
const COVER_CREDIT_URL = 'https://unsplash.com/photos/teal-and-brown-electric-guitar-phS37wg8cQg'

// Inline Unsplash (Jefferson Santos) -> MinIO
const INLINE_SRC = 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1400&q=80'

const TAGS = ['pop rock nacional', 'pop rock', 'rock brasileiro', 'bandas independentes', 'rock nacional']

const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

function buildContent(inlineUrl: string): string {
  return [
    `<p>O <strong>pop rock nacional</strong> é a trilha sonora de quem cresceu cantando refrão grudento no rádio: melodia pop, guitarra na medida certa e letra em português que fica na cabeça. Neste guia a gente reúne os clássicos do estilo e, principalmente, as bandas independentes que estão fazendo pop rock de qualidade agora mesmo na Tribhus.</p>`,

    `<h2>O que é o pop rock nacional</h2>`,
    `<p>O <strong>pop rock nacional</strong> é o encontro do peso e da energia do rock com a melodia e a acessibilidade do pop. É rock pra cantar junto: refrões fortes, produção caprichada e aquele equilíbrio entre o radiofônico e o autoral. Foi por essa porta que boa parte do Brasil entrou no rock — e segue sendo um dos estilos mais queridos do país.</p>`,

    `<h2>Os clássicos do pop rock nacional</h2>`,
    `<p>Quando o assunto é <strong>pop rock brasileiro</strong>, alguns nomes são incontornáveis: <strong>Lulu Santos</strong>, <strong>Kid Abelha</strong>, <strong>Capital Inicial</strong>, <strong>Skank</strong>, <strong>Jota Quest</strong>, <strong>Os Paralamas do Sucesso</strong> e <strong>Pitty</strong> entregaram hits que tocam até hoje. São canções que provam que dá pra ser popular sem perder a identidade.</p>`,
    `<p>Dois exemplos que viraram hinos de cantar junto:</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/TynFsTZlGDU?rel=0"></iframe></div>`,
    `<p>"Só Hoje", do Jota Quest, é puro pop rock nacional dançante e solar.</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/bzh6nH0RBZ0?rel=0"></iframe></div>`,
    `<p>E "À Sua Maneira", do Capital Inicial, é um dos maiores refrões do pop rock brasileiro deste século.</p>`,

    `<h2>As melhores bandas de pop rock nacional independentes</h2>`,
    `<p>Os clássicos abriram o caminho — e uma nova geração de <strong>bandas de pop rock</strong> autorais segue trilhando ele. Na ${A('https://tribhus.com.br', 'Tribhus')}, dá pra ouvir e seguir esses nomes agora mesmo:</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${inlineUrl}" alt="Músico tocando guitarra num show de pop rock">`,
    `<p><em>O pop rock nacional segue vivo na cena independente. Foto: Jefferson Santos / Unsplash.</em></p>`,
    `<ul>` +
      `<li><p>${A('https://tribhus.com.br/bandas/criacaso', 'Cria Caso')} — de Itapemirim (ES), com pop rock, indie rock e rock balada — e música entre as mais tocadas do Palco da Tribhus.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/sonnora', 'Sonnora')} — de São Paulo (SP), pop rock puro, do jeitinho que toca no rádio.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/julianagatto', 'Juliana Gatto')} — de São José dos Pinhais (PR), entre o indie rock e o pop rock.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/rodolfolemys', 'Rodolfo Lemys')} — de Paraíso do Norte (PR), com pop rock, power pop e rock alternativo.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/bandafluaoficial', 'Flua!')} — de Porto Alegre (RS), no equilíbrio entre pop rock, rock and roll e rock balada.</p></li>` +
    `</ul>`,
    `<p>Quer descobrir ainda mais nomes? A tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')} é uma comunidade dedicada a indicar bandas independentes do cenário nacional.</p>`,

    `<h2>Onde ouvir pop rock nacional hoje</h2>`,
    `<p>Pra mergulhar de vez, explore o hub de ${A('https://tribhus.com.br/genero/pop-rock', 'pop rock')} e o ${A('https://tribhus.com.br/bandas', 'catálogo completo de bandas')} da Tribhus. E se quiser entender o contexto maior do gênero no Brasil, vale ler também nossos posts sobre o ${A('https://blog.tribhus.com.br/rock-nacional', 'rock nacional dos clássicos às novas bandas')} e sobre o ${A('https://blog.tribhus.com.br/rock-nacional-anos-80-90', 'rock nacional dos anos 80 e 90')}.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> o pop rock nacional não parou nos clássicos — tem banda autoral fazendo refrão de cantar junto agora mesmo. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,
    `<p>Dos hits que embalaram gerações às revelações que ainda vão estourar, o pop rock nacional continua sendo aquele abraço melódico com distorção na medida. Dá o play e descubra a sua próxima banda favorita.</p>`,
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
