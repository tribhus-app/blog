import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

// IDs reais (tribhus_db): curiosidades + autor Tribhus
const CATEGORY_CURIOSIDADES = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a'
const AUTHOR_TRIBHUS = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'

const SLUG = 'rock-nacional'

const TITLE = 'Rock Nacional: dos clássicos às novas bandas independentes'
const EXCERPT =
  'Um panorama do rock nacional: dos nomes que fundaram o gênero às bandas independentes que escrevem o capítulo atual — e onde ouvi-las na Tribhus.'
const META_TITLE = 'Rock Nacional: dos clássicos às novas bandas independentes'
const META_DESCRIPTION =
  'Rock nacional dos clássicos como Legião, Titãs e Paralamas às novas bandas independentes que você descobre e ouve agora mesmo na Tribhus.'
const FOCUS_KEYWORD = 'rock nacional'

// Capa Unsplash (Yvette de Wit) -> self-hospedada no MinIO
const COVER_SRC = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80'
const COVER_CREDIT = 'Foto: Yvette de Wit / Unsplash'
const COVER_CREDIT_URL = 'https://unsplash.com/photos/NYrVisodQ2M'

// Imagem inline (Hector Bermudez) -> self-hospedada no MinIO
const INLINE_SRC = 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1400&q=80'

const TAGS = ['rock nacional', 'bandas independentes', 'rock brasileiro', 'historia do rock']

function buildContent(inlineUrl: string): string {
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
    `<p>Aqui mora a parte que pouca gente conhece — e que mais merece atenção. Longe das grandes gravadoras, centenas de <strong>bandas de rock nacionais</strong> seguem lançando música autoral, tocando em palcos pequenos e construindo público no boca a boca. Na <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br">Tribhus</a>, elas têm casa.</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${inlineUrl}" alt="Guitarrista tocando ao vivo num show de rock">`,
    `<p><em>A nova geração do rock nacional se faz nos palcos independentes. Foto: Hector Bermudez / Unsplash.</em></p>`,
    `<p>Alguns nomes pra começar a ouvir agora mesmo:</p>`,
    `<ul><li><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/heliojairozancopeneto">WOOLLOONGABBAS</a> — de Goiânia (GO), do blues rock ao hard rock e ao rock alternativo.</p></li><li><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/andrebarroso">Andre Barroso e banda</a> — de Niterói (RJ), entre o pop rock e o hard rock.</p></li><li><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/bandalgubre">Banda Lúgubre</a> — de Aracaju (SE), com rock progressivo e climas mais sombrios.</p></li><li><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/osss">OSSONGS</a> — de Balneário Camboriú (SC), passeando pelo indie rock, grunge e rock alternativo.</p></li><li><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/sagazorfeu">Sagaz Orfeu</a> — de São Paulo (SP), com pegada de rock alternativo e psicodélico.</p></li></ul>`,
    `<p>Quer um lugar pra trocar indicações e garimpar novidades? A tribo <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/tribos/radar-subterraneo">Radar Subterrâneo</a> é uma comunidade dedicada a descobrir bandas independentes do underground nacional.</p>`,

    `<h2>Onde ouvir e descobrir rock nacional hoje</h2>`,
    `<p>Se você quer mergulhar de vez, explore o <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas">catálogo de bandas</a> da Tribhus e navegue pelos hubs de estilo — do <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/genero/rock-alternativo">rock alternativo</a> ao <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/genero/heavy-metal">heavy metal</a> e ao <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/genero/grunge">grunge</a>. E pra entender de onde vem a paixão nacional pelo gênero, vale ler também o nosso post sobre o <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://blog.tribhus.com.br/dia-nacional-do-rock">Dia Nacional do Rock</a>.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> o rock nacional não é só nostalgia — é uma cena viva e independente esperando pra ser ouvida. <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas">Conheça as bandas &rarr;</a></p></blockquote>`,
    `<p>Dos pioneiros dos anos 70 às bandas que ensaiam hoje numa garagem, o rock nacional é uma história que ainda está sendo escrita. E você pode fazer parte do próximo capítulo: é só dar o play.</p>`,
  ].join('')
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

async function run() {
  const existing = await prisma.blogPost.findUnique({ where: { slug: SLUG } })
  if (existing) {
    console.log(`[skip] Post ja existe: ${SLUG} (id=${existing.id}, status=${existing.status})`)
    return
  }

  console.log(`Subindo capa: ${COVER_SRC}`)
  const cover = await uploadImageFromUrl(COVER_SRC)
  console.log(`Capa: ${cover.url}`)

  console.log(`Subindo inline: ${INLINE_SRC}`)
  const inline = await uploadImageFromUrl(INLINE_SRC)
  console.log(`Inline: ${inline.url}`)

  const content = buildContent(inline.url)
  const tagIds = await upsertTags(TAGS)

  const post = await prisma.blogPost.create({
    data: {
      title: TITLE,
      slug: SLUG,
      excerpt: EXCERPT,
      content,
      coverImage: cover.url,
      imageCredit: COVER_CREDIT,
      imageCreditUrl: COVER_CREDIT_URL,
      status: 'draft',
      featured: false,
      authorId: AUTHOR_TRIBHUS,
      categoryId: CATEGORY_CURIOSIDADES,
      metaTitle: META_TITLE,
      metaDescription: META_DESCRIPTION,
      focusKeyword: FOCUS_KEYWORD,
    },
  })

  for (const tagId of tagIds) {
    await prisma.blogPostTag.create({ data: { postId: post.id, tagId } }).catch(() => {})
  }

  console.log(`[ok] Rascunho criado: ${post.id} — ${post.title}`)
  console.log(`     metaTitle ${META_TITLE.length} chars | metaDescription ${META_DESCRIPTION.length} chars | content ${content.length} chars`)
}

run()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
