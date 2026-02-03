import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

// IDs das categorias e autores
const CATEGORIES = {
  noticias: '43c4f9bd-9012-4f5c-9874-12e86916369c',
  lancamentos: '31eee1ca-50d8-4cc9-b756-ebdd48204958',
  eventos: 'e6ff9765-23ba-4463-a820-a3e0b4158703',
  reviews: '2579c11b-e6ba-4443-9a37-802325b19c9d',
  curiosidades: '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a',
}

const AUTHOR_ID = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3' // Tribhus

interface PostData {
  title: string
  excerpt: string
  content: string
  categoryId: string
  imageUrl?: string
  tags: string[]
  featured?: boolean
}

const posts: PostData[] = [
  // LANCAMENTOS - Supercombo
  {
    title: 'Supercombo lanca Caranguejo (Parte 1) e surpreende com mistura de piseiro e rock',
    excerpt: 'A banda capixaba apresenta seu trabalho mais ousado, misturando influencias brasileiras como baiao e piseiro com rock alternativo.',
    content: `A Supercombo, uma das bandas mais consistentes do rock alternativo brasileiro, acaba de lancar "Caranguejo (Parte 1)", um album que promete redefinir os limites do genero no Brasil.

## Um Novo Capitulo

Com mais de 15 anos de estrada, a banda formada em Vitoria (ES) decidiu arriscar em sonoridades nunca antes exploradas em sua discografia. O resultado e um disco que transita entre o peso caracteristico do grupo e momentos de pura brasilidade.

## Piseiro Black Sabbath

O single de destaque, "Piseiro Black Sabbath", ja virou sensacao nas redes sociais. A faixa conta a historia de metaleiros que vao ao piseiro, numa mistura inusitada que so a Supercombo poderia fazer funcionar.

"Fizemos esta quase de brincadeira, gravando todo mundo na mesma sala. Comecamos a experimentar ritmos brasileiros, o piseiro ficou bom e fomos encaixando a musica", explica a baixista Carol Navarro.

## Destaques do Album

Alem do controverso single, o disco traz faixas como "Alento", descrita pela critica como "uma paulada digna de ser tocada em estadio lotado". O equilibrio entre momentos intensos e melodias mais sutis mostra a maturidade da banda.

## Formacao Atual

Atualmente, a Supercombo conta com:
- Leonardo Ramos (voz e guitarra)
- Carol Navarro (voz e baixo)
- Paulo Vaz (teclados e programacoes)
- Andre Dea (bateria)

O album "Caranguejo (Parte 1)" esta disponivel em todas as plataformas digitais.`,
    categoryId: CATEGORIES.lancamentos,
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb6c4d83b8c05ea86c9d3a9c7a',
    tags: ['supercombo', 'rock alternativo', 'lancamento', 'piseiro', 'rock brasileiro'],
    featured: true,
  },

  // LANCAMENTOS - Far From Alaska
  {
    title: 'Far From Alaska lanca album 3 e anuncia pausa na carreira',
    excerpt: 'O trio potiguar encerra um ciclo com disco que marca guinada eletronica e participacoes especiais de peso.',
    content: `O Far From Alaska, banda que colocou Natal no mapa do rock alternativo nacional, lancou seu terceiro album de estudio, intitulado simplesmente "3". Junto com o lancamento, veio o anuncio de uma pausa por tempo indeterminado.

## Reinvencao Sonora

O disco marca uma mudanca significativa no som da banda. Concebido durante o isolamento da pandemia, o album abraca sonoridades eletronicas, sintetizadores e beats que se fundem com as guitarras caracteristicas do grupo.

O rock eletronico da o tom principal de "3", mas o album nao se limita a isso: ha espaco para pop, indie, reggae e ate uma faixa descrita como "hardxote", misturando xote e tecnobrega.

## Participacoes Especiais

O disco conta com colaboracoes de peso:
- Lucas Silveira (Fresno) na coproducao de varias faixas
- Lenine em participacao especial
- Medulla (banda do Rio)
- Izzy Castro (Twin Pumpkin)

## O Trio

Formado por Emmily Barreto (vocal), Cris Botarelli (lap steel, sintetizador e vocais) e Rafael Brasil (guitarra), o Far From Alaska conquistou fas no Brasil e no exterior, incluindo celebridades como Shirley Manson, vocalista do Garbage.

## Fim de um Ciclo

Antes de entrar em pausa, a banda conclui um ciclo que comecou durante a pandemia. Os tres EPs lancados nos ultimos anos se transformaram neste album de 12 faixas que encerra, pelo menos por ora, a trajetoria de uma das bandas mais importantes do rock brasileiro contemporaneo.

"3" esta disponivel em todas as plataformas digitais.`,
    categoryId: CATEGORIES.lancamentos,
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36',
    tags: ['far from alaska', 'rock alternativo', 'natal', 'rock eletronico', 'lancamento'],
    featured: true,
  },

  // NOTICIAS - Sindrome K
  {
    title: 'Sindrome K lanca single com participacao de Marcello Pompeu do Korzus',
    excerpt: 'Banda baiana de thrash metal apresenta "7 Mil Giros", inspirada na cena do automobilismo da Bahia.',
    content: `A Sindrome K, banda de thrash metal de Salvador, acaba de lancar o single "7 Mil Giros" com uma participacao especial de peso: Marcello Pompeu, vocalista do lendario Korzus.

## Sobre a Faixa

O single, lancado de forma totalmente independente, marca uma nova fase na trajetoria da banda. A musica foi inspirada na forte cena do automobilismo na Bahia e conta com producao do proprio Marcello Pompeu.

Um videoclipe esta em producao e deve ser lancado em breve.

## A Banda

Formada em 2020, a Sindrome K e composta por:
- Lula Souto (vocal e baixo)
- Miguel Matos (guitarra)
- Marcio Dantas (bateria)

Com dois discos gravados - "Aqui se Paga" (2021) e "Sobreviventes do Mal" (2023) - a banda passeia entre o thrash metal tradicional e o moderno, inserindo uma sonoridade melodica e agressiva na cena do underground nacional.

## Influencias

O grupo comecou tocando covers de Megadeth, Metallica, Slayer e Pantera, bandas que seguem como principais influencias em seu som autoral.

## Reconhecimento

A Sindrome K vem ganhando espaco na cena nacional, com participacoes em shows da banda Angra em Salvador e apresentacoes em festivais como o Rock Gaya em Porto Seguro.

"7 Mil Giros" esta disponivel em todas as plataformas digitais.`,
    categoryId: CATEGORIES.noticias,
    imageUrl: 'https://i.ytimg.com/vi/m6pVplJ2MKM/maxresdefault.jpg',
    tags: ['sindrome k', 'thrash metal', 'bahia', 'korzus', 'metal brasileiro'],
    featured: false,
  },

  // EVENTOS - Santa Barbara Rock Fest
  {
    title: 'Santa Barbara Rock Fest 2025 reune 98 mil pessoas e consolida cidade como Capital do Rock',
    excerpt: 'Festival gratuito teve mais de 30 horas de musica em cinco palcos, com Titas, CPM 22, Dead Fish e dezenas de bandas independentes.',
    content: `Santa Barbara d'Oeste viveu dias historicos com o Santa Barbara Rock Fest 2025. O festival reuniu 98 mil pessoas em publico rotativo, consolidando-se como o maior festival de rock de bandas independentes do Estado de Sao Paulo.

## Numeros Impressionantes

Foram mais de 30 horas de programacao 100% gratuita, distribuidas em cinco palcos:
- Palco Terra
- Palco Gig
- Palco Agua
- Palco Jam
- Palco Cidade do Rock

## Headliners de Peso

O festival apresentou o maior numero de headliners de sua historia:
- Titas
- CPM 22
- Dead Fish
- Jota Quest
- Krisiun
- Massacration
- Tihuana
- Kiara Rocks

Alem dos nomes consagrados, 44 bandas autorais, covers e tributos completaram a programacao.

## Diversidade de Estilos

Das 300 bandas inscritas, o pop rock foi o estilo mais representado (22%), seguido por heavy metal e classic rock (13% cada). Hard rock, grunge, blues rock, rock progressivo e ate rockabilly tambem marcaram presenca.

## Representatividade Nacional

O festival atraiu bandas de todo o Brasil:
- 94% de Sao Paulo
- Representantes de Goias, Minas Gerais, Parana e Rio de Janeiro

## Estrutura Completa

Alem da musica, o evento contou com roda gigante, tirolesa, espaco para economia criativa, area gastronomica com 24 opcoes e estrutura completa de acessibilidade.

O Santa Barbara Rock Fest acontece desde 2014 e ja se firmou como referencia em eventos publicos de rock independente no Brasil.`,
    categoryId: CATEGORIES.eventos,
    imageUrl: 'https://www.santabarbara.sp.gov.br/portal/img/noticias/g_72521_1.jpg',
    tags: ['santa barbara rock fest', 'festival', 'rock independente', 'sao paulo', 'titas', 'cpm 22'],
    featured: true,
  },

  // NOTICIAS - Dead Fish Tour
  {
    title: 'Dead Fish celebra 34 anos com A Tour Definitiva e novo album Labirinto da Memoria',
    excerpt: 'Banda capixaba de hardcore percorre 34 cidades brasileiras em turne que reune classicos e faixas do decimo album de estudio.',
    content: `O Dead Fish, uma das bandas mais importantes do hardcore brasileiro, esta em plena atividade comemorando 34 anos de carreira. A banda capixaba anunciou "A Tour Definitiva", turne que passa por 34 cidades brasileiras.

## Labirinto da Memoria

Em 2024, a banda lancou seu decimo album de estudio, "Labirinto da Memoria". O disco e uma viagem pelas reflexoes pessoais do vocalista Rodrigo Lima e pelas tensoes politicas do Brasil contemporaneo.

Inspirado pelo livro "Realismo Capitalista" de Mark Fisher e pelo album "Roteiro Pra Anouz" de Dom L, o disco combina melodia e peso de forma unica.

"Fiz 50 anos e nao queria ficar remoendo as memorias como algo nostalgico, mas sim como um zine de coisas boas e ruins que aconteceram tanto comigo como com quem vive em nossa epoca", explica Rodrigo.

## Presenca em Festivais

A banda tem marcado presenca nos principais eventos de 2025:
- Lollapalooza Brasil
- Porao do Rock
- I Wanna Be Tour
- Punk no Park Sessoes na Cidade

## Discurso que Marca

Consagrada por seu discurso politico-progressista, a banda aborda em suas letras temas como saude e educacao publica, alem de denunciar desigualdade, preconceito, hipocrisia e violencia.

## A Tour Definitiva

Com 34 shows em 34 cidades, a turne celebra toda a trajetoria do Dead Fish, trazendo classicos que moldaram geracoes junto com as novas faixas de "Labirinto da Memoria".

Confira as datas da turne nas redes sociais oficiais da banda.`,
    categoryId: CATEGORIES.noticias,
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb0e08ea2c4d3e0e29a18903e1',
    tags: ['dead fish', 'hardcore', 'punk', 'tour', 'espirito santo'],
    featured: false,
  },

  // CURIOSIDADES
  {
    title: 'O fenomeno das bandas independentes: como o rock underground brasileiro resiste e se reinventa',
    excerpt: 'Mesmo sem espaco nas grandes midias, a cena do rock independente brasileiro nunca foi tao diversa e ativa.',
    content: `Enquanto o mainstream musical brasileiro e dominado por outros generos, o rock underground segue vivo, pulsante e mais diverso do que nunca. Mas como essas bandas conseguem sobreviver e se reinventar?

## A Forca da Comunidade

O rock independente brasileiro se sustenta atraves de uma rede de apoio mutuo que inclui:
- Festivais regionais como o Santa Barbara Rock Fest
- Selos independentes comprometidos com a cena
- Produtores que trabalham por amor ao genero
- Fas que consomem, compartilham e comparecem aos shows

## Diversidade de Estilos

A cena atual e extremamente diversa. Em um mesmo festival voce pode encontrar:
- Thrash metal (Sindrome K)
- Rock alternativo (Supercombo, Far From Alaska)
- Hardcore (Dead Fish)
- Rock progressivo
- Stoner rock
- Post-punk

## Adaptacao Digital

As bandas independentes aprenderam a usar as ferramentas digitais a seu favor:
- Financiamento coletivo para gravar discos
- Distribuicao propria em plataformas de streaming
- Redes sociais para conexao direta com o publico
- Lives e conteudo exclusivo para fas

## O Desafio Continua

Mesmo com todas as dificuldades - falta de espaco na midia tradicional, custos altos de producao, concorrencia com outros generos - o rock brasileiro independente segue firme.

A prova esta nos numeros: festivais lotando, bandas novas surgindo, veteranos lancando discos relevantes e uma nova geracao descobrindo o genero.

O rock nao morreu. Ele apenas saiu do mainstream e encontrou seu espaco no underground, onde sempre se sentiu mais em casa.`,
    categoryId: CATEGORIES.curiosidades,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
    tags: ['rock independente', 'underground', 'cena brasileira', 'rock brasileiro'],
    featured: false,
  },
]

