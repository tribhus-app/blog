import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()
const SLUG = 'bandas-de-nu-metal'
const MEDIA_BASE = 'https://sate.live:9000/tribhusmidias/'

// Monta URL completa da capa da banda a partir do path salvo no banco
function capaUrl(path: string): string {
  return MEDIA_BASE + path.replace(/^\/+/, '')
}

async function getCapa(nome: string): Promise<string> {
  const b = await prisma.banda.findFirst({ where: { nome_banda: nome }, select: { url_capa_banda: true } })
  if (!b?.url_capa_banda) throw new Error(`Banda sem capa: ${nome}`)
  return capaUrl(b.url_capa_banda)
}

async function run() {
  const post = await prisma.blogPost.findUnique({ where: { slug: SLUG } })
  if (!post) { console.error('post nao encontrado'); process.exit(1) }

  // Capa do post = Boneca Voo Doo | inline = HUMERUS
  const bonecaSrc = await getCapa('Boneca Voo Doo')
  const humerusSrc = await getCapa('HUMERUS')
  console.log('Boneca capa:', bonecaSrc)
  console.log('HUMERUS capa:', humerusSrc)

  const cover = await uploadImageFromUrl(bonecaSrc)
  console.log('-> cover MinIO:', cover.url)
  const inline = await uploadImageFromUrl(humerusSrc)
  console.log('-> inline MinIO:', inline.url)

  // Novo bloco de imagem inline + legenda (HUMERUS), creditando e linkando a banda
  const newImg = `<img class="max-w-full rounded-lg my-4" src="${inline.url}" alt="HUMERUS, banda de nu metal, ao vivo">`
  const newCaption = `<p><em>Foto: divulgação — <a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="https://tribhus.com.br/bandas/humerusbanda">HUMERUS</a>, banda de nu metal de São Paulo, na Tribhus.</em></p>`

  let content = post.content
  // troca o <img> inline (casa pelo alt antigo) e a legenda antiga do Unsplash
  content = content.replace(/<img[^>]*alt="Guitarrista de nu metal tocando ao vivo">/, newImg)
  content = content.replace(/<p><em>O nu metal nacional segue pesado[^<]*<\/em><\/p>/, newCaption)

  if (!content.includes(inline.url)) { console.error('FALHA: nao substituiu o <img> inline'); process.exit(1) }
  if (!content.includes('divulgação — <a')) { console.error('FALHA: nao substituiu a legenda'); process.exit(1) }

  await prisma.blogPost.update({
    where: { slug: SLUG },
    data: {
      content,
      coverImage: cover.url,
      imageCredit: 'Foto: divulgação — Boneca Voo Doo na Tribhus',
      imageCreditUrl: 'https://tribhus.com.br/bandas/bonecavoodoo',
    },
  })
  console.log('[ok] #8 atualizado com imagens reais das bandas (capa: Boneca Voo Doo | inline: HUMERUS)')
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
