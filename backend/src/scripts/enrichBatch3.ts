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
  const b: string[] = [
    `<p>${c.intro}</p>`, `<h2>${c.whatIsH2}</h2>`, `<p>${c.whatIs}</p>`,
    `<h2>${c.recognizeH2}</h2>`, '<ul>' + c.recognize.map(i => `<li>${i}</li>`).join('') + '</ul>',
    `<h2>${c.historyH2}</h2>`, `<p>${c.history}</p>`,
  ]
  if (c.subH2 && c.sub) b.push(`<h2>${c.subH2}</h2>`, `<p>${c.sub}</p>`)
  b.push(`<h2>${c.essentialsH2}</h2>`, `<p>${c.essentials}</p>`)
  if (c.videoId) { b.push(VID(c.videoId)); if (c.videoCaption) b.push(`<p>${c.videoCaption}</p>`) }
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
    slug: 'bandas-de-rock-gospel',
    intro: 'Peso, melodia e fé na mesma música: o rock gospel provou que dá pra unir a energia do rock com uma mensagem cristã. Neste guia você entende o que é o rock gospel (ou rock cristão), como ele surgiu, como reconhecer o estilo, as bandas que marcaram época e a cena independente brasileira do gênero, na Tribhus.',
    whatIsH2: 'O que é rock gospel (e rock cristão)',
    whatIs: `O <strong>rock gospel</strong>, ou rock cristão, é o rock — em todas as suas vertentes, do pop ao metal — com letras e temática ligadas à fé cristã. Sonoramente, não fica devendo nada ao rock secular: tem peso, refrão e produção de primeira; o que muda é a mensagem. Veja mais na ${A('https://pt.wikipedia.org/wiki/Rock_cristão', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o rock gospel',
    recognize: [
      'Toda a instrumentação e o peso do rock secular — de pop rock a metal.',
      'Letras com temática cristã: fé, esperança, superação, espiritualidade.',
      'Produção e qualidade técnica equivalentes às do rock "de rádio".',
      'Circula tanto no meio cristão quanto no circuito secular de festivais.',
    ],
    historyH2: 'Origem e história',
    history: 'O gênero tem raízes no "Jesus Movement" dos anos 70 nos EUA. Nos anos 80, o <strong>Stryper</strong> levou o metal cristão ao mainstream; depois vieram nomes que estouraram para além do público cristão, como <strong>P.O.D.</strong>, <strong>Switchfoot</strong> e <strong>Skillet</strong>. No Brasil, clássicos como <strong>Oficina G3</strong>, <strong>Resgate</strong> e <strong>Catedral</strong> abriram o caminho e formaram gerações.',
    subH2: 'Vertentes do rock cristão',
    sub: 'Assim como o rock secular, o cristão tem suas vertentes: <strong>metal cristão</strong> (ou "metal branco"), <strong>hardcore cristão</strong>, <strong>rock alternativo cristão</strong> e <strong>metalcore cristão</strong>, entre outras. Praticamente todo estilo de rock tem sua contraparte de fé.',
    essentialsH2: 'As bandas de rock cristão que marcaram época',
    essentials: 'A história do gênero passa por <strong>Stryper</strong> (pioneiro do metal cristão), <strong>Skillet</strong>, <strong>P.O.D.</strong> e <strong>Switchfoot</strong> — e, no Brasil, por <strong>Oficina G3</strong> e <strong>Resgate</strong>. Um dos maiores hinos do rock cristão no mundo:',
    videoId: '1mjlM_RnsVE', videoCaption: '"Monster", do Skillet, mostra como o rock cristão pode ser pesado e radiofônico ao mesmo tempo.',
    bandsH2: 'O rock gospel independente no Brasil (na Tribhus)',
    bandsIntro: `A cena cristã independente é forte e diversa. Na ${A('https://tribhus.com.br', 'Tribhus')}, dá pra ouvir nomes como:`,
    faqH2: 'Perguntas frequentes sobre rock gospel',
    faq: [
      { q: 'Rock gospel e rock cristão são a mesma coisa?', a: 'Na prática, sim — são usados como sinônimos no Brasil para rock com temática cristã, embora "gospel" venha originalmente da música negra religiosa norte-americana.' },
      { q: 'Existe metal cristão de verdade?', a: 'Sim, e é forte: bandas como Stryper (clássica) e diversas bandas de metalcore e heavy cristão provam que dá pra unir peso extremo e fé.' },
      { q: 'Preciso ser cristão pra curtir?', a: 'Não. Muita gente curte o som independentemente da mensagem — assim como se ouve qualquer banda com letras sobre qualquer tema.' },
    ],
    whereH2: 'Onde ouvir rock gospel hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/rock-cristao', 'rock cristão')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também o ${A('https://blog.tribhus.com.br/rock-nacional', 'panorama do rock nacional')}.`,
    cta: 'o rock cristão nacional tem banda autoral pesando com fé agora mesmo.',
    closing: 'Dos pioneiros que uniram peso e fé às bandas independentes de hoje, o rock gospel segue firme. Dá o play e descubra.',
  },
  {
    slug: 'bandas-de-punk-rock',
    intro: 'Rápido, cru e direto ao ponto: o punk rock é atitude em estado puro — e uma filosofia de vida. Neste guia você entende o que é o punk rock, como ele surgiu, como reconhecer o estilo, as bandas que fundaram o gênero e a cena nacional independente, na Tribhus.',
    whatIsH2: 'O que é punk rock',
    whatIs: `O <strong>punk rock</strong> surgiu nos anos 70 como reação ao rock cada vez mais grandioso e técnico: músicas curtas e rápidas, geralmente com três acordes, muita energia e o lema do "faça você mesmo". Mais que um som, é uma postura de independência e contestação. Veja mais na ${A('https://pt.wikipedia.org/wiki/Punk_rock', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o punk rock',
    recognize: [
      'Músicas curtas, rápidas e diretas (raramente passam de 3 minutos).',
      'Estrutura simples — o famoso "três acordes e a verdade".',
      'Vocais cuspidos, com atitude, mais sobre energia que técnica.',
      'Letras de protesto, crítica social e anti-establishment.',
      'Estética e ética DIY (faça você mesmo): gravar, produzir e divulgar por conta própria.',
    ],
    historyH2: 'Origem e história',
    history: 'O punk explodiu em meados dos anos 70 em dois polos: Nova York (com <strong>Ramones</strong> e a cena do CBGB) e Londres (com <strong>Sex Pistols</strong> e <strong>The Clash</strong>). No Brasil, o punk fincou raiz forte nos anos 80, com nomes como <strong>Inocentes</strong>, <strong>Ratos de Porão</strong>, <strong>Cólera</strong>, <strong>Plebe Rude</strong> e <strong>Garotos Podres</strong>.',
    subH2: 'Subgêneros do punk',
    sub: 'Do punk nasceram inúmeras vertentes: <strong>hardcore punk</strong> (mais rápido e pesado), <strong>pop punk</strong> (mais melódico), <strong>street punk</strong>, <strong>Oi!</strong>, <strong>ska punk</strong> e <strong>skate punk</strong>, entre outras.',
    essentialsH2: 'As bandas de punk rock essenciais',
    essentials: 'O gênero foi fundado por <strong>Ramones</strong>, <strong>Sex Pistols</strong>, <strong>The Clash</strong> e <strong>Dead Kennedys</strong>. No Brasil, <strong>Inocentes</strong> e <strong>Ratos de Porão</strong> são leitura obrigatória pra entender o punk nacional.',
    bandsH2: 'O punk rock independente no Brasil (na Tribhus)',
    bandsIntro: `A cena punk nacional nunca parou. Na ${A('https://tribhus.com.br', 'Tribhus')}, ouça nomes como:`,
    faqH2: 'Perguntas frequentes sobre punk rock',
    faq: [
      { q: 'Qual a diferença entre punk rock e hardcore?', a: 'O hardcore é uma evolução do punk: mais rápido, mais pesado e mais intenso, surgida no início dos anos 80 a partir do punk.' },
      { q: 'O que é a ética "DIY"?', a: '"Do It Yourself" (faça você mesmo): a ideia de gravar, produzir, divulgar e organizar shows por conta própria, sem depender da indústria — um dos pilares do punk.' },
      { q: 'O punk acabou?', a: 'De jeito nenhum. Ele se ramificou em dezenas de estilos e segue vivo no underground do mundo todo, incluindo uma cena independente forte no Brasil.' },
    ],
    whereH2: 'Onde ouvir punk rock hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/punk-rock', 'punk rock')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também as ${A('https://blog.tribhus.com.br/historias-do-rock', 'histórias do rock')}, onde contamos a origem do "faça você mesmo".`,
    cta: 'o punk nacional tem banda autoral fazendo barulho independente agora mesmo.',
    closing: 'Dos Ramones aos porões do Brasil, o punk rock segue cru, rápido e livre. Dá o play e levanta a poeira.',
  },
  {
    slug: 'bandas-de-hardcore',
    intro: 'Mais rápido, mais pesado e mais intenso que o punk: o hardcore é energia pura, com um senso de comunidade que poucos gêneros têm. Neste guia você entende o que é o hardcore, como ele surgiu, como reconhecer o estilo, as bandas que o moldaram e a cena nacional independente, na Tribhus.',
    whatIsH2: 'O que é hardcore',
    whatIs: `O <strong>hardcore</strong> (ou hardcore punk) nasceu como uma vertente mais veloz e agressiva do punk, no início dos anos 80. Com o tempo, ganhou ramificações — do hardcore melódico ao mais pesado —, mas manteve a urgência, a postura combativa e um forte senso de cena e comunidade. Veja mais na ${A('https://pt.wikipedia.org/wiki/Hardcore_punk', 'Wikipédia')}.`,
    recognizeH2: 'Como reconhecer o hardcore',
    recognize: [
      'Mais rápido e pesado que o punk tradicional.',
      'Músicas curtas e intensas, com vocais gritados.',
      'Riffs simples e poderosos; em algumas vertentes, breakdowns.',
      'Forte senso de comunidade e de "cena".',
      'Letras de revolta, posicionamento político e mensagens pessoais.',
    ],
    historyH2: 'Origem e história',
    history: 'O hardcore se formou no início dos anos 80 nos EUA, com <strong>Black Flag</strong>, <strong>Minor Threat</strong>, <strong>Bad Brains</strong> e <strong>Dead Kennedys</strong>. Foi do Minor Threat que surgiu o movimento <strong>straight edge</strong> (sem drogas e álcool). No Brasil, o hardcore tem história forte com <strong>Ratos de Porão</strong>, <strong>Dead Fish</strong> e, na vertente mais melódica, nomes que chegaram ao grande público.',
    subH2: 'Subgêneros do hardcore',
    sub: 'O gênero gerou muitos ramos: <strong>hardcore melódico</strong>, <strong>post-hardcore</strong>, <strong>beatdown</strong>, <strong>straight edge</strong> e o <strong>metalcore</strong> (cruzamento com o metal), que viraria um fenômeno por conta própria.',
    essentialsH2: 'As bandas de hardcore essenciais',
    essentials: 'Para entender as raízes, comece por <strong>Black Flag</strong>, <strong>Minor Threat</strong> e <strong>Bad Brains</strong>. No Brasil, <strong>Ratos de Porão</strong> e <strong>Dead Fish</strong> levaram o hardcore nacional pro mundo.',
    bandsH2: 'O hardcore independente no Brasil (na Tribhus)',
    bandsIntro: `A cena hardcore nacional é intensa e unida. Na ${A('https://tribhus.com.br', 'Tribhus')}, ouça nomes como:`,
    faqH2: 'Perguntas frequentes sobre hardcore',
    faq: [
      { q: 'Qual a diferença entre hardcore e punk?', a: 'O hardcore é uma evolução do punk — mais rápido, mais pesado e mais intenso —, surgida nos EUA no começo dos anos 80.' },
      { q: 'O que é "straight edge"?', a: 'Um movimento dentro do hardcore, iniciado pelo Minor Threat, cujos adeptos optam por não usar drogas, álcool nem tabaco. Vira quase uma filosofia de vida.' },
      { q: 'Hardcore e metalcore são a mesma coisa?', a: 'Não. O metalcore nasce do cruzamento do hardcore com o metal (mais técnico, com breakdowns e vocais guturais); o hardcore tradicional é mais cru e direto.' },
    ],
    whereH2: 'Onde ouvir hardcore hoje',
    where: `Explore o hub de ${A('https://tribhus.com.br/genero/hardcore', 'hardcore')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. Veja também as ${A('https://blog.tribhus.com.br/bandas-de-punk-rock', 'bandas de punk rock')}.`,
    cta: 'o hardcore nacional tem banda autoral descarregando energia agora mesmo.',
    closing: 'Das raízes punk ao melódico, o hardcore brasileiro segue rápido, pesado e combativo. Entra no mosh.',
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
