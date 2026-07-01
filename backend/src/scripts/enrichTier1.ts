import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Faq { q: string; a: string }
const FAQS: Record<string, Faq[]> = {
  'dia-nacional-do-rock': [
    { q: 'Quando é o Dia Nacional do Rock?', a: 'No dia 13 de julho, todos os anos.' },
    { q: 'Por que o Dia do Rock é comemorado em 13 de julho?', a: 'É uma homenagem ao Live Aid, megafestival beneficente realizado nessa data em 1985.' },
    { q: 'Dia Nacional do Rock e Dia Mundial do Rock são a mesma coisa?', a: 'Sim. O nome oficial é "Dia Mundial do Rock", mas, curiosamente, a data só é celebrada no Brasil.' },
  ],
  'rock-nacional': [
    { q: 'O que é rock nacional?', a: 'É o rock feito no Brasil, com mais de meio século de história e identidade própria — geralmente com letras em português.' },
    { q: 'Quais são as melhores bandas de rock nacional?', a: 'Dos clássicos (Legião Urbana, Titãs, Os Paralamas do Sucesso) à nova geração independente que você encontra na Tribhus.' },
    { q: 'O rock nacional ainda existe?', a: 'Sim, e está mais vivo do que nunca — agora pulsando principalmente na cena independente.' },
  ],
  'rock-nacional-anos-80-90': [
    { q: 'Quais as principais bandas de rock nacional dos anos 80?', a: 'Legião Urbana, Titãs, Os Paralamas do Sucesso, Barão Vermelho, Capital Inicial e Engenheiros do Hawaii, entre outras.' },
    { q: 'Por que os anos 80 são considerados a era de ouro do BRock?', a: 'Foi quando o rock em português explodiu nas rádios e na TV, virando trilha sonora de uma geração inteira.' },
    { q: 'E o rock dos anos 90 no Brasil?', a: 'Os anos 90 trouxeram Skank, Jota Quest, Raimundos, Charlie Brown Jr. e, na virada para os 2000, Los Hermanos.' },
  ],
  'pop-rock-nacional': [
    { q: 'O que é pop rock nacional?', a: 'É o encontro do peso e da energia do rock com a melodia e a acessibilidade do pop, feito no Brasil — rock de cantar junto.' },
    { q: 'Quais as melhores bandas de pop rock nacional?', a: 'Nomes como Jota Quest, Capital Inicial, Skank, Lulu Santos e Kid Abelha, além de uma nova geração independente.' },
    { q: 'Qual a diferença entre pop rock e rock?', a: 'O pop rock prioriza melodia, refrão grudento e produção radiofônica, sem perder a base do rock.' },
  ],
  'bandas-de-heavy-metal-brasileiras': [
    { q: 'Quais as maiores bandas de heavy metal brasileiras?', a: 'Sepultura e Angra são os nomes mais conhecidos mundialmente, ao lado de pioneiros como Sarcófago, Korzus e Viper.' },
    { q: 'O Brasil tem uma cena de metal forte?', a: 'Sim, histórica e atual — uma das mais respeitadas do mundo, com forte cena underground independente.' },
    { q: 'Por onde começar a ouvir metal nacional?', a: 'Sepultura e Angra são portas de entrada certeiras; depois, vale explorar a cena independente atual.' },
  ],
  'shows-de-rock-no-brasil-2026': [
    { q: 'Quais os maiores festivais de rock do Brasil em 2026?', a: 'Rock in Rio, The Town, Lollapalooza Brasil, João Rock, Best of Blues and Rock e o Santa Bárbara Rock Fest, entre outros. Confira sempre as datas oficiais.' },
    { q: 'Como achar shows de rock perto de mim?', a: 'Pela agenda de eventos da Tribhus, filtrando pela sua cidade — e seguindo as bandas que você curte para saber quando elas tocam.' },
    { q: 'Onde ver bandas independentes ao vivo?', a: 'Em casas pequenas, bares e centros culturais, o ano todo. É onde a cena de rock independente mais acontece.' },
  ],
  'historias-do-rock': [
    { q: 'Qual banda é considerada a criadora do heavy metal?', a: 'O Black Sabbath — e o som pesado nasceu, em parte, de um acidente que fez o guitarrista Tony Iommi adaptar sua forma de tocar.' },
    { q: 'O que é o Clube dos 27?', a: 'O grupo de músicos que morreram aos 27 anos (como Hendrix, Janis Joplin e Kurt Cobain). É uma coincidência marcante, não uma "maldição" real.' },
    { q: 'Qual foi o primeiro videoclipe exibido na MTV?', a: '"Video Killed the Radio Star", do The Buggles, em 1º de agosto de 1981.' },
  ],
}

async function run() {
  for (const [slug, faq] of Object.entries(FAQS)) {
    const post = await prisma.blogPost.findUnique({ where: { slug } })
    if (!post) { console.log(`[!] ${slug} nao encontrado`); continue }
    if (post.content.includes('Perguntas frequentes')) { console.log(`[skip] ${slug} ja tem FAQ`); continue }
    const faqHtml = `<h2>Perguntas frequentes</h2>\n\n` +
      faq.map(f => `<p><strong>${f.q}</strong> ${f.a}</p>`).join('\n\n')
    if (!post.content.includes('<blockquote>')) { console.log(`[!] ${slug}: sem <blockquote> pra ancorar`); continue }
    const content = post.content.replace('<blockquote>', faqHtml + '\n\n<blockquote>')
    await prisma.blogPost.update({ where: { slug }, data: { content } })
    const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
    console.log(`[ok] ${slug} | FAQ adicionada | ~${words} palavras`)
  }
}
run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
