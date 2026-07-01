import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

interface Faq { q: string; a: string }
interface Cfg {
  slug: string; intro: string; whatIsH2: string; whatIs: string; recognizeH2: string; recognize: string[]
  historyH2: string; history: string; subH2?: string; sub?: string
  essentialsH2: string; essentials: string; bandsH2: string; bandsIntro: string
  faqH2: string; faq: Faq[]; whereH2: string; where: string; cta: string; closing: string
}

function build(c: Cfg, bandsUl: string): string {
  const b: string[] = [
    `<p>${c.intro}</p>`, `<h2>${c.whatIsH2}</h2>`, `<p>${c.whatIs}</p>`,
    `<h2>${c.recognizeH2}</h2>`, '<ul>' + c.recognize.map(i => `<li>${i}</li>`).join('') + '</ul>',
    `<h2>${c.historyH2}</h2>`, `<p>${c.history}</p>`,
  ]
  if (c.subH2 && c.sub) b.push(`<h2>${c.subH2}</h2>`, `<p>${c.sub}</p>`)
  b.push(`<h2>${c.essentialsH2}</h2>`, `<p>${c.essentials}</p>`)
  b.push(`<h2>${c.bandsH2}</h2>`, `<p>${c.bandsIntro}</p>`, bandsUl)
  b.push(`<p>Pra garimpar mais nomes do underground, entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}.</p>`)
  b.push(`<h2>${c.faqH2}</h2>`)
  for (const f of c.faq) b.push(`<p><strong>${f.q}</strong> ${f.a}</p>`)
  b.push(`<h2>${c.whereH2}</h2>`, `<p>${c.where}</p>`)
  b.push(`<blockquote><p><strong>Descubra na Tribhus:</strong> ${c.cta} ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`)
  b.push(`<p>${c.closing}</p>`)
  return b.join('\n\n')
}

