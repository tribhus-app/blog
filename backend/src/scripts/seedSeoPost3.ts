import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()

const CATEGORY_CURIOSIDADES = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a'
const AUTHOR_TRIBHUS = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'

const SLUG = 'rock-nacional-anos-80-90'
const TITLE = 'Rock nacional dos anos 80 e 90: os clássicos e seus herdeiros independentes'
const EXCERPT =
  'Uma viagem pelo rock nacional dos anos 80 e 90 e pelos herdeiros independentes que mantêm vivo o som de Legião, Engenheiros e Skank — direto na Tribhus.'
const META_TITLE = 'Rock nacional dos anos 80 e 90: clássicos e herdeiros de hoje'
const META_DESCRIPTION =
  'Do rock nacional dos anos 80 e 90 — Legião, Titãs, Engenheiros e Skank — às bandas independentes que herdaram esse som e você ouve hoje na Tribhus.'
const FOCUS_KEYWORD = 'rock nacional dos anos 80'

// Capa Unsplash (Matthew Kalapuch) -> MinIO
const COVER_SRC = 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=1600&q=80'
const COVER_CREDIT = 'Foto: Matthew Kalapuch / Unsplash'
const COVER_CREDIT_URL = 'https://unsplash.com/photos/sqJ4tLBiurw'

// Inline Unsplash (Rocco Dipoppa) -> MinIO
const INLINE_SRC = 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=1400&q=80'

const TAGS = ['rock nacional', 'anos 80', 'anos 90', 'rock brasileiro', 'bandas independentes']

const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

