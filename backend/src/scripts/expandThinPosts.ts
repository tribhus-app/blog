import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const A = (href: string, txt: string) =>
  `<a target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover" href="${href}">${txt}</a>`

// Todas as bandas usadas em qualquer post (pra nao repetir entre posts).
const USED_ALL = new Set([
  'heliojairozancopeneto','osss','sagazorfeu','velhoromeu','ceudeoutono','deva','bandapsychotria','andrebarroso','hugoalves','esmeraldo','vaziopesado','lyamusic7','caioarossetti','criacaso','sonnora','julianagatto','rodolfolemys','bandafluaoficial','ultreya','bloodydragonband','symmetry','revolta','agressivium','bandabocarra','bertola','jhon','disola','limboperdido','osvaldoo','indnine','nigro',
  'bonecavoodoo','letargia','humerusbanda','aetherloreband','codeveronica_oficial',
  'tenotitlan','luiz_cyfer','ibmuz','necrocify','dorprofanablackmetal','mitsein','nov88','eddiehost','blackcoffee','dollflesh','bandamx85','nowayformalefactors','7mergulhos','ill','jorger',
  'shitaiband','kyos','felbandeira','saulorhcp','drfreeza','alan','meltinsun','biocidiooficial','amocme','onvecna11','flourishedband','evorto','kapuzdfrade','antonsetti','lookintotheabyss',
  'banda_raivosos','hotled','bandavolupia','cinnamonbtos','honier','velhojohnny','bandagesto','foxhound','bandaabrisasjcgmail.com','drmurder','betheone','rafaelbrunoseh','motosserratc','vdl','fenerickmurilo','luaverde','foresttlight','stellairsongs','deceitcultband','rivelinos','flaviobaldan','thiapunk',
])

interface P { slug: string; filter: string; genreLabel: string; own: string[]; target: number }
const POSTS: P[] = [
  { slug: 'bandas-de-surf-rock', filter: "g.nome_genero IN ('Surf rock','Surf music')", genreLabel: 'surf rock', own: ['fenerickmurilo','luaverde','foresttlight'], target: 6 },
  { slug: 'bandas-de-shoegaze-dream-pop', filter: "g.nome_genero IN ('Shoegazing','Dream pop','Dream Pop')", genreLabel: 'dream pop e shoegaze', own: ['stellairsongs','deceitcultband'], target: 6 },
  { slug: 'bandas-de-ska', filter: "g.nome_genero IN ('Ska punk','Ska','2 Tone')", genreLabel: 'ska', own: ['rivelinos','flaviobaldan','thiapunk'], target: 6 },
]

async function pick(p: P) {
  // exclui bandas usadas em OUTROS posts (mantem as do proprio post)
  const exclude = new Set(USED_ALL)
  p.own.forEach(s => exclude.delete(s))
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT b.nome_banda AS nome, au.slug AS slug, b.cidade AS cidade, b.estado AS estado,
      (EXISTS (SELECT 1 FROM musicas m WHERE m.id_banda=b.id_banda AND m.deleted_at IS NULL AND m.status='aprovado')) AS tem_musica
    FROM banda b JOIN auth au ON au.auth_id=b.auth_id
    JOIN banda_genero bg ON bg.id_banda=b.id_banda JOIN genero_rock g ON g.id_genero=bg.id_genero AND (${p.filter})
    WHERE au.slug IS NOT NULL
    GROUP BY b.id_banda, au.slug
    ORDER BY tem_musica DESC, b.id_banda DESC`)
  const out: any[] = []
  for (const r of rows) {
    if (exclude.has(r.slug)) continue
    out.push(r)
    if (out.length >= p.target) break
  }
  return out // ja vem com tem_musica=true primeiro, false no fim
}

async function run() {
  for (const p of POSTS) {
    const post = await prisma.blogPost.findUnique({ where: { slug: p.slug } })
    if (!post) { console.log(`[!] ${p.slug} nao encontrado`); continue }
    const bands = await pick(p)
    const ul = '<ul>' + bands.map(b =>
      `<li><strong>${A('https://tribhus.com.br/bandas/' + b.slug, (b.nome || '').trim())}</strong> — de ${b.cidade ? b.cidade.trim() + ' (' + b.estado + ')' : b.estado}, ${p.genreLabel} autoral.</li>`
    ).join('') + '</ul>'
    const newContent = post.content.replace(/<ul>[\s\S]*?<\/ul>/, ul)
    if (newContent === post.content) { console.log(`[!] ${p.slug}: nao achou <ul> pra trocar`); continue }
    await prisma.blogPost.update({ where: { slug: p.slug }, data: { content: newContent } })
    const comMus = bands.filter(b => b.tem_musica).length
    console.log(`[ok] ${p.slug}: ${bands.length} bandas (${comMus} com música, ${bands.length - comMus} sem, no fim) -> ${bands.map(b => b.slug).join(', ')}`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