const CFGS: Cfg[] = [
  {
    slug: 'bandas-de-surf-rock',
    intro: 'Guitarra com reverb, energia praiana e aquele balanço inconfundível: a surf music é a trilha sonora das ondas. Neste guia você entende o que é a surf music, como ela surgiu, como reconhecer o estilo, os clássicos do gênero e a cena independente brasileira, na Tribhus.',
    whatIsH2: 'O que é surf music',
    whatIs: `A <strong>surf music</strong> (ou surf rock) é um estilo nascido no início dos anos 60 na Califórnia, marcado por guitarras encharcadas de reverb e melodias instrumentais vibrantes. É solar, dançante e atemporal — a banda-sonora do verão e das pranchas. Veja mais na ${A('https://pt.wikipedia.org/wiki/Surf_music', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer a surf music',
    recognize: [
      'Guitarra com muito reverb (o som "molhado", característico).',
      'Melodias instrumentais marcantes e vibrantes.',
      'Uso de tremolo picking (palhetada rápida) nas guitarras.',
      'Andamento dançante e clima solar, praiano.',
      'Muitas faixas são instrumentais (sem vocal).',
    ],
    historyH2: 'Origem e história',
    history: 'A surf music explodiu na Califórnia no começo dos anos 60. <strong>Dick Dale</strong>, o "rei da surf guitar", popularizou o som "molhado" com clássicos como "Misirlou"; <strong>The Ventures</strong> e <strong>The Chantays</strong> ("Pipeline") consagraram a vertente instrumental, enquanto os <strong>Beach Boys</strong> levaram o surf para o lado vocal e pop. Décadas depois, "Misirlou" voltou à cultura pop na trilha de <em>Pulp Fiction</em> (1994).',
    subH2: 'Vertentes do surf',
    sub: 'O gênero tem dois grandes ramos: o <strong>surf instrumental</strong> (foco na guitarra, sem vocais) e o <strong>vocal surf</strong> (mais pop, à la Beach Boys). Sua estética também influenciou o garage rock e o punk.',
    essentialsH2: 'Os clássicos do surf rock',
    essentials: 'Para começar, ouça <strong>Dick Dale</strong>, <strong>The Ventures</strong> e <strong>The Chantays</strong> — e repare como esse som de guitarra reverberada ecoa em trilhas de cinema e em incontáveis bandas até hoje.',
    bandsH2: 'O surf rock independente no Brasil (na Tribhus)',
    bandsIntro: `O som das pranchas também tem cena autoral por aqui. Na ${A('https://tribhus.com.br', 'Tribhus')}, conheça nomes como:`,
    faqH2: 'Perguntas frequentes sobre surf music',
    faq: [
      { q: 'Surf music precisa falar sobre surfe?', a: 'Não. O nome vem da cultura do surfe da Califórnia dos anos 60, mas o estilo é definido pelo som (guitarra com reverb, melodias instrumentais), não pela letra.' },
      { q: 'Surf music é sempre instrumental?', a: 'Não, mas a vertente instrumental é a mais icônica. Há também o "vocal surf", mais pop, como o dos Beach Boys.' },
      { q: 'Por que conheço esse som de Pulp Fiction?', a: 'Porque a trilha do filme abre com "Misirlou", de Dick Dale — um dos maiores clássicos da surf music, o que reacendeu o interesse no gênero nos anos 90.' },
    ],
    whereH2: 'Onde ouvir surf rock hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/surf-rock', 'surf rock')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus.`,
    cta: 'o surf rock nacional tem banda autoral surfando ondas sonoras agora mesmo.',
    closing: 'Do reverb dos anos 60 às pranchas de hoje, a surf music segue solar e atemporal. Pega a onda.',
  },
  {
    slug: 'bandas-de-shoegaze-dream-pop',
    intro: 'Paredes de guitarra, vocais etéreos e uma atmosfera de sonho: o dream pop e o shoegaze são pura textura — gêneros pra mergulhar de fone no ouvido. Neste guia você entende o que são, como surgiram, como reconhecê-los, os clássicos e a cena independente brasileira, na Tribhus.',
    whatIsH2: 'O que é dream pop e shoegaze',
    whatIs: `O <strong>shoegaze</strong> empilha camadas de guitarra com efeitos (reverb, delay, fuzz), criando um "muro de som" envolvente, com vocais diluídos na mistura. O <strong>dream pop</strong> é o primo mais melódico e atmosférico. Ambos priorizam clima e textura acima de tudo. Veja mais na ${A('https://pt.wikipedia.org/wiki/Shoegazing', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o shoegaze e o dream pop',
    recognize: [
      '"Muros de som": muitas camadas de guitarra com efeitos.',
      'Vocais etéreos, suaves e diluídos na mistura (raramente no primeiro plano).',
      'Foco em textura e atmosfera, mais que em refrão.',
      'Uso intenso de pedais (reverb, delay, fuzz) — daí o nome "shoegaze".',
      'Andamento muitas vezes hipnótico e envolvente.',
    ],
    historyH2: 'Origem e história',
    history: 'O shoegaze surgiu no Reino Unido no fim dos anos 80 e início dos 90. O nome ("olhar os sapatos") veio do hábito dos músicos de ficarem olhando para baixo — para os pedais — no palco. <strong>My Bloody Valentine</strong> (com o disco <em>Loveless</em>), <strong>Slowdive</strong> e <strong>Ride</strong> definiram o estilo. O dream pop, mais melódico, tem em <strong>Cocteau Twins</strong>, <strong>Mazzy Star</strong> e <strong>Beach House</strong> alguns de seus maiores nomes.',
    subH2: 'Vertentes e revival',
    sub: 'O gênero teve forte revival nos anos 2010 (às vezes chamado de "nu gaze") e gerou cruzamentos curiosos, como o <strong>blackgaze</strong> (shoegaze com black metal). Dream pop e shoegaze costumam andar de mãos dadas com o indie e o rock alternativo.',
    essentialsH2: 'Os clássicos do gênero',
    essentials: 'Para começar no shoegaze, vá de <strong>My Bloody Valentine</strong>, <strong>Slowdive</strong> e <strong>Ride</strong>; no dream pop, <strong>Cocteau Twins</strong>, <strong>Mazzy Star</strong> e <strong>Beach House</strong>.',
    bandsH2: 'O dream pop e shoegaze independente no Brasil (na Tribhus)',
    bandsIntro: `A cena de texturas também floresce por aqui. Na ${A('https://tribhus.com.br', 'Tribhus')}, conheça nomes como:`,
    faqH2: 'Perguntas frequentes sobre shoegaze e dream pop',
    faq: [
      { q: 'Qual a diferença entre shoegaze e dream pop?', a: 'O shoegaze é mais barulhento e distorcido (muros de guitarra com efeitos); o dream pop é mais limpo, melódico e atmosférico. Eles se sobrepõem bastante.' },
      { q: 'Por que o nome "shoegaze"?', a: 'Porque os músicos costumavam tocar olhando para baixo — para a quantidade de pedais de efeito no chão —, parecendo "encarar os sapatos".' },
      { q: 'Shoegaze é a mesma coisa que indie?', a: 'Não, mas são primos: o shoegaze é um estilo específico dentro do guarda-chuva do rock alternativo/indie, definido pelo som de textura e pelos efeitos.' },
    ],
    whereH2: 'Onde ouvir dream pop e shoegaze hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/shoegazing', 'shoegaze')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus.`,
    cta: 'a cena de dream pop e shoegaze nacional tem banda autoral construindo muros de som agora mesmo.',
    closing: 'Das paredes de guitarra do shoegaze à melancolia do dream pop, é um universo pra se perder. Coloca o fone e mergulha.',
  },
  {
    slug: 'bandas-de-ska',
    intro: 'Sopros, guitarra na contratempo e muita dança: o ska é um dos gêneros mais contagiantes do rock. Neste guia você entende o que é o ska, como ele surgiu, como reconhecer o estilo, os clássicos e a cena independente brasileira, na Tribhus.',
    whatIsH2: 'O que é ska',
    whatIs: `O <strong>ska</strong> nasceu na Jamaica nos anos 60 e foi um dos precursores do reggae. Sua marca é a guitarra (ou o teclado) marcando o contratempo e uma seção de sopros animada, formando um som acelerado e dançante. Veja mais na ${A('https://pt.wikipedia.org/wiki/Ska', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o ska',
    recognize: [
      'Guitarra ou teclado marcando o contratempo (o famoso "chá-chá" no offbeat).',
      'Seção de sopros: trompete, trombone e saxofone.',
      'Andamento acelerado, alegre e dançante.',
      'Clima festivo e otimista.',
      'Parentesco audível com o reggae e o rocksteady.',
    ],
    historyH2: 'Origem e história',
    history: 'O ska surgiu na Jamaica no início dos anos 60, antes mesmo do reggae. Ganhou nova vida no fim dos anos 70 com o movimento <strong>2 Tone</strong> britânico (<strong>The Specials</strong>, <strong>Madness</strong>) e explodiu de novo nos anos 90 com a "terceira onda" e o <strong>ska punk</strong> americano (<strong>Operation Ivy</strong>, <strong>Sublime</strong>, <strong>Reel Big Fish</strong>). No Brasil, o ska sempre teve uma cena animada e festiva.',
    subH2: 'As "três ondas" do ska',
    sub: 'A história do ska costuma ser dividida em três ondas: a <strong>jamaicana</strong> original (anos 60), o <strong>2 Tone</strong> britânico (fim dos 70) e a <strong>terceira onda</strong> / ska punk (anos 90, principalmente nos EUA).',
    essentialsH2: 'Os clássicos do ska',
    essentials: 'Para começar, conheça o 2 Tone de <strong>The Specials</strong> e <strong>Madness</strong> e o ska punk de <strong>Operation Ivy</strong> e <strong>Sublime</strong> — e repare como o contratempo e os sopros deixam tudo dançante.',
    bandsH2: 'O ska independente no Brasil (na Tribhus)',
    bandsIntro: `A cena de ska nacional é pura festa. Na ${A('https://tribhus.com.br', 'Tribhus')}, conheça nomes como:`,
    faqH2: 'Perguntas frequentes sobre ska',
    faq: [
      { q: 'Qual a diferença entre ska e reggae?', a: 'O ska veio antes e é mais rápido e dançante; o reggae surgiu na sequência, mais lento e cadenciado. Ambos têm a marca do contratempo.' },
      { q: 'O que são "as três ondas do ska"?', a: 'As três grandes fases do gênero: a jamaicana original (anos 60), o 2 Tone britânico (fim dos 70) e a terceira onda / ska punk (anos 90).' },
      { q: 'Ska e punk se misturam?', a: 'Sim — o "ska punk" é justamente essa fusão, muito popular nos anos 90, somando a energia do punk aos sopros e ao contratempo do ska.' },
    ],
    whereH2: 'Onde ouvir ska hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/ska-punk', 'ska punk')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus.`,
    cta: 'o ska nacional tem banda autoral botando todo mundo pra dançar agora mesmo.',
    closing: 'Das raízes jamaicanas aos palcos independentes do Brasil, o ska segue contagiante. Bora dançar.',
  },
]

async function run() {
  for (const c of CFGS) {
    const post = await prisma.blogPost.findUnique({ where: { slug: c.slug } })
    if (!post) { console.log(`[!] ${c.slug} nao encontrado`); continue }
    const ulMatch = post.content.match(/<ul>[\s\S]*?<\/ul>/)
    if (!ulMatch) { console.log(`[!] ${c.slug}: sem lista de bandas`); continue }
    const content = build(c, ulMatch[0])
    const md = content.match(/(^|\n)#{1,4}\s|(^|\n)-\s|(^|\n)>\s|\*\*/g)
    if (md) { console.error(`ABORT ${c.slug}`, md); process.exit(1) }
    await prisma.blogPost.update({ where: { slug: c.slug }, data: { content } })
    const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
    console.log(`[ok] ${c.slug} | ~${words} palavras`)
  }
}
run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
