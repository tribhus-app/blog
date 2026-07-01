import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`
const B = (slug: string, name: string) => A('https://tribhus.com.br/bandas/' + slug, name)
const VID = (id: string) => `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/${id}?rel=0"></iframe></div>`

const POSTS: Record<string, string[]> = {
  'bandas-de-nu-metal': [
    `<p>Poucos gêneros definiram uma geração como o nu metal. Se você cresceu nos anos 2000 ouvindo guitarra de afinação grave, scratch de DJ e refrão pra gritar junto, este guia é pra você. Vamos do básico ao avançado: o que é o nu metal, como ele nasceu, como reconhecer o estilo de ouvido, quais são as <strong>bandas de nu metal</strong> essenciais — e, no fim, a nova geração do gênero que está rolando agora na cena independente brasileira, dentro da Tribhus.</p>`,
    `<h2>O que é nu metal</h2>`,
    `<p>O <strong>nu metal</strong> (às vezes grafado "nü metal") é um subgênero do metal alternativo que ganhou forma nos anos 90 misturando o peso do heavy metal com a batida e a atitude do hip-hop, do funk e da música eletrônica. Em vez da velocidade do thrash ou da técnica do metal progressivo, ele aposta no <strong>peso rítmico</strong>: groove pesado, refrão grudento e uma carga emocional crua. Para um panorama completo da história e das vertentes, vale a leitura do verbete na ${A('https://pt.wikipedia.org/wiki/Nu_metal', 'Wikipédia')}.</p>`,
    `<h2>Como reconhecer o nu metal</h2>`,
    `<p>Bateu a dúvida se uma música é nu metal? Procure por estas marcas:</p>`,
    `<ul>` +
      `<li>Guitarras de afinação bem grave (7 cordas ou <em>drop tuning</em>), com riffs mais "groovados" do que velozes.</li>` +
      `<li>Vocais que alternam canto melódico, rap e gritos — às vezes na mesma música.</li>` +
      `<li>Presença frequente de DJ, samplers e texturas eletrônicas.</li>` +
      `<li>Baixo encorpado e estalado, e bateria com pegada de groove/hip-hop.</li>` +
      `<li>Letras introspectivas: raiva, angústia, traumas, identidade e revolta.</li>` +
    `</ul>`,
    `<h2>História: do underground ao topo das paradas</h2>`,
    `<p>O nu metal tomou forma em meados dos anos 90, e o <strong>Korn</strong>, de Bakersfield (Califórnia), é creditado como a banda que desenhou o molde com seu álbum de estreia, em 1994. Na virada para os anos 2000, o gênero explodiu no mainstream: <strong>Limp Bizkit</strong>, <strong>Linkin Park</strong>, <strong>Slipknot</strong> e <strong>Papa Roach</strong> dominaram as rádios, a MTV e festivais como o Ozzfest. Depois de um pico avassalador, o estilo perdeu força comercial em meados da década — mas nunca desapareceu e, de uns anos pra cá, vive um <strong>revival</strong> forte, puxado por uma nova geração e pelo resgate dos clássicos.</p>`,
    `<h2>As bandas de nu metal essenciais</h2>`,
    `<p>Para entender o gênero, comece pelos nomes que o fundaram e popularizaram: <strong>Korn</strong>, <strong>Deftones</strong>, <strong>Linkin Park</strong>, <strong>Slipknot</strong>, <strong>Limp Bizkit</strong>, <strong>System of a Down</strong> e <strong>Papa Roach</strong>. Dois clássicos que definem o som:</p>`,
    VID('jRGrNDV2mKc'),
    `<p>"Freak on a Leash", do Korn, é praticamente a certidão de nascimento do nu metal.</p>`,
    VID('eVTXPUF4Oz4'),
    `<p>E "In the End", do Linkin Park, levou o gênero ao topo do mundo e a uma geração inteira.</p>`,
    `<h2>O nu metal nacional independente (na Tribhus)</h2>`,
    `<p>O gênero vive um bom momento no Brasil, com bandas autorais misturando peso, groove e identidade própria. Na ${A('https://tribhus.com.br', 'Tribhus')}, dá pra ouvir e seguir agora mesmo:</p>`,
    `<ul>` +
      `<li><strong>${B('bonecavoodoo', 'Boneca Voo Doo')}</strong> — de Estância Velha (RS), nu metal com tempero de metal industrial e psicodelia.</li>` +
      `<li><strong>${B('letargia', 'Letargia')}</strong> — de Salvador (BA), nu metal puro e prolífico, com vasto repertório autoral.</li>` +
      `<li><strong>${B('humerusbanda', 'HUMERUS')}</strong> — de São Paulo (SP), cruzando nu metal, grunge e hard rock.</li>` +
      `<li><strong>${B('aetherloreband', 'AETHERLORE')}</strong> — de Presidente Prudente (SP), nu metal somado a heavy e grunge.</li>` +
      `<li><strong>${B('codeveronica_oficial', 'Code Veronica')}</strong> — de Tubarão (SC), na pegada do nu metal revival.</li>` +
    `</ul>`,
    `<p>Quer mais peso? A tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')} é uma comunidade dedicada a indicar bandas independentes do underground nacional.</p>`,
    `<h2>Perguntas frequentes sobre nu metal</h2>`,
    `<p><strong>Qual a diferença entre nu metal e metal tradicional?</strong> O metal tradicional valoriza solos, velocidade e técnica; o nu metal prioriza groove, peso rítmico e incorpora hip-hop e eletrônica, com menos foco em solos de guitarra.</p>`,
    `<p><strong>Nu metal é a mesma coisa que metalcore?</strong> Não. O metalcore mistura metal extremo com hardcore (breakdowns e vocais guturais), enquanto o nu metal nasce do groove com hip-hop e funk.</p>`,
    `<p><strong>O nu metal voltou à moda?</strong> Sim. Desde o fim dos anos 2010 há um revival claro, com bandas novas surgindo e uma geração mais jovem redescobrindo os clássicos.</p>`,
    `<h2>Onde ouvir nu metal hoje</h2>`,
    `<p>Pra mergulhar no estilo, explore o hub de ${A('https://tribhus.com.br/genero/nu-metal', 'nu metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo completo de bandas')} da Tribhus. Curte o lado mais pesado em geral? Veja também o nosso guia das ${A('https://blog.tribhus.com.br/bandas-de-heavy-metal-brasileiras', 'bandas de heavy metal brasileiras')}.</p>`,
    `<blockquote><p><strong>Descubra na Tribhus:</strong> o nu metal nacional tem nome novo pesando agora mesmo — não fica só nos clássicos dos anos 2000. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,
    `<p>Dos riffs graves que marcaram uma geração às bandas que reinventam o peso hoje, o nu metal segue vivo e relevante. Sobe o volume e descobre a tua próxima favorita.</p>`,
  ],

  'bandas-de-black-metal': [
    `<p>Frio, cru e atmosférico: o black metal é um dos subgêneros mais extremos, cultuados e mal compreendidos do metal. Neste guia você vai entender o que é o black metal, como ele surgiu, como reconhecer o estilo, quais são as <strong>bandas de black metal</strong> essenciais — e a cena underground brasileira do gênero que pulsa hoje na Tribhus.</p>`,
    `<h2>O que é black metal</h2>`,
    `<p>O <strong>black metal</strong> é uma vertente extrema do metal marcada por guitarras em <em>tremolo picking</em>, baterias com <em>blast beats</em>, vocais rasgados e agudos e, acima de tudo, uma <strong>atmosfera sombria e gélida</strong>. A produção é muitas vezes propositalmente crua e lo-fi — não é falta de recurso, e sim parte da estética. Mais do que um som, é um clima. Há um bom panorama do gênero na ${A('https://pt.wikipedia.org/wiki/Black_metal', 'Wikipédia')}.</p>`,
    `<h2>Como reconhecer o black metal</h2>`,
    `<ul>` +
      `<li>Guitarras rápidas em tremolo, formando "paredes" de som.</li>` +
      `<li>Blast beats velozes e bateria intensa.</li>` +
      `<li>Vocais rasgados, agudos e guturais-agudos (o famoso "shriek").</li>` +
      `<li>Produção crua/lo-fi proposital e atmosfera fria e melancólica.</li>` +
      `<li>Temática ligada a natureza, inverno, escuridão, anticristianismo e misticismo.</li>` +
    `</ul>`,
    `<h2>Origem e história: das duas ondas</h2>`,
    `<p>A <strong>primeira onda</strong>, nos anos 80, foi puxada por bandas como <strong>Venom</strong> (que batizou o gênero com o álbum <em>Black Metal</em>), <strong>Bathory</strong>, <strong>Hellhammer</strong> e <strong>Mercyful Fate</strong>. A <strong>segunda onda</strong>, no início dos anos 90 na Noruega, definiu o som e a estética como conhecemos hoje, com <strong>Mayhem</strong>, <strong>Darkthrone</strong>, <strong>Emperor</strong>, <strong>Immortal</strong> e <strong>Burzum</strong> — uma cena tão influente quanto cercada de polêmicas. E o Brasil tem papel de honra nessa história: o <strong>Sarcófago</strong>, de Belo Horizonte, influenciou a estética e o som do black metal no mundo inteiro.</p>`,
    `<h2>Subgêneros do black metal</h2>`,
    `<p>O estilo se ramificou bastante: <strong>black metal sinfônico</strong> (com orquestrações), <strong>atmospheric/ambient black metal</strong> (foco em clima), <strong>DSBM</strong> (depressivo), <strong>pagan/viking black metal</strong> (temas ancestrais) e o cru <strong>raw black metal</strong>. Cada um puxa um fio diferente da mesma essência sombria.</p>`,
    `<h2>O black metal independente no Brasil (na Tribhus)</h2>`,
    `<p>Longe dos holofotes, uma cena underground mantém o gênero vivo e cru por aqui. Na ${A('https://tribhus.com.br', 'Tribhus')}, dá pra ouvir nomes como:</p>`,
    `<ul>` +
      `<li><strong>${B('tenotitlan', 'Tenotitlan')}</strong> — de Minas Gerais, no peso do metal extremo autoral.</li>` +
      `<li><strong>${B('luiz_cyfer', 'Sociedade Isolada')}</strong> — da Bahia, transitando pelo black e por várias vertentes do metal.</li>` +
      `<li><strong>${B('ibmuz', 'Ibmuz')}</strong> — do Rio de Janeiro, com a frieza característica do gênero.</li>` +
      `<li><strong>${B('necrocify', 'NECROCIFY')}</strong> — de Santa Catarina, no underground extremo.</li>` +
      `<li><strong>${B('dorprofanablackmetal', 'DÖR PRÖFANA')}</strong> — do Rio de Janeiro, black metal sem concessões.</li>` +
    `</ul>`,
    `<p>Pra garimpar mais nomes do underground, entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}.</p>`,
    `<h2>Perguntas frequentes sobre black metal</h2>`,
    `<p><strong>Black metal é a mesma coisa que death metal?</strong> Não. O black metal foca em atmosfera fria, tremolo e vocais agudos/rasgados; o death metal é mais brutal e técnico, com vocais guturais graves.</p>`,
    `<p><strong>Por que muitos discos têm som tão "cru"?</strong> A produção lo-fi é uma escolha estética: reforça a sensação crua, underground e sombria que define boa parte do gênero.</p>`,
    `<p><strong>O Brasil teve importância no black metal?</strong> Muita. O Sarcófago, de BH, é citado por bandas do mundo todo como influência direta na sonoridade e na estética do black metal.</p>`,
    `<h2>Onde ouvir black metal hoje</h2>`,
    `<p>Pra mergulhar na escuridão, explore o hub de ${A('https://tribhus.com.br/genero/black-metal', 'black metal')} e o ${A('https://tribhus.com.br/bandas', 'catálogo completo de bandas')} da Tribhus. Curte o extremo em geral? Veja também as ${A('https://blog.tribhus.com.br/bandas-de-death-metal', 'bandas de death metal')}.</p>`,
    `<blockquote><p><strong>Descubra na Tribhus:</strong> o black metal underground brasileiro está vivo e cru — esperando ouvidos corajosos. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,
    `<p>Da primeira onda dos anos 80 à Noruega gelada dos anos 90, e dos clássicos aos porões do Brasil, o black metal segue fiel à sua essência. Sobe o volume e mergulha no escuro.</p>`,
  ],

  'bandas-de-metal-industrial': [
    `<p>Peso de metal com a frieza das máquinas: o metal industrial (e o rock industrial) é um dos gêneros mais marcantes, teatrais e visuais do rock pesado. Neste guia você vai entender o que é o <strong>metal industrial</strong>, como ele surgiu, como reconhecer o estilo, quais são as bandas que o definiram — e a cena independente do gênero no Brasil, dentro da Tribhus.</p>`,
    `<h2>O que é metal industrial</h2>`,
    `<p>O <strong>metal industrial</strong> funde o peso das guitarras distorcidas com a estética da música industrial: batidas eletrônicas, samplers, drum machines, ruídos e texturas mecânicas. O resultado é ao mesmo tempo agressivo e dançante — um som que parece sair de uma fábrica distópica. Dá pra se aprofundar na história do gênero na ${A('https://pt.wikipedia.org/wiki/Metal_industrial', 'Wikipédia')}.</p>`,
    `<h2>Como reconhecer o metal industrial</h2>`,
    `<ul>` +
      `<li>Guitarras pesadas e repetitivas somadas a batidas eletrônicas e programações.</li>` +
      `<li>Uso de samplers, sintetizadores, drum machines e ruídos "metálicos".</li>` +
      `<li>Andamento marcado, quase mecânico — feito pra cabeça balançar em compasso.</li>` +
      `<li>Estética visual forte e teatral (especialmente ao vivo).</li>` +
      `<li>Atmosfera distópica, fria e muitas vezes provocativa.</li>` +
    `</ul>`,
    `<h2>Origem e história</h2>`,
    `<p>O gênero bebe da música industrial dos anos 70/80 (de nomes experimentais como Throbbing Gristle e Einstürzende Neubauten) e se consolidou como metal industrial no fim dos anos 80 e nos anos 90. <strong>Ministry</strong> e <strong>Nine Inch Nails</strong> abriram caminho; <strong>Godflesh</strong> e <strong>Fear Factory</strong> firmaram o peso; <strong>Marilyn Manson</strong> levou a provocação ao mainstream; e o <strong>Rammstein</strong>, com sua vertente alemã (a "Neue Deutsche Härte"), levou o industrial aos estádios do mundo todo.</p>`,
    `<h2>As bandas que definiram o rock industrial</h2>`,
    `<p>Os nomes incontornáveis do gênero incluem <strong>Ministry</strong>, <strong>Nine Inch Nails</strong>, <strong>Rammstein</strong>, <strong>Marilyn Manson</strong>, <strong>Fear Factory</strong> e <strong>KMFDM</strong>. O cartão de visita mais conhecido para o grande público:</p>`,
    VID('W3q8Od5qJio'),
    `<p>"Du Hast", do Rammstein, resume a força mecânica e teatral do metal industrial.</p>`,
    `<h2>O industrial independente no Brasil (na Tribhus)</h2>`,
    `<p>O industrial brasileiro tem uma cena autoral criativa e barulhenta. Na ${A('https://tribhus.com.br', 'Tribhus')}, confira nomes como:</p>`,
    `<ul>` +
      `<li><strong>${B('mitsein', 'Mitsein')}</strong> — de Brasília (DF), com uma sonoridade densa que passeia pelo industrial.</li>` +
      `<li><strong>${B('nov88', 'NOV 88')}</strong> — do Rio de Janeiro, cruzando metal industrial e synthpop sombrio.</li>` +
      `<li><strong>${B('eddiehost', 'Drama')}</strong> — do Rio de Janeiro, entre o hard rock e o industrial gótico.</li>` +
      `<li><strong>${B('blackcoffee', 'Black Coffee')}</strong> — de São Paulo, misturando industrial, nu metal e hardcore.</li>` +
      `<li><strong>${B('dollflesh', 'Dollflesh')}</strong> — de São Paulo, no peso eletrônico do metal industrial.</li>` +
    `</ul>`,
    `<p>Pra garimpar mais nomes do underground, entre na tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}.</p>`,
    `<h2>Perguntas frequentes sobre metal industrial</h2>`,
    `<p><strong>Qual a diferença entre metal industrial e rock industrial?</strong> É uma questão de intensidade: o rock industrial tende a ser mais leve e melódico, enquanto o metal industrial é mais pesado e guitarrístico — pense em Nine Inch Nails (mais rock) versus Rammstein ou Fear Factory (mais metal).</p>`,
    `<p><strong>Rammstein é metal industrial?</strong> Sim — é o nome mais popular do gênero, dentro da vertente alemã conhecida como "Neue Deutsche Härte".</p>`,
    `<p><strong>O que torna um som "industrial"?</strong> O uso das máquinas: samplers, drum machines, sintetizadores, ruídos e texturas eletrônicas combinados às guitarras pesadas.</p>`,
    `<h2>Onde ouvir metal industrial hoje</h2>`,
    `<p>Pra entrar na fábrica, explore o hub de ${A('https://tribhus.com.br/genero/metal-industrial', 'metal industrial')} e o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus. E veja também as ${A('https://blog.tribhus.com.br/bandas-de-nu-metal', 'bandas de nu metal')}, gênero vizinho.</p>`,
    `<blockquote><p><strong>Descubra na Tribhus:</strong> o industrial nacional tem banda autoral fazendo barulho de máquina agora mesmo. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,
    `<p>Das máquinas de Ministry e Rammstein às bandas que reinventam o peso eletrônico hoje, o metal industrial segue distópico e dançante. Liga o som.</p>`,
  ],
}

async function run() {
  for (const [slug, blocks] of Object.entries(POSTS)) {
    const content = blocks.join('\n\n')
    const md = content.match(/(^|\n)#{1,4}\s|(^|\n)-\s|(^|\n)>\s|\*\*/g)
    if (md) { console.error(`ABORT ${slug}: markdown`, md); process.exit(1) }
    const post = await prisma.blogPost.findUnique({ where: { slug } })
    if (!post) { console.log(`[!] ${slug} nao encontrado`); continue }
    await prisma.blogPost.update({ where: { slug }, data: { content } })
    const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
    console.log(`[ok] ${slug} enriquecido | ~${words} palavras | ${content.length} chars`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
