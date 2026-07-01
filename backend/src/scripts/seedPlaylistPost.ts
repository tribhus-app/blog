import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()
const CAT = '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a' // curiosidades
const AUTHOR = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3'
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`
const VID = (id: string) => `<div><iframe class="rounded-lg my-4 aspect-video w-full" width="640" height="360" allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/${id}?rel=0"></iframe></div>`

const SLUG = 'ouvir-rock-nacional'

const blocks: string[] = [
  `<p>Quer <strong>ouvir rock nacional</strong> e não sabe por onde começar? A gente montou uma playlist com os clássicos mais tocados — daqueles que toda plateia canta junto — e, no fim, mostra como dar play na nova geração do rock independente brasileiro, de graça, na Tribhus.</p>`,

  `<h2>Os clássicos mais tocados do rock nacional</h2>`,
  `<p>De Norte a Sul, dos anos 70 aos 90, estas são faixas que não podem faltar em nenhuma playlist de rock nacional. Dá o play:</p>`,

  `<p><strong>Tempo Perdido — Legião Urbana</strong> (1986): poesia e melancolia que viraram hino de uma geração.</p>`,
  VID('zpzoG5KGaHg'),
  `<p><strong>Metamorfose Ambulante — Raul Seixas</strong> (1973): o espírito inquieto e questionador que abriu o caminho do rock no Brasil.</p>`,
  VID('CmB4sfoZkwo'),
  `<p><strong>Epitáfio — Titãs</strong> (2002): uma das canções mais queridas e emocionantes do rock nacional.</p>`,
  VID('5lqv3MlzOHQ'),
  `<p><strong>Meu Erro — Os Paralamas do Sucesso</strong> (anos 80): pop rock perfeito, que nunca saiu das rádios.</p>`,
  VID('jkDLGRNIEYM'),
  `<p><strong>Garota Nacional — Skank</strong> (1996): o rock noventista solar que coloca todo mundo pra cantar.</p>`,
  VID('DjPtwYunRq4'),

  `<h2>Rock nacional antigo ou novidade? Por que não os dois</h2>`,
  `<p>Os clássicos das antigas são eternos — não importa quantas vezes você já ouviu, "Tempo Perdido" ou "Metamorfose Ambulante" sempre batem. Mas o rock nacional não parou neles: tem muita banda autoral fazendo som de qualidade agora mesmo, esperando pra entrar na sua próxima playlist.</p>`,

  `<h2>A nova geração: rock nacional independente pra ouvir agora</h2>`,
  `<p>É aqui que entra a ${A('https://tribhus.com.br', 'Tribhus')}, a rede social feita pra música independente. No ${A('https://tribhus.com.br/bandas', 'catálogo de bandas')} e no hub de ${A('https://tribhus.com.br/genero/rock-alternativo', 'rock alternativo')} você descobre a safra atual — de bandas como ${A('https://tribhus.com.br/bandas/heliojairozancopeneto', 'WOOLLOONGABBAS')} (Goiânia) e ${A('https://tribhus.com.br/bandas/criacaso', 'Cria Caso')} (Espírito Santo) a centenas de outras espalhadas pelo país.</p>`,

  `<h2>Onde ouvir rock nacional online</h2>`,
  `<p>Na Tribhus, o Palco reúne as músicas mais tocadas da cena independente — funciona quase como uma rádio de rock nacional movida pelo que a galera está ouvindo de verdade. É uma forma gratuita de ouvir rock nacional novo e descobrir sua próxima banda favorita, sem depender só dos clássicos de sempre.</p>`,

  `<h2>Perguntas frequentes</h2>`,
  `<p><strong>Onde ouvir rock nacional de graça?</strong> Na Tribhus, plataforma gratuita dedicada à música independente; e os clássicos estão disponíveis em qualquer serviço de streaming e no YouTube.</p>`,
  `<p><strong>Quais são as músicas de rock nacional mais tocadas?</strong> Hinos como "Tempo Perdido", "Metamorfose Ambulante" e "Garota Nacional" estão sempre no topo — além das mais tocadas da cena independente, que rolam no Palco da Tribhus.</p>`,
  `<p><strong>Como descobrir bandas novas de rock nacional?</strong> Pelo Palco da Tribhus e pela tribo ${A('https://tribhus.com.br/tribos/radar-subterraneo', 'Radar Subterrâneo')}, que reúnem o que está tocando e as indicações da comunidade.</p>`,

  `<blockquote><p><strong>Descubra na Tribhus:</strong> a próxima música que vai grudar na sua cabeça pode ser de uma banda independente que você ainda nem conhece. ${A('https://tribhus.com.br/bandas', 'Dê o play nas bandas &rarr;')}</p></blockquote>`,

  `<p>Pra continuar a maratona, veja também o ${A('https://blog.tribhus.com.br/rock-nacional', 'panorama do rock nacional')} e o nosso guia do ${A('https://blog.tribhus.com.br/rock-nacional-anos-80-90', 'rock nacional dos anos 80 e 90')}. Aperta o play e boa viagem.</p>`,
]

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
  if (await prisma.blogPost.findUnique({ where: { slug: SLUG } })) { console.log(`[skip] ${SLUG} ja existe`); return }
  const content = blocks.join('\n\n')
  const md = content.match(/(^|\n)#{1,4}\s|(^|\n)-\s|(^|\n)>\s|\*\*/g)
  if (md) { console.error('ABORT: markdown', md); process.exit(1) }
  const cover = await uploadImageFromUrl('https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1600&q=80')
  const tagIds = await upsertTags(['rock nacional', 'playlist', 'mais tocadas', 'ouvir rock', 'bandas independentes'])
  const post = await prisma.blogPost.create({
    data: {
      title: 'Ouvir rock nacional: as mais tocadas e os clássicos pra dar play',
      slug: SLUG,
      excerpt: 'Uma playlist de rock nacional pra dar o play agora: os clássicos mais tocados (Legião, Raul, Titãs, Skank) e a nova geração independente na Tribhus.',
      content,
      coverImage: cover.url,
      imageCredit: 'Foto: Lee Campbell / Unsplash', imageCreditUrl: 'https://unsplash.com/photos/GI6L2pkiZgQ',
      status: 'draft', featured: false, authorId: AUTHOR, categoryId: CAT,
      metaTitle: 'Ouvir rock nacional: as mais tocadas e os clássicos',
      metaDescription: 'Onde ouvir rock nacional: os clássicos mais tocados (Legião, Raul, Titãs, Skank) e a nova geração independente pra dar play agora na Tribhus.',
      focusKeyword: 'ouvir rock nacional',
    },
  })
  for (const tagId of tagIds) await prisma.blogPostTag.create({ data: { postId: post.id, tagId } }).catch(() => {})
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  console.log(`[ok] ${SLUG} | ${(content.match(/<iframe/g) || []).length} vídeos | mt ${post.metaTitle!.length} md ${post.metaDescription!.length} | ~${words} palavras`)
}
run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