function buildContent(inlineUrl: string): string {
  return [
    `<p>O <strong>rock nacional dos anos 80</strong> e 90 é, pra muita gente, a melhor fase da música brasileira com guitarra. Foi quando o BRock explodiu nas rádios, definiu uma geração e criou hinos que a gente canta até hoje. Mas e os herdeiros desse som? Neste post a gente revisita os clássicos e mostra as bandas independentes que seguem essa linhagem agora na Tribhus.</p>`,

    `<h2>O rock nacional dos anos 80: a explosão do BRock</h2>`,
    `<p>Os anos 80 foram o grande estouro do <strong>rock nacional</strong>. Depois da abertura aberta por <strong>Raul Seixas</strong> nos anos 70, surgiu uma leva que virou trilha sonora de uma geração inteira: <strong>Legião Urbana</strong>, <strong>Titãs</strong>, <strong>Os Paralamas do Sucesso</strong>, <strong>Barão Vermelho</strong> (com Cazuza), <strong>Capital Inicial</strong>, <strong>RPM</strong> e os gaúchos do <strong>Engenheiros do Hawaii</strong>. Era rock com letra em português, poesia urbana e crítica social.</p>`,
    `<p>Poucas faixas resumem tão bem a estrada do BRock oitentista quanto "Infinita Highway", do álbum <em>A Revolta dos Dândis</em> (1987):</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/fTpgaQNHKwg?rel=0"></iframe></div>`,

    `<h2>Os anos 90 (e os anos 2000): o rock nacional se reinventa</h2>`,
    `<p>Nos anos 90, o rock nacional ganhou novas cores. O <strong>Skank</strong> e o <strong>Jota Quest</strong> trouxeram groove e pop; <strong>Raimundos</strong> e <strong>Charlie Brown Jr.</strong> misturaram peso, punk e brasilidade; <strong>Los Hermanos</strong> abriu, já na virada dos anos 2000, caminho pra toda uma cena indie. O rock nacional provou que sabia se reinventar a cada década.</p>`,
    `<p>"Garota Nacional", do <em>O Samba Poconé</em> (1996), é um retrato perfeito desse rock noventista solar e dançante:</p>`,
    `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/DjPtwYunRq4?rel=0"></iframe></div>`,

    `<h2>Os herdeiros: bandas independentes que mantêm a linhagem viva</h2>`,
    `<p>A boa notícia é que esse som não ficou preso ao passado. Hoje, uma nova geração de <strong>bandas de rock nacionais</strong> independentes carrega essa mesma linhagem — e você encontra todas elas na ${A('https://tribhus.com.br', 'Tribhus')}.</p>`,
    `<img class="max-w-full rounded-lg my-4" src="${inlineUrl}" alt="Banda independente tocando ao vivo num palco">`,
    `<p><em>A linhagem do BRock segue viva nos palcos independentes. Foto: Rocco Dipoppa / Unsplash.</em></p>`,
    `<p>Se você curte os clássicos, vai gostar de conhecer:</p>`,
    `<ul>` +
      `<li><p>Curte o lado mais introspectivo de <strong>Legião</strong> e <strong>Engenheiros</strong>? Ouça ${A('https://tribhus.com.br/bandas/hugoalves', 'Sobre a Noite de Ontem')} — de Guarujá (SP), entre o rock alternativo, o post-rock e o shoegaze.</p></li>` +
      `<li><p>Fã do pop rock solar de <strong>Skank</strong> e <strong>Paralamas</strong>? Conheça ${A('https://tribhus.com.br/bandas/esmeraldo', 'Revolução Acústica')} — de Jitaúna (BA), com pop rock, rock alternativo e rock and roll.</p></li>` +
      `<li><p>Gosta do rock alternativo melódico dos anos 90? Vá de ${A('https://tribhus.com.br/bandas/vaziopesado', 'Vazio Pesado')} — de São Paulo (SP), no fio do pop rock com o alternativo.</p></li>` +
      `<li><p>Curte a pegada mais elétrica e oitentista? ${A('https://tribhus.com.br/bandas/lyamusic7', 'LYA')} (Brasília/DF) e ${A('https://tribhus.com.br/bandas/caioarossetti', 'Black Jack')} (Taubaté/SP) trazem glam rock, hard rock e rock and roll.</p></li>` +
    `</ul>`,
    `<p>E pra garimpar ainda mais nomes, a tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')} é uma comunidade dedicada a indicar bandas independentes do underground nacional.</p>`,

    `<h2>Onde ouvir os herdeiros do rock nacional</h2>`,
    `<p>Pra continuar a viagem, explore os hubs de estilo que mais conversam com o BRock dos anos 80 e 90: o ${A('https://tribhus.com.br/genero/post-punk', 'post-punk')} (a base do som da Legião), o ${A('https://tribhus.com.br/genero/rock-alternativo', 'rock alternativo')} e o ${A('https://tribhus.com.br/bandas', 'catálogo completo de bandas')} da Tribhus. Vale também ler nossos posts sobre o ${A('https://blog.tribhus.com.br/rock-nacional', 'rock nacional dos clássicos às novas bandas')} e sobre o ${A('https://blog.tribhus.com.br/dia-nacional-do-rock', 'Dia Nacional do Rock')}.</p>`,

    `<blockquote><p><strong>Descubra na Tribhus:</strong> o som que marcou os anos 80 e 90 tem herdeiros tocando agora — e você pode ser um dos primeiros a ouvir. ${A('https://tribhus.com.br/bandas', 'Conheça as bandas &rarr;')}</p></blockquote>`,
    `<p>Os anos 80 e 90 passaram, mas o rock nacional não envelheceu: ele só trocou de mãos. E a próxima geração já está no palco, esperando o play.</p>`,
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
  if (existing) { console.log(`[skip] ja existe: ${SLUG} (${existing.id})`); return }

  console.log(`Capa: ${COVER_SRC}`)
  const cover = await uploadImageFromUrl(COVER_SRC)
  console.log(`-> ${cover.url}`)
  console.log(`Inline: ${INLINE_SRC}`)
  const inline = await uploadImageFromUrl(INLINE_SRC)
  console.log(`-> ${inline.url}`)

  const content = buildContent(inline.url)
  const tagIds = await upsertTags(TAGS)

  const post = await prisma.blogPost.create({
    data: {
      title: TITLE, slug: SLUG, excerpt: EXCERPT, content,
      coverImage: cover.url, imageCredit: COVER_CREDIT, imageCreditUrl: COVER_CREDIT_URL,
      status: 'draft', featured: false,
      authorId: AUTHOR_TRIBHUS, categoryId: CATEGORY_CURIOSIDADES,
      metaTitle: META_TITLE, metaDescription: META_DESCRIPTION, focusKeyword: FOCUS_KEYWORD,
    },
  })
  for (const tagId of tagIds) {
    await prisma.blogPostTag.create({ data: { postId: post.id, tagId } }).catch(() => {})
  }
  console.log(`[ok] Rascunho criado: ${post.id} — ${post.title}`)
  console.log(`     metaTitle ${META_TITLE.length} | metaDescription ${META_DESCRIPTION.length} | content ${content.length}`)
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
