import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUGS = [
  'dia-nacional-do-rock',
  'rock-nacional',
  'rock-nacional-anos-80-90',
  'pop-rock-nacional',
  'bandas-de-heavy-metal-brasileiras',
  'shows-de-rock-no-brasil-2026',
  'historias-do-rock',
  'bandas-de-nu-metal',
  'bandas-de-black-metal',
  'bandas-de-metal-industrial',
  'bandas-de-rock-gospel',
]

async function run() {
  const now = new Date()
  for (const slug of SLUGS) {
    const post = await prisma.blogPost.findUnique({ where: { slug } })
    if (!post) { console.log(`[!] nao encontrado: ${slug}`); continue }
    if (post.status === 'published') { console.log(`[=] ja publicado: ${slug}`); continue }
    const updated = await prisma.blogPost.update({
      where: { slug },
      data: { status: 'published', publishedAt: post.publishedAt ?? now },
    })
    console.log(`[ok] PUBLICADO: ${slug} (publishedAt=${updated.publishedAt?.toISOString()})`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
