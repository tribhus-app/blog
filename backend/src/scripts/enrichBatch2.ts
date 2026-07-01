import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`
const VID = (id: string) => `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/${id}?rel=0"></iframe></div>`

interface Faq { q: string; a: string }
interface Cfg {
  slug: string; intro: string; whatIsH2: string; whatIs: string; recognizeH2: string; recognize: string[]
  historyH2: string; history: string; subH2?: string; sub?: string
  essentialsH2: string; essentials: string; videoId?: string; videoCaption?: string
  bandsH2: string; bandsIntro: string; faqH2: string; faq: Faq[]; whereH2: string; where: string; cta: string; closing: string
}

function build(c: Cfg, bandsUl: string): string {
  const blocks: string[] = [
    `<p>${c.intro}</p>`,
    `<h2>${c.whatIsH2}</h2>`, `<p>${c.whatIs}</p>`,
    `<h2>${c.recognizeH2}</h2>`, '<ul>' + c.recognize.map(i => `<li>${i}</li>`).join('') + '</ul>',
    `<h2>${c.historyH2}</h2>`, `<p>${c.history}</p>`,
  ]
  if (c.subH2 && c.sub) blocks.push(`<h2>${c.subH2}</h2>`, `<p>${c.sub}</p>`)
  blocks.push(`<h2>${c.essentialsH2}</h2>`, `<p>${c.essentials}</p>`)
  if (c.videoId) { blocks.push(VID(c.videoId)); if (c.videoCaption) blocks.push(`<p>${c.videoCaption}</p>`) }
  blocks.push(`<h2>${c.bandsH2}</h2>`, `<p>${c.bandsIntro}</p>`, bandsUl)
  blocks.push(`<p>Pra garimpar mais nomes do underground, entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}.</p>`)
  blocks.push(`<h2>${c.faqH2}</h2>`)
  for (const f of c.faq) blocks.push(`<p><strong>${f.q}</strong> ${f.a}</p>`)
  blocks.push(`<h2>${c.whereH2}</h2>`, `<p>${c.where}</p>`)
  blocks.push(`<blockquote><p><strong>Descubra na Tribhus:</strong> ${c.cta} ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`)
  blocks.push(`<p>${c.closing}</p>`)
  return blocks.join('\n\n')
}

