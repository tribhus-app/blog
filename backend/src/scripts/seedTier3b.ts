import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()
const CAT_EVENTOS = 'e6ff9765-23ba-4463-a820-a3e0b4158703'
const AUTHOR = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

interface Faq { q: string; a: string }
interface Band { slug: string; nome: string; estado: string }
interface City {
  slug: string; cidadeNome: string; cidadeHub: string
  title: string; excerpt: string; metaTitle: string; metaDescription: string; focusKeyword: string
  coverSrc: string; coverCredit: string; coverCreditUrl: string; tags: string[]
  intro: string; cena: string; faq: Faq[]; bands: Band[]
}

function build(c: City): string {
  const ul = '<ul>' + c.bands.map(x => `<li><strong>${A('https://tribhus.com.br/bandas/' + x.slug, x.nome.trim())}</strong> — banda de ${c.cidadeNome} (${x.estado}).</li>`).join('') + '</ul>'
  const b: string[] = [
    `<p>${c.intro}</p>`,
    `<h2>A cena de rock em ${c.cidadeNome}</h2>`, `<p>${c.cena}</p>`,
    `<h2>Como achar shows de rock em ${c.cidadeNome}</h2>`,
    `<p>O segredo é saber onde procurar. Além dos grandes festivais, é nas casas de show, bares e centros culturais que a cena independente acontece o ano todo. Na ${A('https://tribhus.com.br', 'Tribhus')}, a ${A('https://tribhus.com.br/eventos', 'agenda de eventos')} reúne shows de bandas autorais — dá pra filtrar pela página de ${A('https://tribhus.com.br/cidade/' + c.cidadeHub, c.cidadeNome)}. A dica de ouro: <strong>siga as bandas que você curte</strong> dentro da plataforma pra saber na hora que elas marcam show.</p>`,
    `<h2>Bandas de rock de ${c.cidadeNome} pra conhecer</h2>`,
    `<p>A melhor forma de mergulhar na cena local é pelas bandas. Alguns nomes de ${c.cidadeNome} pra ouvir e seguir na Tribhus:</p>`,
    ul,
    `<p>Quer descobrir ainda mais? Entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}, dedicada a indicar bandas independentes de todo o país.</p>`,
    `<h2>Perguntas frequentes</h2>`,
  ]
  for (const f of c.faq) b.push(`<p><strong>${f.q}</strong> ${f.a}</p>`)
  b.push(`<h2>Onde ver shows de rock em ${c.cidadeNome}</h2>`)
  b.push(`<p>Acompanhe a ${A('https://tribhus.com.br/eventos', 'agenda de shows')} da Tribhus e a página de ${A('https://tribhus.com.br/cidade/' + c.cidadeHub, 'bandas e eventos de ' + c.cidadeNome)}. E pra ver o cenário nacional, confira nosso ${A('https://blog.tribhus.com.br/shows-de-rock-no-brasil-2026', 'guia de shows de rock no Brasil em 2026')} e o ${A('https://blog.tribhus.com.br/rock-nacional', 'panorama do rock nacional')}.</p>`)
  b.push(`<blockquote><p><strong>Descubra na Tribhus:</strong> a próxima banda que vai te marcar pode estar tocando em ${c.cidadeNome} neste fim de semana. ${A('https://tribhus.com.br/eventos', 'Veja a agenda de shows &rarr;')}</p></blockquote>`)
  b.push(`<p>De banda nova em bar lotado a nome consagrado em festival, ${c.cidadeNome} respira rock o ano inteiro. Dá o play na cena local e vai ao próximo show.</p>`)
  return b.join('\n\n')
}

