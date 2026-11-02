import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { POR_PAGINA, caminhoDaPagina } from '@/components/posts/Paginacao'
import { PaginaDaLista } from '@/components/blog/PaginaDaLista'
import { resumo } from '@/lib/blog'
import { Post, Tag } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface TagWithCount extends Tag {
  postCount?: number
}

async function getAllTags(): Promise<TagWithCount[]> {
  try {
    const res = await fetch(`${API_URL}/api/tags`, {
      // ISR de 60s em vez de `cache: 'no-store'` (21/08/2026, auditoria de SEO).
      // Com no-store a pagina vira dinamica e o Next devolve
      // `Cache-Control: private, no-cache, no-store, must-revalidate`, que DESLIGA o
      // cache de voltar/avancar do navegador. Num blog, onde a pessoa entra num post e
      // volta para a lista, cada "voltar" recarregava tudo. 60s e o mesmo intervalo que
      // a pagina de post ja usava.
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || json || []
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}

async function getTagBySlug(slug: string): Promise<TagWithCount | null> {
  try {
    const tags = await getAllTags()
    return tags.find((t) => t.slug === slug) || null
  } catch (error) {
    console.error('Error fetching tag:', error)
    return null
  }
}

async function getPostsByTag(slug: string, pagina: number): Promise<{ posts: Post[]; tag: Tag | null }> {
  try {
    const res = await fetch(`${API_URL}/api/tags/${slug}/posts?limit=${POR_PAGINA}&page=${pagina}`, {
      // ISR de 60s em vez de `cache: 'no-store'` (21/08/2026, auditoria de SEO).
      // Com no-store a pagina vira dinamica e o Next devolve
      // `Cache-Control: private, no-cache, no-store, must-revalidate`, que DESLIGA o
      // cache de voltar/avancar do navegador. Num blog, onde a pessoa entra num post e
      // volta para a lista, cada "voltar" recarregava tudo. 60s e o mesmo intervalo que
      // a pagina de post ja usava.
      next: { revalidate: 60 },
    })
    if (!res.ok) return { posts: [], tag: null }
    const json = await res.json()
    return {
      posts: json.data || json.posts || [],
      tag: json.tag || null,
    }
  } catch (error) {
    console.error('Error fetching posts by tag:', error)
    return { posts: [], tag: null }
  }
}

export async function slugsDasTags() {
  const tags = await getAllTags()
  return tags.map((tag) => ({ slug: tag.slug }))
}

export async function metadataDaTag(slug: string, pagina: number): Promise<Metadata> {
  const tag = await getTagBySlug(slug)

  // o 404 sai ja dos metadados, para o status voltar 404 de verdade
  if (!tag) notFound()
  if (pagina > 1 && (await getPostsByTag(slug, pagina)).posts.length === 0) notFound()

  const sufixo = pagina > 1 ? ` (página ${pagina})` : ''
  const url = `https://tribhus.com/blog${caminhoDaPagina(`/tag/${tag.slug}`, pagina)}`
  const title = `Posts sobre ${tag.name}${sufixo} | Tribhus Blog`
  const description = `Confira todos os posts sobre ${tag.name} no Tribhus Blog. Rock independente, underground e muito mais.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      // Ao definir `openGraph` aqui, o Next SUBSTITUI o bloco do layout inteiro — e a
      // imagem padrao se perdia junto. Eram 42 tags e 8 categorias indo para o WhatsApp
      // e o Instagram sem miniatura nenhuma (auditoria de 21/08/2026).
      images: ['/images/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/images/og-image.jpg'],
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    ...(tag.postCount !== undefined && tag.postCount < 3 && {
      robots: { index: false, follow: true },
    }),
  }
}

export async function PaginaDaTag({ slug, pagina }: { slug: string; pagina: number }) {
  const tag = await getTagBySlug(slug)

  if (!tag) {
    notFound()
  }

  const { posts } = await getPostsByTag(slug, pagina)
  const total = tag.postCount ?? posts.length
  const totalPaginas = Math.ceil(total / POR_PAGINA)
  if (pagina > 1 && posts.length === 0) notFound()
  const allTags = await getAllTags()

  // Desenho do pacote do redesenho (30/10/2026); as palavras sao as do ar
  return (
    <PaginaDaLista
      migalha={[{ href: '/blog', t: 'Início' }, { t: 'Tags' }, { t: tag.name }]}
      titulo={tag.name}
      prefixo="#"
      contagem={`${total} ${total === 1 ? 'post encontrado' : 'posts encontrados'}`}
      artigos={posts.map((p) => resumo(p as never))}
      paginacao={{ atual: pagina, total: totalPaginas, href: (k) => `/blog${caminhoDaPagina(`/tag/${tag.slug}`, k)}` }}
      /* a tag sem nenhum post tem pagina: ela diz isso e aponta para o arquivo */
      vazio={<><p>Ainda não há posts com esta tag.</p><a className="blc-ver" href="/blog/arquivo">Ver todas as publicações</a></>}
      outras={{ titulo: 'Outras Tags', tag: true, itens: allTags.filter((t) => t.slug !== slug && (t.postCount ?? 0) > 0).map((t) => ({ href: `/blog/tag/${t.slug}`, t: t.name })) }}
    />
  )
}
