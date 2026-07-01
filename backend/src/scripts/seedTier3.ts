import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()
const CAT_EVENTOS = 'e6ff9765-23ba-4463-a820-a3e0b4158703'
const AUTHOR = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

const USED = new Set(['heliojairozancopeneto','osss','sagazorfeu','velhoromeu','ceudeoutono','deva','bandapsychotria','andrebarroso','hugoalves','esmeraldo','vaziopesado','lyamusic7','caioarossetti','criacaso','sonnora','julianagatto','rodolfolemys','bandafluaoficial','ultreya','bloodydragonband','symmetry','revolta','agressivium','bandabocarra','bertola','jhon','disola','limboperdido','osvaldoo','indnine','nigro','bonecavoodoo','letargia','humerusbanda','aetherloreband','codeveronica_oficial','tenotitlan','luiz_cyfer','ibmuz','necrocify','dorprofanablackmetal','mitsein','nov88','eddiehost','blackcoffee','dollflesh','bandamx85','nowayformalefactors','7mergulhos','ill','jorger','shitaiband','kyos','felbandeira','saulorhcp','drfreeza','alan','meltinsun','biocidiooficial','amocme','onvecna11','flourishedband','evorto','kapuzdfrade','antonsetti','lookintotheabyss','banda_raivosos','hotled','bandavolupia','cinnamonbtos','honier','velhojohnny','bandagesto','foxhound','bandaabrisasjcgmail.com','drmurder','betheone','rafaelbrunoseh','cronicband','motosserratc','vdl','fenerickmurilo','luaverde','foresttlight','jacklogan','dayvson','theagac','stellairsongs','deceitcultband','oeeulfev','metropolesombre','cesarandthehollowones','borndeadpuppies','rivelinos','flaviobaldan','thiapunk','loopjayoficial','prika','osultimoscarasdaterra'])

interface Faq { q: string; a: string }
interface City {
  slug: string; cidadeDB: string; cidadeNome: string; cidadeHub: string
  title: string; excerpt: string; metaTitle: string; metaDescription: string; focusKeyword: string
  coverSrc: string; coverCredit: string; coverCreditUrl: string; tags: string[]
  intro: string; cena: string; faq: Faq[]
}

