import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SLUG = 'bandas-de-nu-metal'

// Imagem neutra (Unsplash, Honey Yanibel) ja hospedada no MinIO do blog.
const NEUTRAL_IMG = 'https://blog.tribhus.com.br/minio-images/1781868804585-photo-1574123331112-a1b1d3d93c2d'

async function run() {
  const post = await prisma.blogPost.findUnique({ where: { slug: SLUG } })
  if (!post) { console.error('post nao encontrado'); process.exit(1) }

  let content = post.content
  // tira a foto da HUMERUS ( enfase visual) -> imagem neutra, sem destaque a banda de IA
  content = content.replace(
    /<img[^>]*alt="HUMERUS, banda de nu metal, ao vivo">/,
    `<img class="max-w-full rounded-lg my-4" src="${NEUTRAL_IMG}" alt="Guitarrista de nu metal ao vivo">`
  )
  // legenda volta a ser neutra (sem dar foco/credito de divulgacao pra banda de IA)
  content = content.replace(
    /<p><em>Foto: divulgação — <a[^>]*>HUMERUS<\/a>[^<]*<\/em><\/p>/,
    `<p><em>O nu metal nacional segue vivo na cena independente. Foto: Honey Yanibel Minaya Cruz / Unsplash.</em></p>`
  )

  if (content.includes('humerusbanda-capa')) { console.error('FALHA: ainda tem a foto da HUMERUS'); process.exit(1) }
  if (!content.includes(NEUTRAL_IMG)) { console.error('FALHA: nao aplicou imagem neutra'); process.exit(1) }

  await prisma.blogPost.update({ where: { slug: SLUG }, data: { content } })
  console.log('[ok] #8: foto da HUMERUS removida; capa segue Boneca Voo Doo (real). HUMERUS permanece so na lista de texto.')
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
