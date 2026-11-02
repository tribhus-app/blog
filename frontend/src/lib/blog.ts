import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'
import type { ArtigoDoBlog, BandaDaMateria, CapaDoBlog, CartaoDaCapa, ResumoDoArtigo } from '@/components/blog/tipos'
import { semTags } from '@/components/blog/corpo'
import { faixaDaBanda } from '@/components/blog/faixaDaBanda'

/* =========================================================================
   OS DADOS DO BLOG PARA AS TELAS DO REDESENHO (pacote do Dione, 30/10/2026)

   Tudo vem da API que o blog ja tem, em /blog/api: nenhum endpoint novo. As
   telas do pacote usam os nomes da propria API (title, slug, coverImage...),
   entao aqui so se escolhe a chamada e se prepara o corpo do artigo.

   O pacote sugeria algumas chamadas que a API nao tem (/posts?category=,
   /posts?tag=). Ficaram as que as paginas do ar ja usavam: /posts?categoryId=,
   /tags/<slug>/posts e /posts/<id>/related (o relacionado por tag em comum,
   de 20/10/2026, melhor que "a mesma categoria").
   ========================================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
/* A API da Tribhus (a das bandas). Do servidor do blog ela responde; de fora
   do servidor o anti-robo dela recusa. */
const TRIBHUS_API = process.env.TRIBHUS_API_URL || 'https://tribhus.net:5000'

export const POR_PAGINA = 24

