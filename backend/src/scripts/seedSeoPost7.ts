import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

const CATEGORY_CURIOSIDADES = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a'
const AUTHOR_TRIBHUS = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'

const SLUG = 'historias-do-rock'
const TITLE = 'As maiores histórias do rock: 5 curiosidades que viraram lenda'
const EXCERPT =
  'Do Clube dos 27 ao acidente que criou o heavy metal: cinco histórias do rock que viraram lenda — e o que elas têm a ver com a cena independente de hoje.'
const META_TITLE = 'As maiores histórias do rock: 5 curiosidades que viraram lenda'
const META_DESCRIPTION =
  'As maiores histórias do rock: do Clube dos 27 ao acidente que criou o heavy metal — curiosidades reais e o elo com a cena independente na Tribhus.'
const FOCUS_KEYWORD = 'historias do rock'

// Capa Unsplash (Erik Mclean) -> MinIO
const COVER_SRC = 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=1600&q=80'
const COVER_CREDIT = 'Foto: Erik Mclean / Unsplash'
const COVER_CREDIT_URL = 'https://unsplash.com/photos/QzpgqElvSiA'

// Inline Unsplash (Immo Wegmann) -> MinIO
const INLINE_SRC = 'https://images.unsplash.com/photo-1580656449278-e8381933522c?w=1400&q=80'

const TAGS = ['historia do rock', 'curiosidades', 'rock', 'bandas independentes', 'rock nacional']

const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

function buildBlocks(inlineUrl: string): string[] {
  return [
    `<p>O rock é feito de música — mas também de <strong>histórias do rock</strong> que viraram lenda e atravessam gerações. Tem acidente que criou um gênero inteiro, coincidência que assombra fãs até hoje e invenções que mudaram a forma como ouvimos música. Separamos cinco das mais marcantes — e, no fim, o fio que liga todas elas à cena independente de hoje.</p>`,

    `<h2>1. O Clube dos 27: a coincidência que virou lenda</h2>`,
    `<p>Robert Johnson, Brian Jones, Jimi Hendrix, Janis Joplin, Jim Morrison, Kurt Cobain, Amy Winehouse: todos morreram aos <strong>27 anos</strong>. A repetição assustadora deu origem ao mito do "Clube dos 27", que ganhou força de vez com a morte de Cobain em 1994.</p>`,
    `<p>Vale a verdade, porém: não existe maldição nem clube oficial. Estatisticamente, 27 não é uma idade mais perigosa que qualquer outra — é uma coincidência trágica que a cultura pop transformou em lenda. Mas que arrepia, arrepia.</p>`,

    `<h2>2. O acidente que criou o heavy metal</h2>`,
    `<p>Em 1965, no último dia de trabalho numa fábrica de chapas de metal em Birmingham (Inglaterra), o jovem <strong>Tony Iommi</strong> perdeu as pontas de dois dedos numa prensa. Guitarrista canhoto, parecia o fim da carreira. Em vez disso, ele adaptou tudo: criou dedeiras caseiras, afrouxou as cordas e baixou a afinação pra facilitar — e, sem querer, inventou um som mais grave, pesado e sombrio.</p>`,
    `<p>Foi esse som que, com o <strong>Black Sabbath</strong>, deu origem ao heavy metal e rendeu a Iommi o apelido de "padrinho do metal". Uma limitação virou a fundação de um gênero inteiro:</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/0qanF-91aJo?rel=0"></iframe></div>`,

    `<h2>3. Punk: três acordes e o "faça você mesmo"</h2>`,
    `<p>Em meados dos anos 70, enquanto o rock ficava cada vez mais grandioso, uma turma decidiu fazer o oposto: música crua, rápida e direta. <strong>Ramones</strong> em Nova York, <strong>Sex Pistols</strong> na Inglaterra — bastavam três acordes e atitude. Mais do que um som, o punk trouxe uma filosofia: o <strong>"do it yourself"</strong> (faça você mesmo). Gravar sozinho, fazer fanzine, tocar em qualquer porão. Você não precisa de permissão de ninguém pra criar.</p>`,

    `<h2>4. MTV e o vídeo que matou a estrela do rádio</h2>`,
    `<p>À 0h01 de <strong>1º de agosto de 1981</strong>, a MTV estreou nos Estados Unidos e mudou a música para sempre. O primeiríssimo videoclipe exibido não podia ser mais simbólico: "Video Killed the Radio Star", da banda new wave <strong>The Buggles</strong> (lançado em 1979). A partir dali, imagem e música ficaram inseparáveis.</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/W8r-tXRLazs?rel=0"></iframe></div>`,

    `<h2>5. Grunge: do porão de Seattle pro mundo</h2>`,
    `<p>No fim dos anos 80, em Seattle, uma cena underground misturava o peso do metal com a sujeira do punk. Bandas independentes lançavam discos por selos pequenos, longe da indústria. No começo dos anos 90, o <strong>Nirvana</strong> estourou e levou o grunge do porão direto pro topo das paradas — provando que o som mais autêntico pode, sim, conquistar o mundo. (E não deixa de ser irônico que Kurt Cobain tenha entrado, anos depois, no tal Clube dos 27.)</p>`,

    `<h2>O fio que liga todas essas histórias</h2>`,
    `<p>Repare: o punk com seu "faça você mesmo", o metal nascido de uma limitação, o grunge que veio do porão. Todas essas histórias têm o mesmo DNA — gente fazendo do seu jeito, sem pedir licença. E é exatamente esse espírito que move a cena independente até hoje.</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${inlineUrl}" alt="Disco de vinil — símbolo da história do rock">`,
    `<p><em>As lendas do rock nasceram de gente fazendo do seu jeito. Foto: Immo Wegmann / Unsplash.</em></p>`,
    `<p>Na ${A('https://tribhus.com.br', 'Tribhus')}, esse mesmo DNA pulsa em centenas de bandas autorais. Curte a origem do punk e do "faça você mesmo"? Ouça ${A('https://tribhus.com.br/bandas/disola', 'Disola')} (Rio de Janeiro) e ${A('https://tribhus.com.br/bandas/limboperdido', 'Limbo Perdido')} (João Pessoa). Fã do peso do metal de Birmingham? Confira ${A('https://tribhus.com.br/bandas/osvaldoo', 'BELHELL')} (Belém). Curte a energia suja do grunge? Vá de ${A('https://tribhus.com.br/bandas/indnine', 'IndNine')} (São Paulo). E pra um rock mais clássico e elétrico, tem ${A('https://tribhus.com.br/bandas/nigro', 'Nigro')} (São Paulo). Pra garimpar mais nomes, entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> as próximas histórias do rock estão sendo escritas agora, por bandas independentes fazendo tudo do seu jeito. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,

    `<p>E pra continuar a viagem, vale ler nossos guias sobre o ${A('https://blog.tribhus.com.br/rock-nacional', 'rock nacional dos clássicos às novas bandas')} e sobre as ${A('https://blog.tribhus.com.br/bandas-de-heavy-metal-brasileiras', 'bandas de heavy metal brasileiras')}. Toda lenda do rock começou com alguém ousando fazer diferente — talvez a próxima esteja a um play de distância.</p>`,
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
  if (md) { console.error('ABORTADO: residuo de markdown:', md); process.exit(1) }

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
