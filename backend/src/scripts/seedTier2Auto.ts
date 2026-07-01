import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()
const CAT = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a'
const AUTHOR = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

// Todas as bandas ja usadas em posts anteriores (NAO repetir).
const USED = new Set([
  'heliojairozancopeneto','osss','sagazorfeu','velhoromeu','ceudeoutono','deva','bandapsychotria','andrebarroso',
  'hugoalves','esmeraldo','vaziopesado','lyamusic7','caioarossetti','criacaso','sonnora','julianagatto','rodolfolemys',
  'bandafluaoficial','ultreya','bloodydragonband','symmetry','revolta','agressivium','bandabocarra','bertola','jhon',
  'disola','limboperdido','osvaldoo','indnine','nigro','bonecavoodoo','letargia','humerusbanda','aetherloreband',
  'codeveronica_oficial','tenotitlan','luiz_cyfer','ibmuz','necrocify','dorprofanablackmetal','mitsein','nov88',
  'eddiehost','blackcoffee','dollflesh','bandamx85','nowayformalefactors','7mergulhos','ill','jorger',
  // batch 2 (death/thrash/grunge):
  'shitaiband','kyos','felbandeira','saulorhcp','drfreeza','alan','meltinsun','biocidiooficial','amocme','onvecna11',
  'flourishedband','evorto','kapuzdfrade','antonsetti','lookintotheabyss',
])

interface Cfg {
  slug: string; title: string; excerpt: string; metaTitle: string; metaDescription: string; focusKeyword: string
  coverSrc: string; coverCredit: string; coverCreditUrl: string; tags: string[]
  hubSlug: string; genreFilter: string; genreLabel: string; limit: number
  intro: string; whatIsH2: string; whatIs: string; classicsH2: string; classics: string
  videoId?: string; videoCaption?: string; bandsH2: string; bandsIntro: string
  whereH2: string; where: string; cta: string; closing: string
}

async function pickBands(filter: string, limit: number) {
  const rows: any[] = await prisma.$queryRawUnsafe(`
    WITH top50 AS (
      SELECT m.id_banda,(COUNT(mp.id)*0.4)+(COUNT(CASE WHEN mp.created_at>=NOW()-INTERVAL '30 days' THEN 1 END)*0.6) s
      FROM musicas m JOIN musicas_plays mp ON m.id_musica=mp.id_musica WHERE m.status='aprovado' GROUP BY m.id_musica ORDER BY s DESC LIMIT 50)
    SELECT b.nome_banda AS nome, au.slug AS slug, b.cidade AS cidade, b.estado AS estado
    FROM banda b JOIN auth au ON au.auth_id=b.auth_id
    JOIN banda_genero bg ON bg.id_banda=b.id_banda JOIN genero_rock g ON g.id_genero=bg.id_genero AND (${filter})
    LEFT JOIN musicas m ON m.id_banda=b.id_banda
    WHERE au.slug IS NOT NULL
    GROUP BY b.id_banda, au.slug
    HAVING COUNT(DISTINCT m.id_musica) FILTER (WHERE m.deleted_at IS NULL AND m.status='aprovado')>=1
    ORDER BY (b.id_banda IN (SELECT id_banda FROM top50)) DESC,
             COUNT(DISTINCT m.id_musica) FILTER (WHERE m.deleted_at IS NULL AND m.status='aprovado') DESC
    LIMIT 40`)
  const out: any[] = []
  for (const r of rows) {
    if (USED.has(r.slug)) continue
    USED.add(r.slug)
    out.push(r)
    if (out.length >= limit) break
  }
  return out
}

