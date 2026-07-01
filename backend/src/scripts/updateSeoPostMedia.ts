import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

const SLUG = 'dia-nacional-do-rock'

// 2a imagem (inline, no meio do corpo) — Unsplash, sera self-hospedada no MinIO.
const INLINE_IMAGE_SRC =
  'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=1400&q=80'

// HTML puro no padrao de producao (Tiptap): <p>, <h2>/<h3>, <iframe> de video no
// meio, <img> inline no meio, <blockquote> de CTA. Construido SEM quebras de linha
// (o PostContent.tsx converte \n em <br/>); por isso o array e juntado com '').
function buildContent(inlineImageUrl: string): string {
  return [
    `<p>Todo dia <strong>13 de julho</strong> o Brasil celebra o <strong>Dia Nacional do Rock</strong> — uma data que mistura nostalgia, guitarra distorcida e aquela sensação de pertencer a uma tribo. Mas de onde vem essa data? E, principalmente: quem mantém o rock vivo hoje, longe dos holofotes? Bora contar a história e te apresentar a cena independente que pulsa agora.</p>`,

    `<h2>O que é o Dia Nacional do Rock e por que cai em 13 de julho</h2>`,
    `<p>Apesar de muita gente buscar por "dia nacional do rock", o nome oficial da data é <strong>Dia Mundial do Rock</strong> — e aí mora a primeira curiosidade: ela só é comemorada no Brasil.</p>`,
    `<p>A escolha do 13 de julho é uma homenagem ao <strong>Live Aid</strong>, o megafestival beneficente realizado nesse dia em 1985. Organizado por Bob Geldof, o evento aconteceu simultaneamente no estádio de Wembley (Londres) e no John F. Kennedy Stadium (Filadélfia), com uma audiência estimada em 2 bilhões de pessoas pela TV. No palco, nomes como Queen, U2, David Bowie, Paul McCartney e Elton John se reuniram para arrecadar fundos contra a fome na Etiópia.</p>`,
    `<p>A data virou "do rock" por causa de um desejo manifestado por <strong>Phil Collins</strong>, que participou do evento e gostaria que aquele dia fosse lembrado como o dia mundial do rock. No Brasil, a celebração pegou de verdade por volta de 1990, quando rádios paulistanas dedicadas ao gênero — a 89 FM (antiga Rádio Rock) e a 97 FM — passaram a marcar a data na programação. No resto do mundo, curiosamente, o 13 de julho passa em branco.</p>`,
    `<ul><li><p>O nome correto é "Dia Mundial do Rock", mas na prática é uma comemoração nacional.</p></li><li><p>A origem está num festival beneficente — não no nascimento de uma banda ou artista.</p></li><li><p>Quem popularizou o 13 de julho no Brasil foi o rádio, não um decreto oficial.</p></li></ul>`,

    `<h2>Os clássicos que abriram o caminho</h2>`,
    `<p>Não dá pra falar de rock brasileiro sem citar quem fincou a bandeira. Nomes como <strong>Raul Seixas</strong>, <strong>Legião Urbana</strong>, <strong>Engenheiros do Hawaii</strong>, <strong>Titãs</strong>, <strong>Paralamas do Sucesso</strong>, <strong>Capital Inicial</strong> e <strong>Rita Lee</strong> ajudaram a moldar a identidade do rock nacional e seguem servindo de porta de entrada para novas gerações.</p>`,
    `<p>"Tempo Perdido", da Legião Urbana (do álbum <em>Dois</em>, de 1986), é praticamente um hino geracional — daqueles que toda plateia canta de olhos fechados:</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/zpzoG5KGaHg?rel=0"></iframe></div>`,
    `<p>Já "Metamorfose Ambulante", do baiano Raul Seixas (do disco <em>Krig-Ha, Bandolo!</em>, de 1973), resume o espírito inquieto e questionador que sempre definiu o rock por aqui:</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/CmB4sfoZkwo?rel=0"></iframe></div>`,

    `<h2>O rock não parou nos anos 80</h2>`,
    `<p>Existe um mito de que "o rock morreu" depois da era de ouro do rock nacional. A verdade é o oposto: ele saiu do mainstream e se espalhou. Hoje, milhares de bandas autorais lançam discos, fazem shows e constroem público — muitas vezes de forma 100% independente, sem gravadora e sem espaço na grande mídia.</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${inlineImageUrl}" alt="Plateia de show de rock com palco iluminado">`,
    `<p><em>O rock segue vivo nos palcos independentes Brasil afora. Foto: Muneeb S / Unsplash.</em></p>`,
    `<p>É aí que entra o lado mais bonito do <strong>Dia Nacional do Rock</strong>: além de relembrar os clássicos, ele é a chance perfeita de descobrir quem está fazendo barulho agora. Afinal, todos os grandes nomes que você ama um dia também foram bandas pequenas tocando para pouca gente.</p>`,

    `<h2>As bandas independentes que carregam a chama hoje</h2>`,
    `<p>Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a> — a rede social feita para a música independente — a cena nacional está viva e diversa. Alguns exemplos de bandas autorais que você pode ouvir e seguir agora mesmo:</p>`,
    `<ul><li><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/heliojairozancopeneto">WOOLLOONGABBAS</a> — direto de Goiânia (GO), com um caldeirão que vai do blues rock ao hard rock e ao rock alternativo.</p></li><li><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/osss">OSSONGS</a> — de Balneário Camboriú (SC), passeando pelo indie rock, grunge e rock alternativo.</p></li><li><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/sagazorfeu">Sagaz Orfeu</a> — de São Paulo, com pegada de rock alternativo, psicodélico e progressivo.</p></li></ul>`,
    `<p>Quer ir mais fundo no garimpo? A tribo <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/tribos/radar-subterraneo">Radar Subterrâneo</a> é uma comunidade dedicada a indicar bandas independentes e descobertas do underground — exatamente o espírito que o Dia do Rock pede. E se você curte um estilo específico, vale explorar o hub de <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/genero/rock-alternativo">rock alternativo</a> ou navegar pelo <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas">catálogo completo de bandas</a> da plataforma.</p>`,

    `<h2>Como celebrar o Dia do Rock em 2026</h2>`,
    `<p>Comemorar o <strong>Dia Nacional do Rock</strong> pode ser simples: monte uma playlist com os clássicos, sim — mas reserve um espaço para uma banda que você nunca ouviu antes. Compartilhe a descoberta, vá a um show de uma banda local, comente no perfil do artista. É esse tipo de gesto que mantém a cena de pé.</p>`,
    `<blockquote><p><strong>Descubra na Tribhus:</strong> ouça, comente e siga as bandas independentes que estão escrevendo o próximo capítulo do rock nacional. <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas">Explore o catálogo de bandas &rarr;</a></p></blockquote>`,
    `<p>O rock não é só memória. Ele é o som que continua nascendo em garagens, estúdios caseiros e palcos pequenos Brasil afora. Neste 13 de julho, celebre o passado — e dê o play no futuro.</p>`,
  ].join('')
}

async function run() {
  const existing = await prisma.blogPost.findUnique({ where: { slug: SLUG } })
  if (!existing) {
    console.error(`Post nao encontrado: ${SLUG}`)
    process.exit(1)
  }

  let inlineImageUrl = INLINE_IMAGE_SRC
  try {
    console.log(`Subindo imagem inline para o MinIO: ${INLINE_IMAGE_SRC}`)
    const up = await uploadImageFromUrl(INLINE_IMAGE_SRC)
    inlineImageUrl = up.url
    console.log(`Imagem inline salva: ${inlineImageUrl}`)
  } catch (e) {
    console.error('Falha no upload da imagem inline:', e)
    process.exit(1)
  }

  const content = buildContent(inlineImageUrl)

  const updated = await prisma.blogPost.update({
    where: { slug: SLUG },
    data: { content },
  })

  console.log(`[ok] Conteudo atualizado: ${updated.id} (status=${updated.status})`)
  console.log(`     content: ${content.length} chars`)
}

run()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
