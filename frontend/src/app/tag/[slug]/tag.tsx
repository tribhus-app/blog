import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostCard from '@/components/posts/PostCard'
import Paginacao, { POR_PAGINA, caminhoDaPagina } from '@/components/posts/Paginacao'
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

  if (!tag) {
    return {
      title: 'Tag não encontrada',
    }
  }

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-16 border-b border-border bg-primary/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <a href="/blog" className="hover:text-white transition-colors">Início</a>
            <span>/</span>
            <span>Tags</span>
            <span>/</span>
            <span className="text-primary-light">{tag.name}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl md:text-4xl text-primary-light">#</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{tag.name}</h1>
          </div>
          <p className="text-text-secondary">
            {total} {total === 1 ? 'post encontrado' : 'posts encontrados'}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Paginacao base={`/tag/${tag.slug}`} atual={pagina} total={totalPaginas} />
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">Nenhum post encontrado com esta tag.</p>
            <a
              href="/blog"
              className="inline-block mt-4 text-primary-light hover:text-primary-hover transition-colors"
            >
              Voltar para o início
            </a>
          </div>
        )}
      </section>

      {/* Other Tags */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-xl font-bold text-white mb-6">Outras Tags</h2>
        <div className="flex flex-wrap gap-3">
          {allTags
            .filter((t) => t.slug !== slug)
            .map((t) => (
              <a
                key={t.slug}
                href={`/blog/tag/${t.slug}`}
                className="px-4 py-2 bg-dark-card border border-border rounded-lg text-text-secondary hover:text-white hover:border-primary transition-all"
              >
                {t.name}
              </a>
            ))}
        </div>
      </section>
    </div>
  )
}