const CITIES: City[] = [
  {
    slug: 'shows-de-rock-em-curitiba', cidadeNome: 'Curitiba', cidadeHub: 'curitiba',
    title: 'Shows de rock em Curitiba: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock de Curitiba: como achar shows, as casas que mantêm o gênero vivo e as bandas locais pra seguir na Tribhus.',
    metaTitle: 'Shows de rock em Curitiba: a cena e as bandas locais',
    metaDescription: 'Shows de rock em Curitiba: como achar a agenda, a cena local e as bandas de rock curitibanas pra ouvir e seguir agora na Tribhus.',
    focusKeyword: 'shows de rock em curitiba',
    coverSrc: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&q=80',
    coverCredit: 'Foto: Anthony DELANOIX / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/hzgs56Ze49s',
    tags: ['shows de rock', 'curitiba', 'rock nacional', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock em Curitiba</strong>? A capital paranaense tem uma cena de rock ativa e de público fiel. Neste guia, mostramos como encontrar shows pela cidade, falamos da cena local e indicamos bandas curitibanas pra você ouvir e seguir agora mesmo na Tribhus.',
    cena: 'Curitiba tem tradição no circuito independente do Sul, com um público roqueiro fiel e casas de show que sustentam a cena o ano todo. Da capital paranaense saem bandas autorais de vários estilos — do metal ao indie, do hardcore ao rock alternativo —, formando um cenário pequeno em tamanho, mas intenso em qualidade e identidade.',
    faq: [
      { q: 'Onde tem show de rock em Curitiba?', a: 'Em casas de show, bares e centros culturais pela cidade, o ano todo, além dos festivais. A agenda da Tribhus reúne shows de bandas independentes, filtráveis por cidade.' },
      { q: 'Quais bandas de rock são de Curitiba?', a: 'A cidade tem uma cena autoral diversa, do metal ao indie, que você encontra e pode seguir na Tribhus.' },
      { q: 'Como achar shows de bandas independentes em Curitiba?', a: 'Seguindo as bandas que você curte na Tribhus, pra ser avisado quando elas marcarem show na cidade.' },
    ],
    bands: [
      { slug: 'barbosa', nome: 'Barbosa', estado: 'PR' },
      { slug: 'cristianorocha', nome: 'Estrada 71', estado: 'PR' },
      { slug: 'keyus', nome: 'Keyus', estado: 'PR' },
      { slug: 'pregodepau', nome: 'Prego de Pau', estado: 'PR' },
      { slug: 'scorlles', nome: 'Scorlles', estado: 'PR' },
      { slug: 'vinicastro11', nome: 'Rumble Vox', estado: 'PR' },
    ],
  },
  {
    slug: 'shows-de-rock-em-porto-alegre', cidadeNome: 'Porto Alegre', cidadeHub: 'porto-alegre',
    title: 'Shows de rock em Porto Alegre: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock de Porto Alegre: como achar shows, a tradição do rock gaúcho e as bandas locais pra seguir na Tribhus.',
    metaTitle: 'Shows de rock em Porto Alegre: a cena e as bandas',
    metaDescription: 'Shows de rock em Porto Alegre: como achar a agenda, a cena gaúcha e as bandas de rock locais pra ouvir e seguir agora na Tribhus.',
    focusKeyword: 'shows de rock em porto alegre',
    coverSrc: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80',
    coverCredit: 'Foto: ActionVance / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/eXVd7gDPO9A',
    tags: ['shows de rock', 'porto alegre', 'rock gaucho', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock em Porto Alegre</strong>? A capital gaúcha é uma das grandes referências do rock no Sul do país. Neste guia, mostramos como achar shows pela cidade, falamos da tradição do rock gaúcho e indicamos bandas locais pra seguir na Tribhus.',
    cena: 'Porto Alegre tem uma forte tradição de rock: foi de lá que saiu o <strong>Engenheiros do Hawaii</strong>, e o "rock gaúcho" se firmou como uma identidade própria dentro do rock nacional. A cidade mantém uma cena independente diversa e ativa, com público engajado e bandas autorais espalhadas por todos os estilos.',
    faq: [
      { q: 'Onde tem show de rock em Porto Alegre?', a: 'Em casas de show, bares e centros culturais pela cidade, o ano todo, além dos festivais. A agenda da Tribhus reúne shows de bandas independentes, filtráveis por cidade.' },
      { q: 'Quais bandas de rock são de Porto Alegre?', a: 'Porto Alegre revelou clássicos como o Engenheiros do Hawaii e tem uma forte cena autoral atual, que você encontra na Tribhus.' },
      { q: 'O que é o "rock gaúcho"?', a: 'É como se chama a tradição de rock do Rio Grande do Sul, marcada por uma identidade própria e por nomes influentes do rock nacional.' },
    ],
    bands: [
      { slug: 'codigopenal', nome: 'Código Penal', estado: 'RS' },
      { slug: 'drehellsing', nome: 'Bräinwire', estado: 'RS' },
      { slug: 'planetaharmonico', nome: 'Planeta Harmônico', estado: 'RS' },
      { slug: 'pwgroove', nome: 'Power Groove', estado: 'RS' },
      { slug: 'roiss', nome: 'Veinside', estado: 'RS' },
      { slug: 'thomas', nome: 'Thomas Butterfly', estado: 'RS' },
    ],
  },
]

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
  for (const c of CITIES) {
    if (await prisma.blogPost.findUnique({ where: { slug: c.slug } })) { console.log(`[skip] ${c.slug}`); continue }
    const content = build(c)
    const md = content.match(/(^|\n)#{1,4}\s|(^|\n)-\s|(^|\n)>\s|\*\*/g)
    if (md) { console.error(`ABORT ${c.slug}`, md); process.exit(1) }
    const cover = await uploadImageFromUrl(c.coverSrc)
    const tagIds = await upsertTags(c.tags)
    const post = await prisma.blogPost.create({
      data: {
        title: c.title, slug: c.slug, excerpt: c.excerpt, content,
        coverImage: cover.url, imageCredit: c.coverCredit, imageCreditUrl: c.coverCreditUrl,
        status: 'draft', featured: false, authorId: AUTHOR, categoryId: CAT_EVENTOS,
        metaTitle: c.metaTitle, metaDescription: c.metaDescription, focusKeyword: c.focusKeyword,
      },
    })
    for (const tagId of tagIds) await prisma.blogPostTag.create({ data: { postId: post.id, tagId } }).catch(() => {})
    const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
    console.log(`[ok] ${c.slug} | mt ${c.metaTitle.length} md ${c.metaDescription.length} | ~${words} palavras`)
  }
}
run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