const CFGS: Cfg[] = [
  {
    slug: 'bandas-de-death-metal',
    intro: 'Brutal, técnico e veloz: o death metal é um dos subgêneros mais extremos do metal — e também um dos mais ricos tecnicamente. Neste guia você entende o que é o death metal, como ele surgiu, como reconhecer o estilo, quais são as <strong>bandas de death metal</strong> essenciais e a cena independente brasileira do gênero, na Tribhus.',
    whatIsH2: 'O que é death metal',
    whatIs: `O <strong>death metal</strong> é uma vertente extrema do metal que leva agressividade, peso e técnica ao limite. Surgido a partir do thrash, define-se pelos vocais guturais (os "growls"), guitarras de afinação gravíssima, blast beats e estruturas que vão do brutal ao surpreendentemente complexo. Há um bom panorama do gênero na ${A('https://pt.wikipedia.org/wiki/Death_metal', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o death metal',
    recognize: [
      'Vocais guturais profundos (growls), muitas vezes incompreensíveis de propósito.',
      'Guitarras gravíssimas, com riffs em tremolo e palhetadas abafadas (palm mute).',
      'Blast beats e bumbo duplo veloz, com viradas técnicas.',
      'Mudanças bruscas de andamento e estruturas complexas.',
      'Letras sobre morte, horror, anatomia, guerra e temas extremos.',
    ],
    historyH2: 'Origem e história',
    history: 'O gênero nasceu em meados dos anos 80, evoluindo do thrash. <strong>Death</strong>, banda de <strong>Chuck Schuldiner</strong> na Flórida, é apontada como pioneira — daí ele ser chamado de "pai do death metal". A Flórida virou epicentro (com <strong>Morbid Angel</strong>, <strong>Obituary</strong> e <strong>Deicide</strong>), enquanto a Suécia criava o icônico "som de Estocolmo" (<strong>Entombed</strong>, <strong>Dismember</strong>). O Brasil tem peso pesado nessa cena, com nomes como <strong>Krisiun</strong> e <strong>Rebaelliun</strong>.',
    subH2: 'Subgêneros do death metal',
    sub: 'O estilo se ramificou muito: <strong>brutal death metal</strong> (peso máximo), <strong>technical death metal</strong> (virtuosismo), <strong>melodic death metal</strong> (a escola de Gotemburgo, mais melódica), <strong>death-doom</strong> (lento e pesado) e o <strong>deathcore</strong> (cruzamento com o metalcore).',
    essentialsH2: 'As bandas de death metal essenciais',
    essentials: 'Para entrar no gênero, comece por <strong>Death</strong>, <strong>Cannibal Corpse</strong>, <strong>Morbid Angel</strong>, <strong>Obituary</strong> e <strong>Deicide</strong> — e, no Brasil, pelo <strong>Krisiun</strong>, um dos nossos maiores nomes do metal extremo no mundo.',
    bandsH2: 'O death metal independente no Brasil (na Tribhus)',
    bandsIntro: `A cena brutal nacional é fervilhante. Na ${A('https://tribhus.com.br', 'Tribhus')}, dá pra ouvir nomes como:`,
    faqH2: 'Perguntas frequentes sobre death metal',
    faq: [
      { q: 'Qual a diferença entre death metal e black metal?', a: 'O death metal é mais brutal, técnico e "terreno", com vocais guturais graves; o black metal foca em atmosfera fria, tremolo e vocais agudos e rasgados.' },
      { q: 'Death metal e thrash metal são a mesma coisa?', a: 'Não. O death metal evoluiu do thrash, mas é mais pesado, mais grave e com vocais guturais — enquanto o thrash é mais veloz, com vocais gritados e mais "limpos".' },
      { q: 'Por que os vocais são guturais?', a: 'O growl faz parte da estética extrema do gênero: reforça a brutalidade e funciona quase como mais um instrumento de peso, não apenas como letra cantada.' },
    ],
    whereH2: 'Onde ouvir death metal hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/death-metal', 'death metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Curte o extremo? Veja também as ${A('https://blog.tribhus.com.br/bandas-de-black-metal', 'bandas de black metal')}.`,
    cta: 'a cena brutal independente brasileira tá fervendo — e cheia de banda nova.',
    closing: 'Do legado de Chuck Schuldiner aos porões do Brasil, o death metal segue brutal e técnico. Sobe o volume (e protege os tímpanos).',
  },
  {
    slug: 'bandas-de-thrash-metal',
    intro: 'Rápido, agressivo e cheio de riff: o thrash metal é a velocidade do metal levada ao extremo — e a base de boa parte do metal moderno. Neste guia você entende o que é o thrash, como ele surgiu, como reconhecer o estilo, quais são as <strong>bandas de thrash metal</strong> essenciais e a cena brasileira independente, na Tribhus.',
    whatIsH2: 'O que é thrash metal',
    whatIs: `O <strong>thrash metal</strong> juntou a velocidade e a fúria do punk e do hardcore com o peso e a técnica do heavy metal. O resultado: riffs picotados em alta velocidade, baterias frenéticas e uma energia que praticamente inventou o moshpit como conhecemos. Veja mais na ${A('https://pt.wikipedia.org/wiki/Thrash_metal', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o thrash metal',
    recognize: [
      'Riffs de guitarra rápidos e picotados (muito palm mute).',
      'Baterias velozes, com bumbo duplo e viradas agressivas.',
      'Solos técnicos e cheios de adrenalina.',
      'Vocais gritados, porém mais "limpos" que os guturais do death.',
      'Letras sobre guerra, política, crítica social e revolta.',
    ],
    historyH2: 'Origem e história',
    history: 'O thrash nasceu no início dos anos 80, unindo a New Wave of British Heavy Metal com a velocidade do hardcore. Os EUA criaram o "Big Four": <strong>Metallica</strong>, <strong>Slayer</strong>, <strong>Megadeth</strong> e <strong>Anthrax</strong>. A Alemanha respondeu com <strong>Kreator</strong>, <strong>Sodom</strong> e <strong>Destruction</strong>. E o Brasil entrou cedo e forte: <strong>Sepultura</strong>, <strong>Sarcófago</strong>, <strong>Korzus</strong> e <strong>Dorsal Atlântica</strong> fazem parte da história mundial do gênero.',
    subH2: 'Subgêneros do thrash',
    sub: 'Do thrash saíram vertentes como o <strong>crossover thrash</strong> (mistura com o hardcore punk) e o <strong>blackened thrash</strong> (com elementos de black metal). E foi do thrash que o death metal deu seus primeiros passos.',
    essentialsH2: 'As bandas de thrash metal essenciais',
    essentials: 'Comece pelo "Big Four" — <strong>Metallica</strong>, <strong>Slayer</strong>, <strong>Megadeth</strong> e <strong>Anthrax</strong> — e pelo nosso <strong>Sepultura</strong>, que levou o thrash brasileiro ao mundo. Um clássico que abriu as portas do metal pra muita gente:',
    videoId: 'CD-E-LDc384', videoCaption: '"Enter Sandman", do Metallica, é a porta de entrada de gerações inteiras no metal.',
    bandsH2: 'O thrash metal independente no Brasil (na Tribhus)',
    bandsIntro: `A nova geração do thrash brasileiro segue afiada. Na ${A('https://tribhus.com.br', 'Tribhus')}, confira nomes como:`,
    faqH2: 'Perguntas frequentes sobre thrash metal',
    faq: [
      { q: 'Qual a diferença entre thrash metal e speed metal?', a: 'Os dois são velozes, mas o speed metal mantém mais melodia e limpeza; o thrash é mais agressivo, "sujo" e influenciado pelo hardcore punk.' },
      { q: 'Quem é o "Big Four" do thrash?', a: 'Metallica, Slayer, Megadeth e Anthrax — as quatro bandas americanas que definiram e popularizaram o gênero nos anos 80.' },
      { q: 'O Sepultura é thrash metal?', a: 'O Sepultura começou no death/thrash e se tornou um dos maiores nomes do metal brasileiro no mundo, depois explorando também groove metal e ritmos brasileiros.' },
    ],
    whereH2: 'Onde ouvir thrash metal hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/thrash-metal', 'thrash metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também as ${A('https://blog.tribhus.com.br/bandas-de-heavy-metal-brasileiras', 'bandas de heavy metal brasileiras')}.`,
    cta: 'o thrash nacional tem riff novo sendo picotado agora mesmo.',
    closing: 'Do Big Four ao Sepultura, e do Sepultura à garotada que ensaia hoje, o thrash metal nunca desacelerou. Acelera junto.',
  },
  {
    slug: 'bandas-de-hard-rock',
    intro: 'Riff forte, volume alto e atitude: o hard rock é a espinha dorsal do rock pesado e um dos estilos mais influentes da música. Neste guia você entende o que é o hard rock, como ele surgiu, como reconhecer o estilo, quais são as <strong>bandas de hard rock</strong> essenciais e a cena nacional independente, na Tribhus.',
    whatIsH2: 'O que é hard rock',
    whatIs: `O <strong>hard rock</strong> nasceu no fim dos anos 60 levando o rock a um novo patamar de peso, com guitarras distorcidas, riffs marcantes e uma base bluesy. É potente sem ser extremo — o equilíbrio perfeito entre peso, melodia e refrão de cantar junto. Saiba mais na ${A('https://pt.wikipedia.org/wiki/Hard_rock', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o hard rock',
    recognize: [
      'Riffs de guitarra marcantes, encorpados e de base bluesy.',
      'Guitarra distorcida, mas ainda melódica e cheia de solos.',
      'Refrões fortes, feitos pra estádio.',
      'Vocais potentes e carismáticos.',
      'Pegada de palco: energia, volume e atitude.',
    ],
    historyH2: 'Origem e história',
    history: 'O hard rock se formou no fim dos anos 60 com bandas como <strong>Led Zeppelin</strong>, <strong>Deep Purple</strong> e <strong>The Who</strong>. Nos anos 70 ganhou o mundo com <strong>AC/DC</strong>, <strong>Aerosmith</strong> e <strong>Kiss</strong>; e nos anos 80 dominou as paradas na fase do glam/hair metal e com o <strong>Guns N’ Roses</strong>. É a ponte natural entre o rock clássico e o heavy metal.',
    subH2: 'Vertentes próximas',
    sub: 'O hard rock conversa de perto com o <strong>glam/hair metal</strong> (mais melódico e visual), o <strong>blues rock</strong> (sua raiz) e o <strong>southern rock</strong>. Muitas bandas transitam livremente entre esses rótulos.',
    essentialsH2: 'As bandas de hard rock essenciais',
    essentials: 'Não dá pra falar de hard rock sem <strong>AC/DC</strong>, <strong>Led Zeppelin</strong>, <strong>Deep Purple</strong>, <strong>Aerosmith</strong>, <strong>Van Halen</strong> e <strong>Guns N’ Roses</strong> — bandas que escreveram o manual do gênero. Um dos riffs mais reconhecíveis da história:',
    videoId: '1w7OgIMMRc4', videoCaption: '"Sweet Child O’ Mine", do Guns N’ Roses, virou sinônimo de hard rock no mundo todo.',
    bandsH2: 'O hard rock independente no Brasil (na Tribhus)',
    bandsIntro: `A cena nacional mantém o riff vivo. Na ${A('https://tribhus.com.br', 'Tribhus')}, ouça nomes como:`,
    faqH2: 'Perguntas frequentes sobre hard rock',
    faq: [
      { q: 'Qual a diferença entre hard rock e heavy metal?', a: 'O hard rock é mais bluesy, melódico e "radiofônico"; o heavy metal é mais pesado, rápido e sombrio. A fronteira é tênue, e muitas bandas transitam entre os dois.' },
      { q: 'Hard rock e classic rock são a mesma coisa?', a: 'Não exatamente. "Classic rock" é mais um rótulo de época/rádio (rock clássico das décadas de 60-80); o hard rock é um estilo específico, mais pesado, dentro desse universo.' },
      { q: 'Quais bandas começar a ouvir?', a: 'AC/DC e Guns N’ Roses são portas de entrada certeiras; depois, Led Zeppelin e Deep Purple para entender as raízes do gênero.' },
    ],
    whereH2: 'Onde ouvir hard rock hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/hard-rock', 'hard rock')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também o ${A('https://blog.tribhus.com.br/rock-nacional', 'panorama do rock nacional')}.`,
    cta: 'o hard rock nacional tem riff novo sendo gravado agora mesmo.',
    closing: 'Dos clássicos atemporais às bandas que ensaiam hoje, o hard rock segue alto e cheio de atitude. Sobe o volume.',
  },
  {
    slug: 'bandas-de-grunge',
    intro: 'Sujo, melódico e angustiado: o grunge pegou o rock alternativo e o jogou no topo do mundo nos anos 90, mudando a cara da música pop para sempre. Neste guia você entende o que é o grunge, como ele surgiu, como reconhecer o estilo, quais são as <strong>bandas de grunge</strong> essenciais e a cena independente brasileira, na Tribhus.',
    whatIsH2: 'O que é grunge',
    whatIs: `O <strong>grunge</strong> misturou o peso do metal, a crueza do punk e melodias melancólicas. Nascido em Seattle no fim dos anos 80, trouxe guitarras distorcidas, dinâmica entre o calmo e o explosivo, letras introspectivas e uma estética anti-glamour que definiu uma geração. Veja mais na ${A('https://pt.wikipedia.org/wiki/Grunge', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o grunge',
    recognize: [
      'Guitarras distorcidas e "sujas", com pedais de fuzz.',
      'Dinâmica de estrofe calma e refrão explosivo.',
      'Vocais angustiados, entre o melódico e o gritado.',
      'Letras introspectivas: alienação, angústia, crítica social.',
      'Estética anti-glamour (a famosa camisa de flanela).',
    ],
    historyH2: 'Origem e história',
    history: 'O grunge surgiu em Seattle no fim dos anos 80, em torno do selo independente <strong>Sub Pop</strong>. Em 1991, o álbum <em>Nevermind</em>, do <strong>Nirvana</strong>, estourou e levou o som do underground direto pro topo das paradas. <strong>Pearl Jam</strong>, <strong>Soundgarden</strong> e <strong>Alice in Chains</strong> completaram os "quatro grandes" de Seattle. Depois veio o pós-grunge, com nomes como <strong>Foo Fighters</strong>.',
    subH2: 'O pós-grunge',
    sub: 'Na esteira do estouro dos anos 90 surgiu o <strong>pós-grunge</strong>, mais polido e radiofônico, que dominou o rock mainstream no início dos anos 2000 com bandas como Foo Fighters, Bush e Creed.',
    essentialsH2: 'As bandas de grunge essenciais',
    essentials: 'A cena de Seattle revelou os quatro grandes: <strong>Nirvana</strong>, <strong>Pearl Jam</strong>, <strong>Soundgarden</strong> e <strong>Alice in Chains</strong>. O hino que estourou tudo:',
    videoId: 'hTWKbfoikeg', videoCaption: '"Smells Like Teen Spirit", do Nirvana, é o hino que levou o grunge ao mundo.',
    bandsH2: 'O grunge independente no Brasil (na Tribhus)',
    bandsIntro: `O espírito de Seattle vive na cena autoral brasileira. Na ${A('https://tribhus.com.br', 'Tribhus')}, ouça nomes como:`,
    faqH2: 'Perguntas frequentes sobre grunge',
    faq: [
      { q: 'Grunge e rock alternativo são a mesma coisa?', a: 'O grunge é um subgênero dentro do rock alternativo — uma de suas vertentes mais famosas, ligada à cena de Seattle.' },
      { q: 'Por que o grunge nasceu em Seattle?', a: 'A cidade tinha uma cena underground efervescente e o selo Sub Pop, que reuniu e lançou as primeiras bandas do movimento no fim dos anos 80.' },
      { q: 'O grunge acabou?', a: 'O auge passou em meados dos anos 90, mas a influência segue viva — no pós-grunge, no rock alternativo atual e em incontáveis bandas independentes.' },
    ],
    whereH2: 'Onde ouvir grunge hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/grunge', 'grunge')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também o ${A('https://blog.tribhus.com.br/rock-nacional-anos-80-90', 'rock nacional dos anos 80 e 90')}.`,
    cta: 'o grunge nacional tem banda autoral destilando angústia e melodia agora mesmo.',
    closing: 'Do porão de Seattle aos palcos independentes do Brasil, o grunge segue cru e honesto. Veste o flanela e dá o play.',
  },
]

async function run() {
  for (const c of CFGS) {
    const post = await prisma.blogPost.findUnique({ where: { slug: c.slug } })
    if (!post) { console.log(`[!] ${c.slug} nao encontrado`); continue }
    const ulMatch = post.content.match(/<ul>[\s\S]*?<\/ul>/)
    if (!ulMatch) { console.log(`[!] ${c.slug}: nao achei a lista de bandas`); continue }
    const content = build(c, ulMatch[0])
    const md = content.match(/(^|\n)#{1,4}\s|(^|\n)-\s|(^|\n)>\s|\*\*/g)
    if (md) { console.error(`ABORT ${c.slug}: markdown`, md); process.exit(1) }
    await prisma.blogPost.update({ where: { slug: c.slug }, data: { content } })
    const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
    console.log(`[ok] ${c.slug} | ~${words} palavras | ${content.length} chars`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
