import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()
const CAT = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a' // curiosidades
const AUTHOR = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3' // Tribhus
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

interface Band { slug: string; name: string; desc: string }
interface Cfg {
  slug: string; title: string; excerpt: string; metaTitle: string; metaDescription: string; focusKeyword: string
  coverSrc: string; coverCredit: string; coverCreditUrl: string; tags: string[]
  hubSlug: string; hubLabel: string
  intro: string; whatIsH2: string; whatIs: string
  classicsH2: string; classics: string; videoId?: string; videoCaption?: string
  bandsH2: string; bandsIntro: string; bands: Band[]
  whereH2: string; where: string; cta: string; closing: string
}

function buildContent(c: Cfg): string {
  const blocks: string[] = [
    `<p>${c.intro}</p>`,
    `<h2>${c.whatIsH2}</h2>`,
    `<p>${c.whatIs}</p>`,
    `<h2>${c.classicsH2}</h2>`,
    `<p>${c.classics}</p>`,
  ]
  if (c.videoId) {
    blocks.push(`<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/${c.videoId}?rel=0"></iframe></div>`)
    if (c.videoCaption) blocks.push(`<p>${c.videoCaption}</p>`)
  }
  blocks.push(`<h2>${c.bandsH2}</h2>`)
  blocks.push(`<p>${c.bandsIntro}</p>`)
  blocks.push('<ul>' + c.bands.map(b => `<li><strong>${A('https://tribhus.com.br/bandas/' + b.slug, b.name)}</strong> — ${b.desc}</li>`).join('') + '</ul>')
  blocks.push(`<p>Pra garimpar ainda mais nomes do underground, entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}.</p>`)
  blocks.push(`<h2>${c.whereH2}</h2>`)
  blocks.push(`<p>${c.where}</p>`)
  blocks.push(`<blockquote><p><strong>Descubra na Tribhus:</strong> ${c.cta} ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`)
  blocks.push(`<p>${c.closing}</p>`)
  return blocks.join('\n\n')
}

