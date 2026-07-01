import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

// IDs reais consultados no banco de producao (tribhus_db) em 18/06/2026:
//   curiosidades -> 1aef0f7e-20ec-44a0-b2f2-3c1e645d232a
//   autor Tribhus -> f0951ac2-8f21-433e-98ba-d4a14a832fc3
const CATEGORY_CURIOSIDADES = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a'
const AUTHOR_TRIBHUS = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'

interface SeoPost {
  title: string
  slug: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  focusKeyword: string
  content: string
  categoryId: string
  imageUrl: string
  imageCredit: string
  imageCreditUrl: string
  tags: string[]
}

const posts: SeoPost[] = [
  {
    title: 'Dia Nacional do Rock: a história da data e quem mantém a chama viva',
    slug: 'dia-nacional-do-rock',
    excerpt:
      'Todo 13 de julho o Brasil celebra o rock. Saiba de onde vem a data — e conheça as bandas independentes que carregam a chama hoje na Tribhus.',
    metaTitle: 'Dia Nacional do Rock: a história da data e o rock que vive hoje',
    metaDescription:
      'Por que o Dia Nacional do Rock cai em 13 de julho, dos clássicos como Legião e Raul Seixas às bandas independentes que mantêm o rock vivo na Tribhus.',
    focusKeyword: 'dia nacional do rock',
    categoryId: CATEGORY_CURIOSIDADES,
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80',
    imageCredit: 'Foto: Nainoa Shizuru / Unsplash',
    imageCreditUrl: 'https://unsplash.com/photos/NcdG9mK3PBY',
    tags: ['rock nacional', 'dia do rock', 'rock independente', 'bandas independentes'],
    content: `Todo dia 13 de julho o Brasil celebra o **Dia Nacional do Rock** — uma data que mistura nostalgia, guitarra distorcida e aquela sensação de pertencer a uma tribo. Mas você sabe de onde vem essa data? E, mais importante: quem são os artistas que mantêm o rock vivo hoje, longe dos holofotes? Neste guia a gente conta a história e te apresenta a cena independente que pulsa agora.

## O que é o Dia Nacional do Rock e por que cai em 13 de julho

Apesar de muita gente buscar por "dia nacional do rock", o nome oficial da data é **Dia Mundial do Rock** — e aí mora a primeira curiosidade: ela só é comemorada no Brasil.

A escolha do 13 de julho é uma homenagem ao **Live Aid**, o megafestival beneficente realizado nesse dia em 1985. Organizado por Bob Geldof, o evento aconteceu simultaneamente no estádio de Wembley (Londres) e no John F. Kennedy Stadium (Filadélfia), com uma audiência estimada em 2 bilhões de pessoas pela TV. No palco, nomes como Queen, U2, David Bowie, Paul McCartney e Elton John se reuniram para arrecadar fundos contra a fome na Etiópia.

A data virou "do rock" por causa de um desejo manifestado por **Phil Collins**, que participou do evento e gostaria que aquele dia fosse lembrado como o dia mundial do rock. No Brasil, a celebração pegou de verdade por volta de 1990, quando rádios paulistanas dedicadas ao gênero — a 89 FM (antiga Rádio Rock) e a 97 FM — passaram a marcar a data na programação. No resto do mundo, curiosamente, o 13 de julho passa em branco.

Resumindo as curiosidades da data:

- O nome correto é "Dia Mundial do Rock", mas na prática é uma comemoração nacional.
- A origem está num festival beneficente, não no nascimento de uma banda ou de um artista.
- Quem popularizou o 13 de julho no Brasil foi o rádio, não um decreto oficial.

## Os clássicos que abriram o caminho

Não dá pra falar de rock brasileiro sem citar quem fincou a bandeira. Nomes como **Raul Seixas**, **Legião Urbana**, **Engenheiros do Hawaii**, **Titãs**, **Paralamas do Sucesso**, **Capital Inicial** e **Rita Lee** ajudaram a moldar a identidade do rock nacional e seguem servindo de porta de entrada para novas gerações.

Dois exemplos que continuam atravessando o tempo:

https://www.youtube.com/watch?v=zpzoG5KGaHg

"Tempo Perdido", da Legião Urbana (do álbum *Dois*, de 1986), é praticamente um hino geracional — daqueles que toda plateia canta de olhos fechados.

https://www.youtube.com/watch?v=CmB4sfoZkwo

E "Metamorfose Ambulante", do baiano Raul Seixas (do disco *Krig-Ha, Bandolo!*, de 1973), resume o espírito inquieto e questionador que sempre definiu o rock por aqui.

## O rock não parou nos anos 80

Existe um mito de que "o rock morreu" depois da era de ouro do rock nacional. A verdade é o oposto: ele saiu do mainstream e se espalhou. Hoje, milhares de bandas autorais lançam discos, fazem shows e constroem público — muitas vezes de forma 100% independente, sem gravadora e sem espaço na grande mídia.

É aí que entra o lado mais bonito do **Dia Nacional do Rock**: além de relembrar os clássicos, ele é a chance perfeita de descobrir quem está fazendo barulho agora. Afinal, todos os grandes nomes que você ama um dia também foram bandas pequenas tocando para pouca gente.

## As bandas independentes que carregam a chama hoje

Na <a href="https://tribhus.com.br" target="_blank" rel="noopener noreferrer">Tribhus</a> — a rede social feita para a música independente — a cena nacional está viva e diversa. Alguns exemplos de bandas autorais que você pode ouvir e seguir agora mesmo:

- <a href="https://tribhus.com.br/bandas/heliojairozancopeneto" target="_blank" rel="noopener noreferrer">WOOLLOONGABBAS</a> — direto de Goiânia (GO), com um caldeirão que vai do blues rock ao hard rock e ao rock alternativo.
- <a href="https://tribhus.com.br/bandas/rossattie" target="_blank" rel="noopener noreferrer">Rossattie</a> — do Rio Grande do Sul, transitando entre o rock alternativo e o pop punk.
- <a href="https://tribhus.com.br/bandas/sagazorfeu" target="_blank" rel="noopener noreferrer">Sagaz Orfeu</a> — de São Paulo, com uma pegada de rock alternativo, psicodélico e progressivo.

Quer ir mais fundo no garimpo? A tribo <a href="https://tribhus.com.br/tribos/radar-subterraneo" target="_blank" rel="noopener noreferrer">Radar Subterrâneo</a> é uma comunidade dedicada a indicar bandas independentes e descobertas do underground — exatamente o espírito que o Dia do Rock pede.

E se você curte um estilo específico, vale explorar o hub de <a href="https://tribhus.com.br/genero/rock-alternativo" target="_blank" rel="noopener noreferrer">rock alternativo</a> ou navegar pelo <a href="https://tribhus.com.br/bandas" target="_blank" rel="noopener noreferrer">catálogo completo de bandas</a> da plataforma.

## Como celebrar o Dia do Rock em 2026

Comemorar o **Dia Nacional do Rock** pode ser simples: monte uma playlist com os clássicos, sim — mas reserve um espaço para uma banda que você nunca ouviu antes. Compartilhe a descoberta, vá a um show de uma banda local, comente no perfil do artista. É esse tipo de gesto que mantém a cena de pé.

> **Descubra na Tribhus:** ouça, comente e siga as bandas independentes que estão escrevendo o próximo capítulo do rock nacional. <a href="https://tribhus.com.br/bandas" target="_blank" rel="noopener noreferrer">Explore o catálogo de bandas →</a>

O rock não é só memória. Ele é o som que continua nascendo em garagens, estúdios caseiros e palcos pequenos Brasil afora. Neste 13 de julho, celebre o passado — e dê o play no futuro.`,
  },
]