async function pedir<T>(caminho: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${caminho}`, { next: { revalidate } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch (error) {
    console.error(`[blog] falhou ${caminho}:`, error)
    return null
  }
}

/* ---------------------------------------------------------------- tipos da API */
interface PostDaApi {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  content?: string
  coverImage?: string | null
  imageCredit?: string | null
  imageCreditUrl?: string | null
  publishedAt?: string | null
  createdAt?: string
  updatedAt?: string | null
  featured?: boolean
  category?: { id?: string; name: string; slug: string; description?: string | null; color?: string | null } | null
  author?: { name: string; slug: string; bio?: string | null; avatar?: string | null; isAi?: boolean } | null
  tags?: { name: string; slug: string }[]
}
export interface CategoriaDaApi { id: string; name: string; slug: string; description: string | null; postCount?: number }
export interface TagDaApi { id: string; name: string; slug: string; postCount?: number }
interface AutorDaApi { name: string; slug: string; bio: string | null; avatar: string | null }

const SEM_CATEGORIA = { name: 'Sem categoria', slug: 'sem-categoria' }
const AUTOR_DA_CASA = { name: 'Tribhus', slug: 'tribhus', bio: null, avatar: null }

/** O cartao: o que as listas mostram de cada artigo. */
export function resumo(p: PostDaApi): ResumoDoArtigo & { author?: { name: string; avatar?: string | null } } {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? null,
    metaDescription: p.metaDescription ?? null,
    coverImage: p.coverImage ?? null,
    publishedAt: p.publishedAt || p.createdAt || '',
    featured: p.featured,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : SEM_CATEGORIA,
    author: p.author ? { name: p.author.name, avatar: p.author.avatar } : undefined,
  }
}

/* ---------------------------------------------------------------- o corpo */

/* A sanitizacao do ar (CRIT-010, que morava no PostContent): tudo o que o
   TipTap e o Markdown geram, sem <script>, sem on*, sem javascript:, e iframe
   so do YouTube e do Vimeo. Roda ANTES do prepararCorpo do pacote, que depois
   acrescenta os botoes e os data-* das pecas (texto nosso, nao do autor). */
const SANITIZACAO = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'div', 'span',
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup',
    'blockquote', 'pre', 'code',
    'ul', 'ol', 'li',
    'a', 'img', 'figure', 'figcaption',
    'iframe',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'title', 'src', 'alt', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'style'],
  FORBID_TAGS: ['script', 'style', 'object', 'embed', 'base', 'link', 'meta', 'form', 'input', 'button', 'textarea', 'select', 'option'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'formaction', 'xlink:href'],
  ALLOW_DATA_ATTR: false,
}
const IFRAME_PERMITIDO = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com', 'player.vimeo.com']
let ganchoPosto = false
function sanitizar(html: string): string {
  if (!ganchoPosto && typeof DOMPurify.addHook === 'function') {
    ganchoPosto = true
    DOMPurify.addHook('uponSanitizeElement', (node, data) => {
      if (data.tagName !== 'iframe') return
      try {
        const u = new URL((node as Element).getAttribute('src') || '', 'https://invalid.local')
        if (!IFRAME_PERMITIDO.includes(u.hostname.toLowerCase())) (node as Element).remove()
      } catch {
        ;(node as Element).remove()
      }
    })
  }
  return DOMPurify.sanitize(html, SANITIZACAO) as unknown as string
}

/* O corpo dos 230 artigos antigos (vindos do WordPress) e Markdown, com blocos
   de HTML no meio (o <div><iframe> do video). Os de 2026 sao HTML do TipTap.
   O pacote recebe HTML: o Markdown vira HTML aqui, com as duas limpezas que o
   AGENTS pede (o resto do botao "Share" do WordPress no fim, e o link solto do
   YouTube numa linha sozinha, que vira o video). */
const LINK_DO_YOUTUBE = /^\s*<?(https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})[^\s>]*)>?\s*$/gm

export function htmlDoCorpo(conteudo: string): string {
  let texto = (conteudo || '').replace(/\s*Share\*+\s*$/i, '')
  if (!/^\s*</.test(texto)) {
    texto = texto.replace(LINK_DO_YOUTUBE, (_l, _u, id: string) =>
      `\n<div><iframe src="https://www.youtube.com/embed/${id}"></iframe></div>\n`)
    texto = marked.parse(texto, { gfm: true, async: false }) as string
  }
  return sanitizar(texto)
}

/* ---------------------------------------------------------------- o artigo */

async function autores(): Promise<AutorDaApi[]> {
  return (await pedir<{ data: AutorDaApi[] }>('/authors', 3600))?.data ?? []
}

export async function postDaApi(slug: string): Promise<PostDaApi | null> {
  return (await pedir<{ data: PostDaApi }>(`/posts/slug/${encodeURIComponent(slug)}`))?.data ?? null
}

/** O artigo pronto para a PaginaDoArtigo: o corpo em HTML limpo e a bio do autor. */
export async function artigo(post: PostDaApi): Promise<ArtigoDoBlog> {
  /* o post traz o autor sem a bio; ela vem de /authors */
  const bio = post.author ? (await autores()).find((a) => a.slug === post.author!.slug)?.bio ?? null : null
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? null,
    metaTitle: post.metaTitle ?? null,
    metaDescription: post.metaDescription ?? null,
    content: htmlDoCorpo(post.content ?? ''),
    coverImage: post.coverImage ?? null,
    imageCredit: post.imageCredit ?? null,
    imageCreditUrl: post.imageCreditUrl ?? null,
    publishedAt: post.publishedAt || post.createdAt || '',
    updatedAt: post.updatedAt ?? null,
    featured: post.featured,
    category: post.category ?? SEM_CATEGORIA,
    author: post.author ? { name: post.author.name, slug: post.author.slug, avatar: post.author.avatar ?? null, bio } : AUTOR_DA_CASA,
    tags: post.tags ?? [],
  }
}

/** A proxima e os relacionados: o endpoint do ar (tag em comum + vizinhos na categoria). */
export async function relacionados(idDoPost: string): Promise<ResumoDoArtigo[]> {
  return ((await pedir<{ data: PostDaApi[] }>(`/posts/${idDoPost}/related?limit=4`, 3600))?.data ?? []).map(resumo)
}

/* As bandas que o texto cita (`/bandas/<slug>`), pela API que a pagina da
   banda usa, com a faixa que toca no "Ouca enquanto le" (`faixaDaBanda`, os
   discos e as faixas pelos mesmos endpoints da pagina da banda). Ate 6, para
   um guia com 30 links nao virar 60 pedidos. */
interface BandaDaApi {
  nome_banda: string
  slug?: string
  cidade?: string | null
  estado?: string | null
  url_icone_banda?: string | null
  url_capa_banda?: string | null
  genero_principal?: { nome?: string } | string | null
  generos?: ({ nome?: string } | string)[] | null
}
const nomeDoGenero = (g: { nome?: string } | string | null | undefined) =>
  !g ? null : typeof g === 'string' ? g : g.nome ?? null

interface DiscoDaApi { id_album: number; ano_lancamento?: number | null; url_capa_album?: string | null }
interface FaixaDaApi { id_musica?: number | null; nome_musica: string; url_musica?: string | null; duracao_final?: number | string | null }

async function lista<T>(caminho: string): Promise<T[]> {
  try {
    const r = await fetch(`${TRIBHUS_API}${caminho}`, { next: { revalidate: 3600 } })
    const d = r.ok ? await r.json() : null
    return Array.isArray(d) ? d : []
  } catch {
    return []
  }
}

/* a duracao vem em segundos, as vezes como texto (`segundos` do site) */
const emSegundos = (v: FaixaDaApi['duracao_final']) => {
  const n = typeof v === 'number' ? v : Number(v)
  return v != null && v !== '' && Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

async function faixaDe(idBanda: number, b: BandaDaApi) {
  const discos = await lista<DiscoDaApi>(`/bands/public/albuns/${idBanda}`)
  const faixas = await Promise.all(discos.map((d) => lista<FaixaDaApi>(`/bands/public/album-tracks/${d.id_album}`)))
  return faixaDaBanda({
    nome: b.nome_banda,
    logoUrl: b.url_icone_banda ?? null,
    lancamentos: discos.map((d, i) => ({
      ano: d.ano_lancamento ?? null,
      capaUrl: d.url_capa_album ?? null,
      faixas: faixas[i].map((m) => ({
        id: m.id_musica ?? null, titulo: m.nome_musica, audioUrl: m.url_musica || null, duracaoSegundos: emSegundos(m.duracao_final),
      })),
    })),
  })
}

async function banda(slug: string): Promise<BandaDaMateria | null> {
  try {
    const id = await fetch(`${TRIBHUS_API}/bands/public/get-band-id/${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } })
    if (!id.ok) return null
    const { id_banda } = (await id.json()) as { id_banda?: number }
    if (!id_banda) return null
    const res = await fetch(`${TRIBHUS_API}/bands/banda/${id_banda}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const b = (await res.json()) as BandaDaApi
    return {
      slug,
      nome: b.nome_banda,
      cidade: [b.cidade, b.estado].filter(Boolean).join(', ') || null,
      genero: nomeDoGenero(b.genero_principal) ?? nomeDoGenero(b.generos?.[0]),
      fotoUrl: b.url_icone_banda || b.url_capa_banda || null,
      faixa: await faixaDe(id_banda, b),
    }
  } catch {
    return null
  }
}

export async function bandasCitadas(slugs: string[]): Promise<BandaDaMateria[]> {
  const achadas = await Promise.all(slugs.slice(0, 6).map(banda))
  return achadas.filter((b): b is BandaDaMateria => !!b)
}

/* ---------------------------------------------------------------- as listas */

export async function categorias(): Promise<CategoriaDaApi[]> {
  return (await pedir<{ data: CategoriaDaApi[] }>('/categories'))?.data ?? []
}

export async function tags(): Promise<TagDaApi[]> {
  return (await pedir<{ data: TagDaApi[] }>('/tags'))?.data ?? []
}

interface Paginada { data: PostDaApi[]; pagination?: { total: number } }

export async function daCategoria(idDaCategoria: string, pagina: number) {
  const r = await pedir<Paginada>(`/posts?categoryId=${idDaCategoria}&limit=${POR_PAGINA}&page=${pagina}`)
  return { artigos: (r?.data ?? []).map(resumo), total: r?.pagination?.total ?? 0 }
}

export async function daTag(slug: string, pagina: number) {
  const r = await pedir<{ data: PostDaApi[] }>(`/tags/${encodeURIComponent(slug)}/posts?limit=${POR_PAGINA}&page=${pagina}`)
  return (r?.data ?? []).map(resumo)
}

export async function doArquivo(pagina: number) {
  const r = await pedir<Paginada>(`/posts?page=${pagina}&limit=${POR_PAGINA}`)
  return { artigos: (r?.data ?? []).map(resumo), total: r?.pagination?.total ?? 0 }
}

export async function recentes(quantos: number) {
  return ((await pedir<Paginada>(`/posts?limit=${quantos}&status=published`))?.data ?? []).map(resumo)
}

export async function populares(quantos = 4) {
  return ((await pedir<{ data: PostDaApi[] }>(`/posts/popular?limit=${quantos}`))?.data ?? []).map(resumo)
}

/* A capa: dez artigos como no ar, o destaque (`featured`) na frente, as Mais
   lidas e as categorias com a foto do artigo mais novo de cada uma. */
export async function capa(): Promise<CapaDoBlog> {
  const [lista, destaque, maisLidas, cats] = await Promise.all([
    pedir<Paginada>('/posts?limit=10&status=published'),
    pedir<{ data: PostDaApi[] }>('/posts/featured?limit=1'),
    pedir<{ data: PostDaApi[] }>('/posts/popular?limit=5'),
    categorias(),
  ])
  const posts = lista?.data ?? []
  /* a foto de cada categoria: o artigo mais novo dela. Nos 10 da capa so
     aparecem duas ou tres categorias, entao as outras vem de uma busca de 1
     artigo por categoria (a mesma chamada da pagina da categoria) */
  const capas = await Promise.all(cats.map(async (c) =>
    posts.find((p) => p.category?.slug === c.slug)?.coverImage
      ?? (await pedir<Paginada>(`/posts?categoryId=${c.id}&limit=1`))?.data?.[0]?.coverImage
      ?? null))
  const primeiro = destaque?.data?.[0]
  const ordem = primeiro ? [primeiro, ...posts.filter((p) => p.id !== primeiro.id)].slice(0, 10) : posts
  const recentesDaCapa: CartaoDaCapa[] = ordem.map(resumo)
  return {
    recentes: recentesDaCapa,
    maisLidas: (maisLidas?.data ?? []).map(resumo),
    categorias: cats.map((c, i) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      capa: capas[i],
    })),
  }
}

/* ---------------------------------------------------------------- a busca */

/* No ar a busca nao buscava (mostrava sempre os mesmos dois resultados
   escritos no codigo). Esta e a buscar() do pacote, sem endpoint novo: o
   filtro roda no servidor sobre a mesma lista que o arquivo pede. Sem acento,
   sem caixa, o titulo pesa mais que o resumo, que pesa mais que o texto. */
const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export async function buscar(termo: string): Promise<ResumoDoArtigo[]> {
  const palavras = normal(termo).split(/\s+/).filter((p) => p.length > 1)
  if (!palavras.length) return []
  /* ~400 artigos com o texto inteiro passam de 2 MB, que e o teto do cache
     do Next: esta chamada nao fica em cache, e tudo bem, a busca e noindex e
     pouco usada */
  let todos: PostDaApi[] = []
  try {
    const res = await fetch(`${API_URL}/api/posts?limit=500&status=published`, { cache: 'no-store' })
    if (res.ok) todos = ((await res.json()) as Paginada).data ?? []
  } catch (error) {
    console.error('[blog] busca falhou:', error)
  }
  const achados: { p: PostDaApi; nota: number }[] = []
  for (const p of todos) {
    const titulo = normal(p.title)
    const meio = normal([p.excerpt, p.metaDescription, p.category?.name, ...(p.tags ?? []).map((t) => t.name)].join(' '))
    const texto = normal(semTags(p.content ?? ''))
    let nota = 0
    for (const palavra of palavras) {
      if (titulo.includes(palavra)) nota += 10
      else if (meio.includes(palavra)) nota += 4
      else if (texto.includes(palavra)) nota += 1
      else { nota = 0; break }
    }
    if (nota) achados.push({ p, nota })
  }
  return achados.sort((x, y) => y.nota - x.nota).map((x) => resumo(x.p))
}