async function uploadImageSafe(url: string): Promise<string | null> {
  try {
    console.log(`Uploading image from: ${url}`)
    const result = await uploadImageFromUrl(url)
    console.log(`Image uploaded: ${result.url}`)
    return result.url
  } catch (error) {
    console.error(`Failed to upload image from ${url}:`, error)
    return null
  }
}

async function createTags(tagNames: string[]): Promise<string[]> {
  const tagIds: string[] = []

  for (const name of tagNames) {
    const slug = slugify(name, { lower: true, strict: true })
    const tag = await prisma.blogTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
    tagIds.push(tag.id)
  }

  return tagIds
}

async function seedPosts() {
  console.log('Starting post seeding...')

  for (const postData of posts) {
    const slug = slugify(postData.title, { lower: true, strict: true })

    // Check if post already exists
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      console.log(`Post already exists: ${postData.title}`)
      continue
    }

    // Upload image if provided
    let coverImage: string | null = null
    if (postData.imageUrl) {
      coverImage = await uploadImageSafe(postData.imageUrl)
    }

    // Create tags
    const tagIds = await createTags(postData.tags)

    // Create post
    const post = await prisma.blogPost.create({
      data: {
        title: postData.title,
        slug,
        excerpt: postData.excerpt,
        content: postData.content,
        coverImage,
        categoryId: postData.categoryId,
        authorId: AUTHOR_ID,
        status: 'published',
        featured: postData.featured || false,
        publishedAt: new Date(),
        metaTitle: postData.title.substring(0, 60),
        metaDescription: postData.excerpt.substring(0, 160),
      },
    })

    // Connect tags
    for (const tagId of tagIds) {
      await prisma.blogPostTag.create({
        data: {
          postId: post.id,
          tagId,
        },
      })
    }

    console.log(`Created post: ${postData.title}`)
  }

  console.log('Post seeding completed!')
}

seedPosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