const CONFIGS: Cfg[] = [
  {
    slug: 'bandas-de-black-metal',
    title: 'Black metal: guia das bandas essenciais e o underground nacional',
    excerpt: 'Das bandas essenciais da Noruega ao underground brasileiro: o guia do black metal — e onde ouvir a cena independente do gênero na Tribhus.',
    metaTitle: 'Black metal: guia das bandas essenciais e do underground BR',
    metaDescription: 'Black metal: das bandas essenciais da Noruega ao underground brasileiro independente que você descobre e ouve agora na Tribhus.',
    focusKeyword: 'bandas de black metal',
    coverSrc: 'https://images.unsplash.com/photo-1558620013-a08999547a36?w=1600&q=80',
    coverCredit: 'Foto: Jorik Kleen / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/x1yHtSg1DsQ',
    tags: ['black metal', 'metal', 'underground', 'bandas independentes', 'metal nacional'],
    hubSlug: 'black-metal', hubLabel: 'black metal',
    intro: 'Frio, cru e atmosférico: o black metal é um dos subgêneros mais extremos e cultuados do metal. Reunimos as <strong>bandas de black metal</strong> essenciais que definiram o som e, no fim, a cena underground brasileira do gênero que pulsa agora na Tribhus.',
    whatIsH2: 'O que é black metal',
    whatIs: 'O <strong>black metal</strong> é marcado por guitarras em tremolo, blast beats velozes, vocais rasgados e uma atmosfera sombria e crua — muitas vezes com produção propositalmente lo-fi. Mais do que um som, é uma estética: gélida, intensa e sem concessões.',
    classicsH2: 'As bandas de black metal essenciais',
    classics: 'O gênero nasceu na primeira onda dos anos 80 (Venom, Bathory, Hellhammer) e explodiu na segunda onda, na Noruega do início dos anos 90, com <strong>Mayhem</strong>, <strong>Darkthrone</strong>, <strong>Emperor</strong> e <strong>Immortal</strong>. E o Brasil tem papel de honra nessa história: o <strong>Sarcófago</strong>, de Belo Horizonte, influenciou o black metal no mundo inteiro.',
    bandsH2: 'O black metal independente no Brasil',
    bandsIntro: 'Longe dos holofotes, uma cena underground mantém o gênero vivo e cru por aqui. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, dá pra ouvir nomes como:',
    bands: [
      { slug: 'tenotitlan', name: 'Tenotitlan', desc: 'de Minas Gerais, no peso do metal extremo autoral.' },
      { slug: 'luiz_cyfer', name: 'Sociedade Isolada', desc: 'da Bahia, transitando pelo black e por várias vertentes do metal.' },
      { slug: 'ibmuz', name: 'Ibmuz', desc: 'do Rio de Janeiro, com a frieza característica do gênero.' },
      { slug: 'necrocify', name: 'NECROCIFY', desc: 'de Santa Catarina, no underground extremo.' },
      { slug: 'dorprofanablackmetal', name: 'DÖR PRÖFANA', desc: 'do Rio de Janeiro, black metal sem concessões.' },
    ],
    whereH2: 'Onde ouvir black metal hoje',
    where: `Pra mergulhar na escuridão, explore o hub de ${A('https://tribhus.com.br/genero/black-metal', 'black metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo completo de bandas')} da Tribhus. Curte o lado pesado em geral? Veja também as ${A('https://blog.tribhus.com.br/bandas-de-heavy-metal-brasileiras', 'bandas de heavy metal brasileiras')}.`,
    cta: 'o black metal underground brasileiro está vivo e cru — esperando ouvidos corajosos.',
    closing: 'Da Noruega gelada aos porões do Brasil, o black metal segue fiel à sua essência. Sobe o volume e mergulha no escuro.',
  },
  {
    slug: 'bandas-de-metal-industrial',
    title: 'Metal e rock industrial: as bandas que definiram o som das máquinas',
    excerpt: 'De Rammstein e Nine Inch Nails às bandas independentes do Brasil: o guia do metal e rock industrial — e onde ouvi-las na Tribhus.',
    metaTitle: 'Metal e rock industrial: as bandas que definiram o gênero',
    metaDescription: 'Metal e rock industrial: de Rammstein e Nine Inch Nails às bandas independentes do gênero que você ouve agora mesmo na Tribhus.',
    focusKeyword: 'metal industrial',
    coverSrc: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=1600&q=80',
    coverCredit: 'Foto: Yvette de Wit / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/8XLapfNMW04',
    tags: ['metal industrial', 'rock industrial', 'metal', 'bandas independentes', 'metal nacional'],
    hubSlug: 'metal-industrial', hubLabel: 'metal industrial',
    intro: 'Peso de metal com a frieza das máquinas: o <strong>metal industrial</strong> (e o rock industrial) é um dos gêneros mais marcantes e teatrais do rock pesado. Aqui estão as bandas que definiram o som — e a cena independente do estilo no Brasil, na Tribhus.',
    whatIsH2: 'O que é metal industrial',
    whatIs: 'O <strong>metal industrial</strong> funde o peso das guitarras com batidas eletrônicas, samplers, drum machines e texturas barulhentas. O resultado é mecânico, dançante e agressivo ao mesmo tempo — um som que parece sair de uma fábrica distópica.',
    classicsH2: 'As bandas que definiram o rock industrial',
    classics: 'Os nomes que moldaram o gênero são incontornáveis: <strong>Ministry</strong> e <strong>Nine Inch Nails</strong> abriram caminho; <strong>Rammstein</strong> levou o industrial aos estádios do mundo todo; e <strong>Marilyn Manson</strong>, <strong>Fear Factory</strong> e <strong>KMFDM</strong> firmaram o estilo de vez.',
    videoId: 'W3q8Od5qJio',
    videoCaption: '"Du Hast", do Rammstein, é o cartão de visita do metal industrial para o grande público.',
    bandsH2: 'O industrial independente no Brasil',
    bandsIntro: 'O industrial brasileiro tem uma cena autoral criativa e barulhenta. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, confira nomes como:',
    bands: [
      { slug: 'mitsein', name: 'Mitsein', desc: 'de Brasília (DF), com uma sonoridade densa que passeia pelo industrial.' },
      { slug: 'nov88', name: 'NOV 88', desc: 'do Rio de Janeiro, cruzando metal industrial e synthpop sombrio.' },
      { slug: 'eddiehost', name: 'Drama', desc: 'do Rio de Janeiro, entre o hard rock e o industrial gótico.' },
      { slug: 'blackcoffee', name: 'Black Coffee', desc: 'de São Paulo, misturando industrial, nu metal e hardcore.' },
      { slug: 'dollflesh', name: 'Dollflesh', desc: 'de São Paulo, no peso eletrônico do metal industrial.' },
    ],
    whereH2: 'Onde ouvir metal industrial hoje',
    where: `Pra entrar na fábrica, explore o hub de ${A('https://tribhus.com.br/genero/metal-industrial', 'metal industrial')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. E veja também as ${A('https://blog.tribhus.com.br/bandas-de-nu-metal', 'bandas de nu metal')}, gênero vizinho.`,
    cta: 'o industrial nacional tem banda autoral fazendo barulho de máquina agora mesmo.',
    closing: 'Das máquinas de Ministry e Rammstein às bandas que reinventam o peso eletrônico hoje, o metal industrial segue distópico e dançante. Liga o som.',
  },
  {
    slug: 'bandas-de-rock-gospel',
    title: 'Rock gospel: as melhores bandas de rock cristão',
    excerpt: 'De Skillet e Stryper às bandas de rock cristão independentes do Brasil: o guia do rock gospel — e onde ouvi-las na Tribhus.',
    metaTitle: 'Rock gospel: as melhores bandas de rock cristão',
    metaDescription: 'Rock gospel: de Skillet e Stryper às bandas de rock cristão independentes do Brasil que você descobre e ouve na Tribhus.',
    focusKeyword: 'rock gospel',
    coverSrc: 'https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0?w=1600&q=80',
    coverCredit: 'Foto: Diane Picchiottino / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/6F5ct471oRk',
    tags: ['rock gospel', 'rock cristao', 'rock brasileiro', 'bandas independentes', 'metal cristao'],
    hubSlug: 'rock-cristao', hubLabel: 'rock cristão',
    intro: 'Peso, melodia e fé na mesma música: o <strong>rock gospel</strong> provou que dá pra unir energia de rock com mensagem cristã. Reunimos as melhores bandas de rock cristão que marcaram o gênero — e a cena independente brasileira do estilo, na Tribhus.',
    whatIsH2: 'O que é rock gospel (e rock cristão)',
    whatIs: 'O <strong>rock gospel</strong>, ou rock cristão, é o rock — em todas as suas vertentes, do pop ao metal — com letras e temática ligadas à fé cristã. Sonoramente, não fica devendo nada ao rock secular: tem peso, refrão e produção de primeira.',
    classicsH2: 'As bandas de rock cristão que marcaram época',
    classics: 'A história do gênero passa por pioneiros como o <strong>Stryper</strong> (metal cristão dos anos 80) e por nomes que estouraram no mainstream, como <strong>Skillet</strong>, <strong>P.O.D.</strong> e <strong>Switchfoot</strong>. No Brasil, clássicos como <strong>Oficina G3</strong> e <strong>Resgate</strong> abriram o caminho.',
    videoId: '1mjlM_RnsVE',
    videoCaption: '"Monster", do Skillet, é um dos maiores hinos do rock cristão no mundo.',
    bandsH2: 'O rock gospel independente no Brasil',
    bandsIntro: 'A cena cristã independente é forte e diversa. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, dá pra ouvir nomes como:',
    bands: [
      { slug: 'bandamx85', name: 'Banda MX85', desc: 'do Rio de Janeiro, com rock alternativo cristão autoral.' },
      { slug: 'nowayformalefactors', name: 'No Way For Malefactors', desc: 'de Alagoas, no peso do hardcore e do metal cristão.' },
      { slug: '7mergulhos', name: '7 Mergulhos', desc: 'do Rio de Janeiro, entre o nu metal e o rock cristão.' },
      { slug: 'ill', name: 'Illumnatum', desc: 'de São Paulo, com metalcore e rock alternativo cristão.' },
      { slug: 'jorger', name: 'Renovo Ap', desc: 'do Amapá, levando o rock cristão pro Norte do país.' },
    ],
    whereH2: 'Onde ouvir rock gospel hoje',
    where: `Pra ouvir mais, explore o hub de ${A('https://tribhus.com.br/genero/rock-cristao', 'rock cristão')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. E pra ampliar, veja o ${A('https://blog.tribhus.com.br/rock-nacional', 'panorama do rock nacional')}.`,
    cta: 'o rock cristão nacional tem banda autoral pesando com fé agora mesmo.',
    closing: 'Dos pioneiros que uniram peso e fé às bandas independentes de hoje, o rock gospel segue firme. Dá o play e descubra.',
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
  for (const c of CONFIGS) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: c.slug } })
    if (exists) { console.log(`[skip] ${c.slug} ja existe`); continue }
    const content = buildContent(c)
    const md = content.match(/(^|\n)#{1,4}\s|(^|\n)-\s|(^|\n)>\s|\*\*/g)
    if (md) { console.error(`ABORT ${c.slug}: markdown`, md); process.exit(1) }
    const cover = await uploadImageFromUrl(c.coverSrc)
    const tagIds = await upsertTags(c.tags)
    const post = await prisma.blogPost.create({
      data: {
        title: c.title, slug: c.slug, excerpt: c.excerpt, content,
        coverImage: cover.url, imageCredit: c.coverCredit, imageCreditUrl: c.coverCreditUrl,
        status: 'draft', featured: false, authorId: AUTHOR, categoryId: CAT,
        metaTitle: c.metaTitle, metaDescription: c.metaDescription, focusKeyword: c.focusKeyword,
      },
    })
    for (const tagId of tagIds) await prisma.blogPostTag.create({ data: { postId: post.id, tagId } }).catch(() => {})
    console.log(`[ok] ${c.slug} | mt ${c.metaTitle.length} | md ${c.metaDescription.length} | ${content.length} chars | cover ${cover.url.split('/').pop()}`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
