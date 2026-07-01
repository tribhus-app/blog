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

const F = (cidade: string, extra: Faq) => ([
  { q: `Onde tem show de rock em ${cidade}?`, a: 'Em casas de show, bares e centros culturais pela cidade, o ano todo, além dos festivais. A agenda da Tribhus reúne shows de bandas independentes, filtráveis por cidade.' },
  extra,
  { q: 'Como achar shows de bandas independentes?', a: `Seguindo as bandas que você curte na Tribhus, pra ser avisado quando elas marcarem show em ${cidade}.` },
])

const CITIES: City[] = [
  {
    slug: 'shows-de-rock-em-recife', cidadeNome: 'Recife', cidadeHub: 'recife',
    title: 'Shows de rock em Recife: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock de Recife: como achar shows, a força alternativa pernambucana e as bandas locais pra seguir na Tribhus.',
    metaTitle: 'Shows de rock em Recife: a cena e as bandas locais',
    metaDescription: 'Shows de rock em Recife: como achar a agenda, a cena alternativa pernambucana e as bandas de rock locais pra ouvir e seguir na Tribhus.',
    focusKeyword: 'shows de rock em recife',
    coverSrc: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1600&q=80',
    coverCredit: 'Foto: Vishnu R Nair / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/m1WZS5ye404',
    tags: ['shows de rock', 'recife', 'rock nacional', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock em Recife</strong>? A capital pernambucana tem uma das cenas alternativas mais criativas do Brasil. Neste guia, mostramos como encontrar shows pela cidade, falamos da cena local e indicamos bandas recifenses pra você ouvir e seguir na Tribhus.',
    cena: 'Recife tem uma das cenas alternativas mais vibrantes do país. Nos anos 90, a cidade colocou Pernambuco no mapa da música com o <strong>manguebeat</strong>, e desde então mantém um caldeirão criativo que mistura rock, punk e ritmos locais. O resultado é uma cena independente fervilhante, de personalidade forte e bem própria.',
    faq: F('Recife', { q: 'Quais bandas de rock são de Recife?', a: 'A cidade tem uma cena alternativa histórica e uma forte safra atual de bandas autorais, que você encontra na Tribhus.' }),
    bands: [
      { slug: 'anttarez', nome: 'Anttarez', estado: 'PE' },
      { slug: 'marlon', nome: 'Subinconsciente', estado: 'PE' },
      { slug: 'andrerecife', nome: 'Liberty', estado: 'PE' },
      { slug: 'bornofthespirit', nome: 'Born of the Spirit', estado: 'PE' },
      { slug: 'herdeirosoficial', nome: 'Herdeiros', estado: 'PE' },
      { slug: 'raffaellaaureliano', nome: 'Colírio Elétrico', estado: 'PE' },
    ],
  },
  {
    slug: 'shows-de-rock-em-fortaleza', cidadeNome: 'Fortaleza', cidadeHub: 'fortaleza',
    title: 'Shows de rock em Fortaleza: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock de Fortaleza: como achar shows, a cena cearense e as bandas locais pra seguir na Tribhus.',
    metaTitle: 'Shows de rock em Fortaleza: a cena e as bandas locais',
    metaDescription: 'Shows de rock em Fortaleza: como achar a agenda, a cena cearense e as bandas de rock locais pra ouvir e seguir agora na Tribhus.',
    focusKeyword: 'shows de rock em fortaleza',
    coverSrc: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?w=1600&q=80',
    coverCredit: 'Foto: Rachel Coyne / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/U7HLzMO4SIY',
    tags: ['shows de rock', 'fortaleza', 'rock nacional', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock em Fortaleza</strong>? A capital cearense tem uma cena de rock independente ativa e em crescimento. Neste guia, mostramos como encontrar shows pela cidade, falamos da cena local e indicamos bandas fortalezenses pra você ouvir e seguir na Tribhus.',
    cena: 'Fortaleza tem uma cena de rock independente ativa e crescente no Nordeste. A capital cearense reúne bandas autorais de vários estilos — do metal ao alternativo, do punk ao indie — e um público que abraça o gênero, sustentando shows e coletivos o ano todo.',
    faq: F('Fortaleza', { q: 'Quais bandas de rock são de Fortaleza?', a: 'A cidade tem uma safra crescente de bandas autorais de rock e metal, que você encontra e pode seguir na Tribhus.' }),
    bands: [
      { slug: 'ihmm', nome: 'In Hora Mortis Meae', estado: 'CE' },
      { slug: 'sz', nome: 'SemiZeus', estado: 'CE' },
      { slug: 'crfe', nome: 'Forrockers', estado: 'CE' },
      { slug: 'glaydson', nome: 'O Miolo', estado: 'CE' },
      { slug: 'gaspar', nome: 'Gaspar', estado: 'CE' },
      { slug: 'cauaabreu', nome: 'Cidade Baixa', estado: 'CE' },
    ],
  },
  {
    slug: 'shows-de-rock-em-salvador', cidadeNome: 'Salvador', cidadeHub: 'salvador',
    title: 'Shows de rock em Salvador: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock de Salvador: como achar shows, a tradição do rock baiano (Camisa de Vênus, Pitty) e as bandas locais na Tribhus.',
    metaTitle: 'Shows de rock em Salvador: a cena e as bandas locais',
    metaDescription: 'Shows de rock em Salvador: como achar a agenda, a tradição do rock baiano (Camisa de Vênus, Pitty) e as bandas locais pra seguir na Tribhus.',
    focusKeyword: 'shows de rock em salvador',
    coverSrc: 'https://images.unsplash.com/photo-1582711012124-a56cf82307a0?w=1600&q=80',
    coverCredit: 'Foto: Tony Pham / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/FUmDe-Bx1LA',
    tags: ['shows de rock', 'salvador', 'rock baiano', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock em Salvador</strong>? Apesar da fama da axé music, a capital baiana tem uma história e uma cena de rock fortes. Neste guia, mostramos como encontrar shows pela cidade, falamos da tradição do rock baiano e indicamos bandas locais pra seguir na Tribhus.',
    cena: 'Salvador também é terra de rock: a cidade revelou nomes como <strong>Camisa de Vênus</strong>, nos anos 80, e <strong>Pitty</strong>, que levou o rock baiano ao país inteiro nos anos 2000. Por baixo do sol da axé music, segue viva uma cena independente forte, do metal ao alternativo, com bandas autorais e público fiel.',
    faq: F('Salvador', { q: 'Quais bandas de rock são de Salvador?', a: 'Salvador é terra de Camisa de Vênus e Pitty, e tem uma cena autoral atual diversa, que você encontra na Tribhus.' }),
    bands: [
      { slug: 'jprojectband', nome: 'ANFRACTA Project', estado: 'BA' },
      { slug: 'kharbon', nome: 'Kharbon', estado: 'BA' },
      { slug: 'thezero', nome: 'THE ZERO', estado: 'BA' },
      { slug: 'previsaodealta_ssa', nome: 'Previsão De Alta', estado: 'BA' },
      { slug: 'sequestrorelampago', nome: 'Sequestro Relâmpago', estado: 'BA' },
      { slug: 'ossinteticos', nome: 'Os Sintéticos', estado: 'BA' },
    ],
  },
  {
    slug: 'shows-de-rock-em-goiania', cidadeNome: 'Goiânia', cidadeHub: 'goiania',
    title: 'Shows de rock em Goiânia: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock de Goiânia, um dos polos do rock independente do Brasil: como achar shows e as bandas locais pra seguir na Tribhus.',
    metaTitle: 'Shows de rock em Goiânia: a cena e as bandas locais',
    metaDescription: 'Shows de rock em Goiânia: como achar a agenda, a cena indie (terra do festival Bananada) e as bandas de rock locais pra seguir na Tribhus.',
    focusKeyword: 'shows de rock em goiânia',
    coverSrc: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1600&q=80',
    coverCredit: 'Foto: Hanny Naibaho / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/aWXVxy8BSzc',
    tags: ['shows de rock', 'goiania', 'rock independente', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock em Goiânia</strong>? A capital goiana é uma das maiores referências do rock independente do Brasil. Neste guia, mostramos como encontrar shows pela cidade, falamos da cena local e indicamos bandas goianas pra você ouvir e seguir na Tribhus.',
    cena: 'Goiânia é uma das grandes referências do rock independente brasileiro. Conhecida pelo festival <strong>Bananada</strong> e por uma cena indie e alternativa fervilhante, a capital goiana virou sinônimo de música autoral e de descoberta de novas bandas — uma verdadeira fábrica de talentos do rock nacional.',
    faq: F('Goiânia', { q: 'Quais bandas de rock são de Goiânia?', a: 'Goiânia é um polo do rock independente, com uma cena indie e alternativa reconhecida nacionalmente, que você encontra na Tribhus.' }),
    bands: [
      { slug: 'bruxocorazon', nome: 'Bruxo Corazón', estado: 'GO' },
      { slug: 'burenno', nome: 'Starvoid', estado: 'GO' },
      { slug: 'erickreis', nome: 'Erick Reis', estado: 'GO' },
      { slug: 'vitapreludioofc', nome: 'Vita Prelúdio', estado: 'GO' },
      { slug: 'bananabipolar', nome: 'Banana Bipolar', estado: 'GO' },
      { slug: 'silviosouls', nome: 'Sr. Souls', estado: 'GO' },
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
