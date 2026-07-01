import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'rock-nacional'

// Imagem inline ja hospedada no MinIO (post #2) — reutilizada, sem novo upload.
const INLINE_URL =
  'https://blog.tribhus.com.br/minio-images/1781809442612-photo-1498038432885-c6f3f1b912ee'

const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

function buildContent(): string {
  return [
    `<p>O <strong>rock nacional</strong> é uma das páginas mais ricas da música brasileira: nasceu rebelde, atravessou décadas e segue se reinventando. Neste guia a gente faz um panorama do gênero — dos nomes que fundaram tudo às bandas independentes que escrevem o capítulo atual — e mostra onde ouvir cada um deles na Tribhus.</p>`,

    `<h2>O que é o rock nacional (e por que ele importa)</h2>`,
    `<p>Quando falamos em <strong>rock nacional</strong>, estamos falando de mais de meio século de música feita no Brasil com guitarra, atitude e identidade própria. O gênero misturou influências internacionais com letras em português, gírias locais e temas que iam do amor à crítica social — e virou trilha sonora de várias gerações.</p>`,
    `<p>Mais do que um estilo, o rock nacional é um movimento vivo: a cada década surgem novos nomes, novas cenas e novas formas de fazer barulho. E é exatamente por isso que ele não cabe só no passado.</p>`,

    `<h2>Os clássicos que fundaram o rock nacional</h2>`,
    `<p>Não dá pra entender o rock brasileiro sem passar pelos pioneiros. <strong>Raul Seixas</strong> abriu caminho ainda nos anos 70; nos anos 80, a explosão do gênero trouxe <strong>Legião Urbana</strong>, <strong>Titãs</strong>, <strong>Os Paralamas do Sucesso</strong>, <strong>Barão Vermelho</strong>, <strong>Capital Inicial</strong> e <strong>Engenheiros do Hawaii</strong>. No peso, o <strong>Sepultura</strong> levou o nome do Brasil ao mundo do metal.</p>`,
    `<p>Dois exemplos que continuam emocionando plateias inteiras:</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/5lqv3MlzOHQ?rel=0"></iframe></div>`,
    `<p>"Epitáfio", dos Titãs (lançada em 2002), é uma das canções mais queridas do rock nacional.</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/jkDLGRNIEYM?rel=0"></iframe></div>`,
    `<p>E "Meu Erro", dos Paralamas do Sucesso, é um hino que atravessou os anos 80 e nunca saiu das rádios.</p>`,

    `<h2>A nova geração: bandas de rock nacionais independentes</h2>`,
    `<p>Aqui mora a parte que pouca gente conhece — e que mais merece atenção. Longe das grandes gravadoras, centenas de <strong>bandas de rock nacionais</strong> seguem lançando música autoral, tocando em palcos pequenos e construindo público no boca a boca. Na ${A('https://tribhus.com.br', 'Tribhus')}, elas têm casa.</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${INLINE_URL}" alt="Guitarrista tocando ao vivo num show de rock">`,
    `<p><em>A nova geração do rock nacional se faz nos palcos independentes. Foto: Hector Bermudez / Unsplash.</em></p>`,
    `<p>Algumas das bandas autorais que estão tocando agora no Palco da Tribhus — no melhor espírito do pop rock, do indie e do rock alternativo nacional:</p>`,
    `<ul>` +
      `<li><p>${A('https://tribhus.com.br/bandas/velhoromeu', 'Velho Romeu')} — de Cachoeirinha (RS), entre o indie folk, o indie rock e o pop rock.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/ceudeoutono', 'Céu de Outono')} — de Belo Horizonte (MG), com um indie rock melódico de pegada pop.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/deva', 'Banda Deva')} — de Mogi das Cruzes (SP), transitando entre rock alternativo, rock and roll e progressivo.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/bandapsychotria', 'Psychotria')} — de São Paulo (SP), com indie rock, rock alternativo e climas psicodélicos.</p></li>` +
      `<li><p>${A('https://tribhus.com.br/bandas/andrebarroso', 'Andre Barroso e banda')} — de Niterói (RJ), no equilíbrio entre o pop rock e o hard rock.</p></li>` +
    `</ul>`,
    `<p>Quer um lugar pra trocar indicações e garimpar novidades? A tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')} é uma comunidade dedicada a descobrir bandas independentes do underground nacional.</p>`,

    `<h2>Onde ouvir e descobrir rock nacional hoje</h2>`,
    `<p>Se você quer mergulhar de vez, explore o ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} da Tribhus e navegue pelos hubs de estilo — do ${A('https://tribhus.com.br/genero/rock-alternativo', 'rock alternativo')} ao ${A('https://tribhus.com.br/genero/heavy-metal', 'heavy metal')} e ao ${A('https://tribhus.com.br/genero/grunge', 'grunge')}. E pra entender de onde vem a paixão nacional pelo gênero, vale ler também o nosso post sobre o ${A('https://blog.tribhus.com.br/dia-nacional-do-rock', 'Dia Nacional do Rock')}.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> o rock nacional não é só nostalgia — é uma cena viva e independente esperando pra ser ouvida. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,
    `<p>Dos pioneiros dos anos 70 às bandas que ensaiam hoje numa garagem, o rock nacional é uma história que ainda está sendo escrita. E você pode fazer parte do próximo capítulo: é só dar o play.</p>`,
  ].join('')
}

async function run() {
  const existing = await prisma.blogPost.findUnique({ where: { slug: SLUG } })
  if (!existing) { console.error(`Post nao encontrado: ${SLUG}`); process.exit(1) }

  const content = buildContent()
  const updated = await prisma.blogPost.update({ where: { slug: SLUG }, data: { content } })
  console.log(`[ok] Bandas do #2 atualizadas: ${updated.id} (status=${updated.status}) | content ${content.length} chars`)
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