function buildContent(c: Cfg, bands: any[]): string {
  const blocks: string[] = [
    `<p>${c.intro}</p>`, `<h2>${c.whatIsH2}</h2>`, `<p>${c.whatIs}</p>`,
    `<h2>${c.classicsH2}</h2>`, `<p>${c.classics}</p>`,
  ]
  if (c.videoId) {
    blocks.push(`<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/${c.videoId}?rel=0"></iframe></div>`)
    if (c.videoCaption) blocks.push(`<p>${c.videoCaption}</p>`)
  }
  blocks.push(`<h2>${c.bandsH2}</h2>`, `<p>${c.bandsIntro}</p>`)
  blocks.push('<ul>' + bands.map(b => `<li><strong>${A('https://tribhus.com.br/bandas/' + b.slug, b.nome.trim())}</strong> — de ${b.cidade ? b.cidade.trim() + ' (' + b.estado + ')' : b.estado}, ${c.genreLabel} autoral.</li>`).join('') + '</ul>')
  blocks.push(`<p>Pra garimpar mais nomes do underground, entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}.</p>`)
  blocks.push(`<h2>${c.whereH2}</h2>`, `<p>${c.where}</p>`)
  blocks.push(`<blockquote><p><strong>Descubra na Tribhus:</strong> ${c.cta} ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`)
  blocks.push(`<p>${c.closing}</p>`)
  return blocks.join('\n\n')
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

const CONFIGS_BATCH2_DONE: Cfg[] = [
  {
    slug: 'bandas-de-death-metal', title: 'Bandas de death metal essenciais (e a cena brasileira)',
    excerpt: 'De Death e Cannibal Corpse à cena brutal independente do Brasil: o guia das bandas de death metal — e onde ouvi-las na Tribhus.',
    metaTitle: 'Bandas de death metal essenciais e a cena brasileira',
    metaDescription: 'Bandas de death metal essenciais, de Death e Cannibal Corpse à cena brutal independente do Brasil que você ouve agora na Tribhus.',
    focusKeyword: 'bandas de death metal',
    coverSrc: 'https://images.unsplash.com/photo-1604514288114-3851479df2f2?w=1600&q=80',
    coverCredit: 'Foto: Tim Toomey / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/eiY4KJ62P5Q',
    tags: ['death metal', 'metal extremo', 'metal', 'bandas independentes', 'metal nacional'],
    hubSlug: 'death-metal', genreFilter: "g.nome_genero IN ('Death metal','Death Metal Progressivo','Deathcore')", genreLabel: 'death metal', limit: 5,
    intro: 'Brutal, técnico e veloz: o death metal é um dos subgêneros mais extremos do metal. Reunimos as <strong>bandas de death metal</strong> essenciais e a cena independente brasileira do gênero, na Tribhus.',
    whatIsH2: 'O que é death metal',
    whatIs: 'O <strong>death metal</strong> se define pelos vocais guturais, riffs de afinação grave, blast beats e uma agressividade sem trégua. É um dos gêneros mais técnicos e intensos do metal extremo.',
    classicsH2: 'As bandas de death metal essenciais',
    classics: 'O gênero foi moldado por nomes como <strong>Death</strong> (de Chuck Schuldiner, o "pai" do estilo), <strong>Cannibal Corpse</strong>, <strong>Morbid Angel</strong> e <strong>Obituary</strong>. O Brasil tem peso pesado nessa cena, com bandas como <strong>Krisiun</strong> e <strong>Rebaelliun</strong>.',
    bandsH2: 'O death metal independente no Brasil',
    bandsIntro: 'A cena brutal nacional é fervilhante. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, dá pra ouvir nomes como:',
    whereH2: 'Onde ouvir death metal hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/death-metal', 'death metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Curte o extremo? Veja também as ${A('https://blog.tribhus.com.br/bandas-de-black-metal', 'bandas de black metal')}.`,
    cta: 'a cena brutal independente brasileira tá fervendo — e cheia de banda nova.',
    closing: 'Do legado de Chuck Schuldiner aos porões do Brasil, o death metal segue brutal e técnico. Sobe o volume (e protege os tímpanos).',
  },
  {
    slug: 'bandas-de-thrash-metal', title: 'Bandas de thrash metal: dos clássicos à cena brasileira',
    excerpt: 'Do Big Four à cena brasileira independente: o guia das bandas de thrash metal — e onde ouvi-las na Tribhus.',
    metaTitle: 'Bandas de thrash metal: dos clássicos à cena brasileira',
    metaDescription: 'Bandas de thrash metal: do Big Four (Metallica, Slayer, Megadeth, Anthrax) à cena brasileira independente que você ouve na Tribhus.',
    focusKeyword: 'bandas de thrash metal',
    coverSrc: 'https://images.unsplash.com/photo-1546708770-589dab7b22c7?w=1600&q=80',
    coverCredit: 'Foto: Sebastian Ervi / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/uCZVEo8iT9Q',
    tags: ['thrash metal', 'metal', 'rock brasileiro', 'bandas independentes', 'metal nacional'],
    hubSlug: 'trash-metal', genreFilter: "g.nome_genero IN ('Trash Metal','Thrashcore')", genreLabel: 'thrash metal', limit: 5,
    intro: 'Rápido, agressivo e cheio de riff: o thrash metal é a velocidade do metal levada ao extremo. Aqui estão as <strong>bandas de thrash metal</strong> que definiram o gênero — e a cena brasileira independente, na Tribhus.',
    whatIsH2: 'O que é thrash metal',
    whatIs: 'O <strong>thrash metal</strong> juntou a velocidade e a fúria do punk com o peso e a técnica do heavy metal. Riffs picotados, baterias velozes e uma energia que inventou o moshpit como conhecemos.',
    classicsH2: 'As bandas de thrash metal essenciais',
    classics: 'O gênero é dominado pelo "Big Four": <strong>Metallica</strong>, <strong>Slayer</strong>, <strong>Megadeth</strong> e <strong>Anthrax</strong>. E o Brasil entrou cedo nessa: <strong>Sepultura</strong>, <strong>Sarcófago</strong>, <strong>Korzus</strong> e <strong>Dorsal Atlântica</strong> são parte da história mundial do thrash.',
    videoId: 'CD-E-LDc384',
    videoCaption: '"Enter Sandman", do Metallica, é a porta de entrada de gerações inteiras no metal.',
    bandsH2: 'O thrash metal independente no Brasil',
    bandsIntro: 'A nova geração do thrash brasileiro segue afiada. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, confira nomes como:',
    whereH2: 'Onde ouvir thrash metal hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/thrash-metal', 'thrash metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também as ${A('https://blog.tribhus.com.br/bandas-de-heavy-metal-brasileiras', 'bandas de heavy metal brasileiras')}.`,
    cta: 'o thrash nacional tem riff novo sendo picotado agora mesmo.',
    closing: 'Do Big Four ao Sepultura, e do Sepultura à garotada que ensaia hoje, o thrash metal nunca desacelerou. Acelera junto.',
  },
  {
    slug: 'bandas-de-grunge', title: 'Bandas de grunge: de Seattle à cena independente brasileira',
    excerpt: 'De Nirvana e Pearl Jam ao grunge independente do Brasil: o guia do gênero que mudou os anos 90 — e onde ouvi-lo na Tribhus.',
    metaTitle: 'Bandas de grunge: de Seattle à cena independente do Brasil',
    metaDescription: 'Bandas de grunge: de Nirvana e Pearl Jam ao grunge independente brasileiro que você descobre e ouve agora mesmo na Tribhus.',
    focusKeyword: 'bandas de grunge',
    coverSrc: 'https://images.unsplash.com/photo-1620577610365-86c411bad78d?w=1600&q=80',
    coverCredit: 'Foto: Chris Zhang / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/uGh-hHVPRYI',
    tags: ['grunge', 'rock alternativo', 'anos 90', 'bandas independentes', 'rock'],
    hubSlug: 'grunge', genreFilter: "g.nome_genero IN ('Grunge','Post-grunge')", genreLabel: 'grunge', limit: 5,
    intro: 'Sujo, melódico e angustiado: o grunge pegou o rock alternativo e o jogou no topo do mundo nos anos 90. Aqui estão as <strong>bandas de grunge</strong> que definiram o som — e a cena independente brasileira do estilo, na Tribhus.',
    whatIsH2: 'O que é grunge',
    whatIs: 'O <strong>grunge</strong> misturou o peso do metal, a crueza do punk e melodias melancólicas. Nascido em Seattle no fim dos anos 80, trouxe guitarras distorcidas, letras introspectivas e uma estética anti-glamour que definiu uma geração.',
    classicsH2: 'As bandas de grunge essenciais',
    classics: 'A cena de Seattle revelou os quatro grandes: <strong>Nirvana</strong>, <strong>Pearl Jam</strong>, <strong>Soundgarden</strong> e <strong>Alice in Chains</strong>. Depois vieram o pós-grunge e nomes como <strong>Foo Fighters</strong>, que levaram o som adiante.',
    videoId: 'hTWKbfoikeg',
    videoCaption: '"Smells Like Teen Spirit", do Nirvana, é o hino que estourou o grunge no mundo.',
    bandsH2: 'O grunge independente no Brasil',
    bandsIntro: 'O espírito de Seattle vive na cena autoral brasileira. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, ouça nomes como:',
    whereH2: 'Onde ouvir grunge hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/grunge', 'grunge')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também o ${A('https://blog.tribhus.com.br/rock-nacional-anos-80-90', 'rock nacional dos anos 80 e 90')}.`,
    cta: 'o grunge nacional tem banda autoral destilando angústia e melodia agora mesmo.',
    closing: 'Do porão de Seattle aos palcos independentes do Brasil, o grunge segue cru e honesto. Veste o flanela e dá o play.',
  },
]

const CONFIGS: Cfg[] = [
  {
    slug: 'bandas-de-hard-rock', title: 'Hard rock nacional: as melhores bandas (e os clássicos)',
    excerpt: 'Dos riffs clássicos do hard rock à cena nacional independente: o guia do gênero — e onde ouvir as bandas na Tribhus.',
    metaTitle: 'Hard rock nacional: as melhores bandas e os clássicos',
    metaDescription: 'Hard rock: dos riffs clássicos de AC/DC e Guns N’ Roses à cena nacional independente que você ouve agora mesmo na Tribhus.',
    focusKeyword: 'bandas de hard rock',
    coverSrc: 'https://images.unsplash.com/photo-1515890326200-a07ce46010a1?w=1600&q=80',
    coverCredit: 'Foto: Diego Ornelas-Tapia / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/man-playing-electric-guitar-inside-black-room-KazZtMYsPGs',
    tags: ['hard rock', 'rock', 'rock brasileiro', 'bandas independentes', 'classic rock'],
    hubSlug: 'hard-rock', genreFilter: "g.nome_genero='Hard rock'", genreLabel: 'hard rock', limit: 5,
    intro: 'Riff forte, volume alto e atitude: o hard rock é a espinha dorsal do rock pesado. Reunimos os clássicos que definiram o gênero e a cena nacional independente de <strong>bandas de hard rock</strong>, na Tribhus.',
    whatIsH2: 'O que é hard rock',
    whatIs: 'O <strong>hard rock</strong> nasceu no fim dos anos 60 com guitarras distorcidas, riffs marcantes e uma base bluesy. É potente sem ser extremo — o equilíbrio perfeito entre peso e refrão.',
    classicsH2: 'Os clássicos do hard rock',
    classics: 'Não dá pra falar de hard rock sem <strong>AC/DC</strong>, <strong>Led Zeppelin</strong>, <strong>Deep Purple</strong>, <strong>Aerosmith</strong>, <strong>Van Halen</strong> e <strong>Guns N’ Roses</strong> — bandas que escreveram o manual do gênero.',
    videoId: '1w7OgIMMRc4',
    videoCaption: '"Sweet Child O’ Mine", do Guns N’ Roses, tem um dos riffs mais reconhecíveis da história do rock.',
    bandsH2: 'O hard rock independente no Brasil',
    bandsIntro: 'A cena nacional mantém o riff vivo. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, ouça nomes como:',
    whereH2: 'Onde ouvir hard rock hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/hard-rock', 'hard rock')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também o ${A('https://blog.tribhus.com.br/rock-nacional', 'panorama do rock nacional')}.`,
    cta: 'o hard rock nacional tem riff novo sendo gravado agora mesmo.',
    closing: 'Dos clássicos atemporais às bandas que ensaiam hoje, o hard rock segue alto e cheio de atitude. Sobe o volume.',
  },
  {
    slug: 'bandas-de-punk-rock', title: 'Punk rock nacional: bandas que você precisa ouvir',
    excerpt: 'Dos clássicos do punk à cena nacional independente: o guia das bandas de punk rock — e onde ouvi-las na Tribhus.',
    metaTitle: 'Punk rock nacional: bandas que você precisa ouvir',
    metaDescription: 'Punk rock: dos Ramones e Sex Pistols à cena punk nacional independente que você descobre e ouve agora mesmo na Tribhus.',
    focusKeyword: 'bandas de punk rock',
    coverSrc: 'https://images.unsplash.com/photo-1692271931628-adc2b16670dd?w=1600&q=80',
    coverCredit: 'Foto: Roberto Rendon / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/-Ma-aFuivjs',
    tags: ['punk rock', 'punk', 'rock brasileiro', 'bandas independentes', 'underground'],
    hubSlug: 'punk-rock', genreFilter: "g.nome_genero='Punk rock'", genreLabel: 'punk rock', limit: 5,
    intro: 'Rápido, cru e direto ao ponto: o punk rock é atitude em estado puro. Aqui estão os clássicos que fundaram o gênero e a cena nacional independente de <strong>bandas de punk rock</strong>, na Tribhus.',
    whatIsH2: 'O que é punk rock',
    whatIs: 'O <strong>punk rock</strong> surgiu nos anos 70 como reação ao rock grandioso: músicas curtas, três acordes, energia e o lema do "faça você mesmo". Mais que som, é uma postura de independência total.',
    classicsH2: 'Os clássicos do punk rock',
    classics: 'O gênero foi fundado por <strong>Ramones</strong>, <strong>Sex Pistols</strong>, <strong>The Clash</strong> e <strong>Dead Kennedys</strong>. No Brasil, o punk fincou raiz forte com nomes como <strong>Inocentes</strong>, <strong>Ratos de Porão</strong> e <strong>Plebe Rude</strong>.',
    bandsH2: 'O punk rock independente no Brasil',
    bandsIntro: 'A cena punk nacional nunca parou. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, ouça nomes como:',
    whereH2: 'Onde ouvir punk rock hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/punk-rock', 'punk rock')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também as ${A('https://blog.tribhus.com.br/historias-do-rock', 'histórias do rock')}, onde contamos a origem do "faça você mesmo".`,
    cta: 'o punk nacional tem banda autoral fazendo barulho independente agora mesmo.',
    closing: 'Dos Ramones aos porões do Brasil, o punk rock segue cru, rápido e livre. Dá o play e levanta a poeira.',
  },
  {
    slug: 'bandas-de-hardcore', title: 'Hardcore brasileiro: do punk ao melódico',
    excerpt: 'Do hardcore punk ao melódico: o guia do gênero no Brasil — e onde ouvir as bandas independentes na Tribhus.',
    metaTitle: 'Hardcore brasileiro: do punk ao melódico',
    metaDescription: 'Hardcore: das raízes no punk dos anos 80 ao hardcore melódico, e a cena nacional independente que você ouve agora mesmo na Tribhus.',
    focusKeyword: 'hardcore punk',
    coverSrc: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=1600&q=80',
    coverCredit: 'Foto: Muneeb S / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/4_M8uIfPEZw',
    tags: ['hardcore', 'hardcore punk', 'punk', 'bandas independentes', 'underground'],
    hubSlug: 'hardcore', genreFilter: "g.nome_genero IN ('Hardcore','Hardcore punk','Hardcore melódico')", genreLabel: 'hardcore', limit: 5,
    intro: 'Mais rápido, mais pesado e mais intenso que o punk: o hardcore é energia pura. Reunimos as raízes do gênero e a cena nacional independente de bandas de <strong>hardcore punk</strong>, na Tribhus.',
    whatIsH2: 'O que é hardcore',
    whatIs: 'O <strong>hardcore</strong> nasceu como uma vertente mais veloz e agressiva do punk, no início dos anos 80. Com o tempo, ganhou ramificações — do hardcore melódico ao mais pesado —, mas manteve a urgência e a postura combativa.',
    classicsH2: 'As raízes do hardcore',
    classics: 'O gênero foi moldado por <strong>Black Flag</strong>, <strong>Minor Threat</strong> e <strong>Bad Brains</strong> nos EUA. No Brasil, nomes como <strong>Ratos de Porão</strong> e <strong>Dead Fish</strong> levaram o hardcore nacional pro mundo.',
    bandsH2: 'O hardcore independente no Brasil',
    bandsIntro: 'A cena hardcore nacional é intensa e unida. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, ouça nomes como:',
    whereH2: 'Onde ouvir hardcore hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/hardcore', 'hardcore')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também as ${A('https://blog.tribhus.com.br/bandas-de-punk-rock', 'bandas de punk rock')}.`,
    cta: 'o hardcore nacional tem banda autoral descarregando energia agora mesmo.',
    closing: 'Das raízes punk ao melódico, o hardcore brasileiro segue rápido, pesado e combativo. Entra no mosh.',
  },
  {
    slug: 'bandas-de-surf-rock', title: 'Surf music e surf rock: o som das pranchas',
    excerpt: 'Do clássico instrumental dos anos 60 à cena independente: o guia do surf rock — e onde ouvir as bandas na Tribhus.',
    metaTitle: 'Surf music e surf rock: o som das pranchas',
    metaDescription: 'Surf music: do clássico instrumental de Dick Dale e The Ventures à cena nacional independente que você ouve agora na Tribhus.',
    focusKeyword: 'surf music',
    coverSrc: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1600&q=80',
    coverCredit: 'Foto: Jefferson Santos / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/person-playing-guitar-fCEJGBzAkrU',
    tags: ['surf rock', 'surf music', 'rock instrumental', 'bandas independentes', 'rock'],
    hubSlug: 'surf-rock', genreFilter: "g.nome_genero IN ('Surf rock','Surf music')", genreLabel: 'surf rock', limit: 5,
    intro: 'Guitarra com reverb, energia praiana e aquele balanço inconfundível: a surf music é a trilha sonora das ondas. Aqui estão os clássicos do gênero e a cena nacional independente de <strong>surf music</strong>, na Tribhus.',
    whatIsH2: 'O que é surf music',
    whatIs: 'A <strong>surf music</strong> (ou surf rock) é um estilo nascido no início dos anos 60 na Califórnia, marcado por guitarras molhadas de reverb e melodias instrumentais vibrantes. É solar, dançante e atemporal.',
    classicsH2: 'Os clássicos do surf rock',
    classics: 'O gênero foi definido por <strong>Dick Dale</strong> (o "rei da surf guitar"), <strong>The Ventures</strong> e <strong>The Chantays</strong>. Décadas depois, "Misirlou" voltou à cultura pop na trilha de <em>Pulp Fiction</em>.',
    bandsH2: 'O surf rock independente no Brasil',
    bandsIntro: 'O som das pranchas também tem cena autoral por aqui. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, ouça nomes como:',
    whereH2: 'Onde ouvir surf rock hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/surf-rock', 'surf rock')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus.`,
    cta: 'o surf rock nacional tem banda autoral surfando ondas sonoras agora mesmo.',
    closing: 'Do reverb dos anos 60 às pranchas de hoje, a surf music segue solar e atemporal. Pega a onda.',
  },
  {
    slug: 'bandas-de-shoegaze-dream-pop', title: 'Dream pop e shoegaze: guia pra começar',
    excerpt: 'De My Bloody Valentine e Slowdive à cena nacional: o guia do dream pop e shoegaze — e onde ouvir as bandas na Tribhus.',
    metaTitle: 'Dream pop e shoegaze: guia pra começar a ouvir',
    metaDescription: 'Dream pop e shoegaze: de My Bloody Valentine e Slowdive à cena nacional independente que você ouve agora mesmo na Tribhus.',
    focusKeyword: 'dream pop',
    coverSrc: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=1600&q=80',
    coverCredit: 'Foto: Rocco Dipoppa / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/_uDj_lyPVpA',
    tags: ['dream pop', 'shoegaze', 'rock alternativo', 'bandas independentes', 'indie'],
    hubSlug: 'shoegazing', genreFilter: "g.nome_genero IN ('Shoegazing','Dream pop','Dream Pop')", genreLabel: 'dream pop e shoegaze', limit: 5,
    intro: 'Paredes de guitarra, vocais etéreos e uma atmosfera de sonho: o dream pop e o shoegaze são pura textura. Aqui está um guia pra começar — e a cena nacional independente de <strong>dream pop</strong> e shoegaze, na Tribhus.',
    whatIsH2: 'O que é dream pop e shoegaze',
    whatIs: 'O <strong>shoegaze</strong> empilha camadas de guitarra com efeitos e distorção, criando um "muro de som" envolvente; o <strong>dream pop</strong> é o primo mais melódico e atmosférico. Ambos priorizam clima e textura acima de tudo.',
    classicsH2: 'Os clássicos do gênero',
    classics: 'O shoegaze foi definido por <strong>My Bloody Valentine</strong>, <strong>Slowdive</strong> e <strong>Ride</strong>; o dream pop tem em <strong>Cocteau Twins</strong>, <strong>Mazzy Star</strong> e <strong>Beach House</strong> alguns de seus maiores nomes.',
    bandsH2: 'O dream pop e shoegaze independente no Brasil',
    bandsIntro: 'A cena de texturas também floresce por aqui. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, ouça nomes como:',
    whereH2: 'Onde ouvir dream pop e shoegaze hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/shoegazing', 'shoegaze')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus.`,
    cta: 'a cena de dream pop e shoegaze nacional tem banda autoral construindo muros de som agora mesmo.',
    closing: 'Das paredes de guitarra do shoegaze à melancolia do dream pop, é um universo pra se perder. Coloca o fone e mergulha.',
  },
  {
    slug: 'bandas-de-ska', title: 'Ska no Brasil: do clássico ao independente',
    excerpt: 'Do 2 Tone ao ska punk e à cena nacional: o guia do ska no Brasil — e onde ouvir as bandas na Tribhus.',
    metaTitle: 'Ska no Brasil: do clássico ao independente',
    metaDescription: 'Ska: das raízes jamaicanas e do 2 Tone à cena de ska nacional independente que você ouve agora mesmo na Tribhus.',
    focusKeyword: 'ska brasil',
    coverSrc: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=80',
    coverCredit: 'Foto: Nicholas Green / Unsplash', coverCreditUrl: 'https://unsplash.com/photos/nPz8akkUmDI',
    tags: ['ska', 'ska punk', 'rock brasileiro', 'bandas independentes', 'rock'],
    hubSlug: 'ska-punk', genreFilter: "g.nome_genero IN ('Ska punk','Ska','2 Tone')", genreLabel: 'ska', limit: 5,
    intro: 'Sopros, guitarra na contratempo e muita dança: o ska é contagiante. Aqui está o guia do gênero, das raízes à cena nacional independente de <strong>ska no Brasil</strong>, na Tribhus.',
    whatIsH2: 'O que é ska',
    whatIs: 'O <strong>ska</strong> nasceu na Jamaica nos anos 60 e influenciou o reggae; ganhou novas roupagens no <strong>2 Tone</strong> britânico e no <strong>ska punk</strong> dos anos 90. O traço comum: a guitarra marcando o contratempo e uma energia que não deixa ninguém parado.',
    classicsH2: 'Os clássicos do ska',
    classics: 'A história passa pelo 2 Tone de <strong>The Specials</strong> e <strong>Madness</strong> e pelo ska punk de <strong>Operation Ivy</strong> e <strong>Sublime</strong>. No Brasil, o ska sempre teve uma cena animada e festiva.',
    bandsH2: 'O ska independente no Brasil',
    bandsIntro: 'A cena de ska nacional é pura festa. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, ouça nomes como:',
    whereH2: 'Onde ouvir ska hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/ska-punk', 'ska punk')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus.`,
    cta: 'o ska nacional tem banda autoral botando todo mundo pra dançar agora mesmo.',
    closing: 'Das raízes jamaicanas aos palcos independentes do Brasil, o ska segue contagiante. Bora dançar.',
  },
]

async function run() {
  for (const c of CONFIGS) {
    if (await prisma.blogPost.findUnique({ where: { slug: c.slug } })) { console.log(`[skip] ${c.slug}`); continue }
    const bands = await pickBands(c.genreFilter, c.limit)
    if (bands.length === 0) { console.log(`[!] ${c.slug}: 0 bandas frescas — pulando`); continue }
    const content = buildContent(c, bands)
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
    console.log(`[ok] ${c.slug} | bandas: ${bands.map(b => b.slug).join(', ')} | mt ${c.metaTitle.length} md ${c.metaDescription.length}`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
