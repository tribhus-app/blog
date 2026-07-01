import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { uploadImageFromUrl } from '../services/minio'

const prisma = new PrismaClient()
const MEDIA = 'https://sate.live:9000/tribhusmidias/'

// post slug -> { bandSlug (perfil/credito), nome (exibição) }
const MAP: { post: string; bandSlug: string; nome: string }[] = [
  // Tier 2 (gêneros)
  { post: 'bandas-de-black-metal', bandSlug: 'tenotitlan', nome: 'Tenotitlan' },
  { post: 'bandas-de-metal-industrial', bandSlug: 'eddiehost', nome: 'Drama' },
  { post: 'bandas-de-rock-gospel', bandSlug: '7mergulhos', nome: '7 Mergulhos' },
  { post: 'bandas-de-death-metal', bandSlug: 'shitaiband', nome: 'Shitai' },
  { post: 'bandas-de-thrash-metal', bandSlug: 'amocme', nome: 'Amocme' },
  { post: 'bandas-de-grunge', bandSlug: 'evorto', nome: 'Evorto' },
  { post: 'bandas-de-hard-rock', bandSlug: 'banda_raivosos', nome: 'Raivosos' },
  { post: 'bandas-de-punk-rock', bandSlug: 'foxhound', nome: 'Fox Hound' },
  { post: 'bandas-de-hardcore', bandSlug: 'betheone', nome: 'BETHEONE' },
  { post: 'bandas-de-surf-rock', bandSlug: 'fenerickmurilo', nome: 'Murilo Fenerick' },
  { post: 'bandas-de-shoegaze-dream-pop', bandSlug: 'deceitcultband', nome: 'Deceit Cult' },
  { post: 'bandas-de-ska', bandSlug: 'rivelinos', nome: 'RIVELINOS' },
  // Tier 3 (cidades)
  { post: 'shows-de-rock-em-sao-paulo', bandSlug: 'blackiceberg', nome: 'Black Iceberg' },
  { post: 'shows-de-rock-no-rio-de-janeiro', bandSlug: 'lggama', nome: 'LG Gama' },
  { post: 'shows-de-rock-em-belo-horizonte', bandSlug: 'betolani', nome: 'Lani' },
  { post: 'shows-de-rock-em-curitiba', bandSlug: 'keyus', nome: 'Keyus' },
  { post: 'shows-de-rock-em-porto-alegre', bandSlug: 'thomas', nome: 'Thomas Butterfly' },
  { post: 'shows-de-rock-em-recife', bandSlug: 'anttarez', nome: 'Anttarez' },
  { post: 'shows-de-rock-em-fortaleza', bandSlug: 'ihmm', nome: 'In Hora Mortis Meae' },
  { post: 'shows-de-rock-em-salvador', bandSlug: 'jprojectband', nome: 'ANFRACTA Project' },
  { post: 'shows-de-rock-em-goiania', bandSlug: 'bananabipolar', nome: 'Banana Bipolar' },
]

async function run() {
  let ok = 0, fail = 0
  for (const m of MAP) {
    try {
      const band = await prisma.banda.findFirst({ where: { auth: { slug: m.bandSlug } }, select: { url_capa_banda: true } })
      if (!band?.url_capa_banda) { console.log(`[skip] ${m.post}: ${m.nome} sem capa`); fail++; continue }
      const src = MEDIA + band.url_capa_banda.replace(/^\/+/, '')
      const up = await uploadImageFromUrl(src)
      await prisma.blogPost.update({
        where: { slug: m.post },
        data: {
          coverImage: up.url,
          imageCredit: `Foto: divulgação — ${m.nome} na Tribhus`,
          imageCreditUrl: `https://tribhus.com.br/bandas/${m.bandSlug}`,
        },
      })
      console.log(`[ok] ${m.post} -> capa de ${m.nome}`)
      ok++
    } catch (e) {
      console.error(`[ERRO] ${m.post} (${m.nome}):`, e instanceof Error ? e.message : e)
      fail++
    }
  }
  console.log(`\n=== ${ok} capas trocadas, ${fail} falhas ===`)
}
run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