async function upsertTags(tagNames: string[]): Promise<string[]> {
  const ids: string[] = []
  for (const name of tagNames) {
    const slug = slugify(name, { lower: true, strict: true })
    const tag = await prisma.blogTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
    ids.push(tag.id)
  }
  return ids
}

async function run() {
  for (const p of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: p.slug } })
    if (existing) {
      console.log(`[skip] Post ja existe: ${p.slug} (id=${existing.id}, status=${existing.status})`)
      continue
    }

    let coverImage: string | null = null
    try {
      console.log(`Subindo capa para o MinIO: ${p.imageUrl}`)
      const up = await uploadImageFromUrl(p.imageUrl)
      coverImage = up.url
      console.log(`Capa salva: ${coverImage}`)
    } catch (e) {
      console.error('Falha no upload da capa (segue sem capa):', e)
    }

    const tagIds = await upsertTags(p.tags)

    const post = await prisma.blogPost.create({
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage,
        imageCredit: p.imageCredit,
        imageCreditUrl: p.imageCreditUrl,
        status: 'draft', // SEMPRE rascunho — William revisa no admin antes de publicar
        featured: false,
        authorId: AUTHOR_TRIBHUS,
        categoryId: p.categoryId,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        focusKeyword: p.focusKeyword,
      },
    })

    for (const tagId of tagIds) {
      await prisma.blogPostTag.create({ data: { postId: post.id, tagId } }).catch(() => {})
    }

    console.log(`[ok] Rascunho criado: ${post.id} — ${post.title}`)
    console.log(`     metaTitle (${p.metaTitle.length} chars), metaDescription (${p.metaDescription.length} chars)`)
  }
}

run()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