async function pickBands(cidadeDB: string, limit: number) {
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT b.nome_banda AS nome, au.slug AS slug, b.estado AS estado,
      (EXISTS (SELECT 1 FROM musicas m WHERE m.id_banda=b.id_banda AND m.deleted_at IS NULL AND m.status='aprovado')) AS tem_musica,
      COUNT(DISTINCT m2.id_musica) FILTER (WHERE m2.deleted_at IS NULL AND m2.status='aprovado') AS mus
    FROM banda b JOIN auth au ON au.auth_id=b.auth_id
    LEFT JOIN musicas m2 ON m2.id_banda=b.id_banda
    WHERE b.cidade ILIKE '${cidadeDB}' AND au.slug IS NOT NULL
    GROUP BY b.id_banda, au.slug`)
  // ordena: fresh+musica, fresh sem musica, usada+musica, usada sem musica
  const rank = (r: any) => (USED.has(r.slug) ? 2 : 0) + (r.tem_musica ? 0 : 1)
  rows.sort((a, b) => rank(a) - rank(b) || Number(b.mus) - Number(a.mus))
  return rows.slice(0, limit)
}

function build(c: City, bandsUl: string): string {
  const b: string[] = [
    `<p>${c.intro}</p>`,
    `<h2>A cena de rock em ${c.cidadeNome}</h2>`, `<p>${c.cena}</p>`,
    `<h2>Como achar shows de rock em ${c.cidadeNome}</h2>`,
    `<p>O segredo é saber onde procurar. Além dos grandes festivais, é nas casas de show, bares e centros culturais que a cena independente acontece o ano todo. Na ${A('https://tribhus.com.br', 'Tribhus')}, a ${A('https://tribhus.com.br/eventos', 'agenda de eventos')} reúne shows de bandas autorais — dá pra filtrar pela página de ${A('https://tribhus.com.br/cidade/' + c.cidadeHub, c.cidadeNome)}. A dica de ouro: <strong>siga as bandas que você curte</strong> dentro da plataforma pra saber na hora que elas marcam show.</p>`,
    `<h2>Bandas de rock de ${c.cidadeNome} pra conhecer</h2>`,
    `<p>A melhor forma de mergulhar na cena local é pelas bandas. Alguns nomes de ${c.cidadeNome} pra ouvir e seguir na Tribhus:</p>`,
    bandsUl,
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
    slug: 'shows-de-rock-em-sao-paulo', cidadeDB: 'São Paulo', cidadeNome: 'São Paulo', cidadeHub: 'sao-paulo',
    title: 'Shows de rock em São Paulo: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock de São Paulo: como achar shows, as casas que mantêm o gênero vivo e as bandas locais pra seguir na Tribhus.',
    metaTitle: 'Shows de rock em São Paulo: a cena e as bandas locais',
    metaDescription: 'Shows de rock em São Paulo: como achar a agenda, a cena local e as bandas de rock paulistanas pra ouvir e seguir agora na Tribhus.',
    focusKeyword: 'shows de rock em são paulo',
    coverSrc: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1600&q=80',
    coverCredit: 'Foto: Hector Bermudez / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/man-playing-electric-guitar-iIWDt0fXa84',
    tags: ['shows de rock', 'são paulo', 'rock nacional', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock em São Paulo</strong>? Você está na capital do rock brasileiro. Neste guia, mostramos como encontrar shows pela cidade, falamos da cena local e indicamos bandas paulistanas pra você ouvir e seguir agora mesmo na Tribhus.',
    cena: 'São Paulo é o maior polo de rock do Brasil. A cidade respira música, com uma das maiores concentrações de casas de show, bares e festivais do país — e foi o berço de nomes históricos do rock nacional, como <strong>Titãs</strong>, <strong>Ira!</strong> e <strong>Os Mutantes</strong>. Hoje, essa tradição se traduz numa cena independente gigante e diversa, que vai do punk ao metal, do indie ao hardcore.',
    faq: [
      { q: 'Onde tem show de rock em São Paulo?', a: 'Em casas de show, bares e centros culturais espalhados pela cidade, o ano todo — além dos grandes festivais. A agenda da Tribhus reúne shows de bandas independentes, filtráveis por cidade.' },
      { q: 'Quais bandas de rock são de São Paulo?', a: 'Da turma clássica (Titãs, Ira!, Os Mutantes) a uma enorme cena autoral atual, que você encontra na Tribhus.' },
      { q: 'Como achar shows de bandas independentes em SP?', a: 'Seguindo as bandas que você curte na Tribhus: assim você é avisado quando elas marcam show na cidade.' },
    ],
  },
  {
    slug: 'shows-de-rock-no-rio-de-janeiro', cidadeDB: 'Rio de Janeiro', cidadeNome: 'Rio de Janeiro', cidadeHub: 'rio-de-janeiro',
    title: 'Shows de rock no Rio de Janeiro: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock do Rio: como achar shows, a tradição carioca no gênero e as bandas locais pra seguir na Tribhus.',
    metaTitle: 'Shows de rock no Rio de Janeiro: a cena e as bandas',
    metaDescription: 'Shows de rock no Rio de Janeiro: como achar a agenda, a cena carioca e as bandas de rock locais pra ouvir e seguir agora na Tribhus.',
    focusKeyword: 'shows de rock no rio de janeiro',
    coverSrc: 'https://images.unsplash.com/photo-1574123331112-a1b1d3d93c2d?w=1600&q=80',
    coverCredit: 'Foto: Honey Yanibel Minaya Cruz / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/low-angle-photography-of-man-playing-guitar-during-daytime-xiNELc0jr20',
    tags: ['shows de rock', 'rio de janeiro', 'rock nacional', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock no Rio de Janeiro</strong>? A cidade tem uma das cenas mais históricas e influentes do rock brasileiro. Neste guia, mostramos como achar shows pelo Rio, falamos da tradição carioca no gênero e indicamos bandas locais pra seguir na Tribhus.',
    cena: 'O Rio de Janeiro é terra de uma cena de rock histórica e influente: foi de lá que saíram nomes como <strong>Barão Vermelho</strong>, <strong>Kid Abelha</strong> e <strong>Os Paralamas do Sucesso</strong>, que marcaram a explosão do BRock nos anos 80. A cidade segue com um forte movimento independente, que mistura a energia do rock com o calor carioca, do hardcore ao indie.',
    faq: [
      { q: 'Onde tem show de rock no Rio de Janeiro?', a: 'Em casas de show, bares e centros culturais pela cidade, o ano todo, além dos grandes festivais. A agenda da Tribhus reúne shows de bandas independentes, filtráveis por cidade.' },
      { q: 'Quais bandas de rock são do Rio de Janeiro?', a: 'Dos clássicos (Barão Vermelho, Kid Abelha, Paralamas) a uma cena autoral atual vibrante, que você encontra na Tribhus.' },
      { q: 'Como achar shows de bandas independentes no Rio?', a: 'Seguindo as bandas que você curte na Tribhus, pra ser avisado quando elas marcarem show na cidade.' },
    ],
  },
  {
    slug: 'shows-de-rock-em-belo-horizonte', cidadeDB: 'Belo Horizonte', cidadeNome: 'Belo Horizonte', cidadeHub: 'belo-horizonte',
    title: 'Shows de rock em Belo Horizonte: a cena e as bandas pra conhecer',
    excerpt: 'O guia da cena de rock de BH: como achar shows, o peso histórico da capital mineira no metal e as bandas locais pra seguir na Tribhus.',
    metaTitle: 'Shows de rock em BH: a cena e as bandas de Belo Horizonte',
    metaDescription: 'Shows de rock em BH: como achar a agenda, a cena de Belo Horizonte (berço de Sepultura e Sarcófago) e as bandas locais pra seguir na Tribhus.',
    focusKeyword: 'shows de rock em bh',
    coverSrc: 'https://images.unsplash.com/photo-1580656449278-e8381933522c?w=1600&q=80',
    coverCredit: 'Foto: Immo Wegmann / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/OXhQHGiez_k',
    tags: ['shows de rock', 'belo horizonte', 'metal nacional', 'agenda', 'bandas independentes'],
    intro: 'Procurando <strong>shows de rock em BH</strong>? Belo Horizonte é uma das maiores potências do rock pesado do Brasil. Neste guia, mostramos como achar shows pela cidade, falamos do peso histórico da capital mineira e indicamos bandas locais pra seguir na Tribhus.',
    cena: 'Belo Horizonte é uma potência do rock pesado nacional: foi lá que nasceram o <strong>Sepultura</strong> e o <strong>Sarcófago</strong>, dois nomes que influenciaram o metal no mundo inteiro. A capital mineira mantém uma cena alternativa e underground fervilhante, do metal extremo ao rock alternativo, com público fiel e muita banda autoral.',
    faq: [
      { q: 'Onde tem show de rock em Belo Horizonte?', a: 'Em casas de show, bares e centros culturais pela cidade, o ano todo, além dos festivais. A agenda da Tribhus reúne shows de bandas independentes, filtráveis por cidade.' },
      { q: 'Quais bandas de rock são de BH?', a: 'BH é berço do Sepultura e do Sarcófago, e tem uma forte cena atual de metal e rock alternativo que você encontra na Tribhus.' },
      { q: 'Como achar shows de bandas independentes em BH?', a: 'Seguindo as bandas que você curte na Tribhus, pra saber na hora quando elas marcarem show na cidade.' },
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
    const bands = await pickBands(c.cidadeDB, 6)
    if (!bands.length) { console.log(`[!] ${c.slug}: 0 bandas`); continue }
    const ul = '<ul>' + bands.map(x =>
      `<li><strong>${A('https://tribhus.com.br/bandas/' + x.slug, (x.nome || '').trim())}</strong> — banda de ${c.cidadeNome} (${x.estado}).</li>`).join('') + '</ul>'
    const content = build(c, ul)
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
    console.log(`[ok] ${c.slug} | bandas: ${bands.map(b => b.slug).join(', ')} | mt ${c.metaTitle.length} md ${c.metaDescription.length} | ~${words} palavras`)
  }
}
run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
