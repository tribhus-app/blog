import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostCard from '@/components/posts/PostCard'
import Paginacao, { POR_PAGINA, caminhoDaPagina } from '@/components/posts/Paginacao'
import { Post, Category } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_URL}/api/categories/${slug}`, {
      // ISR de 60s em vez de `cache: 'no-store'` (21/08/2026, auditoria de SEO).
      // Com no-store a pagina vira dinamica e o Next devolve
      // `Cache-Control: private, no-cache, no-store, must-revalidate`, que DESLIGA o
      // cache de voltar/avancar do navegador. Num blog, onde a pessoa entra num post e
      // volta para a lista, cada "voltar" recarregava tudo. 60s e o mesmo intervalo que
      // a pagina de post ja usava.
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || json
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
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
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getPostsByCategory(categoryId: string, pagina: number): Promise<{ posts: Post[], total: number }> {
  try {
    const res = await fetch(`${API_URL}/api/posts?categoryId=${categoryId}&limit=${POR_PAGINA}&page=${pagina}`, {
      // ISR de 60s em vez de `cache: 'no-store'` (21/08/2026, auditoria de SEO).
      // Com no-store a pagina vira dinamica e o Next devolve
      // `Cache-Control: private, no-cache, no-store, must-revalidate`, que DESLIGA o
      // cache de voltar/avancar do navegador. Num blog, onde a pessoa entra num post e
      // volta para a lista, cada "voltar" recarregava tudo. 60s e o mesmo intervalo que
      // a pagina de post ja usava.
      next: { revalidate: 60 },
    })
    if (!res.ok) return { posts: [], total: 0 }
    const json = await res.json()
    return {
      posts: json.data || json.posts || [],
      total: json.pagination?.total || json.total || 0
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], total: 0 }
  }
}

export async function metadataDaCategoria(slug: string, pagina: number): Promise<Metadata> {
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Categoria não encontrada',
    }
  }

  const sufixo = pagina > 1 ? ` (página ${pagina})` : ''
  const url = `https://tribhus.com/blog${caminhoDaPagina(`/categoria/${category.slug}`, pagina)}`
  return {
    title: `${category.name}${sufixo} | Tribhus Blog`,
    description: category.description || `Artigos sobre ${category.name}`,
    openGraph: {
      title: `${category.name} | Tribhus Blog`,
      description: category.description || `Artigos sobre ${category.name}`,
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
      title: `${category.name} | Tribhus Blog`,
      description: category.description || `Artigos sobre ${category.name}`,
    },
    alternates: {
      canonical: url,
    },
  }
}

export async function PaginaDaCategoria({ slug, pagina }: { slug: string; pagina: number }) {
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const { posts, total } = await getPostsByCategory(category.id, pagina)
  const totalPaginas = Math.ceil(total / POR_PAGINA)
  // pagina alem da ultima nao existe (e nao vira copia da primeira)
  if (pagina > 1 && posts.length === 0) notFound()
  const allCategories = await getCategories()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        className="relative py-16 border-b border-border"
        style={{ backgroundColor: `${category.color || '#914100'}10` }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <a href="/blog" className="hover:text-white transition-colors">Início</a>
            <span>/</span>
            <span>Categorias</span>
            <span>/</span>
            <span style={{ color: category.color || '#914100' }}>{category.name}</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color || '#914100' }}
            />
            <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
          </div>
          <p className="text-text-secondary max-w-2xl">{category.description || `Artigos sobre ${category.name}`}</p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {posts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-text-muted">
                {total} {total === 1 ? 'artigo encontrado' : 'artigos encontrados'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Paginacao base={`/categoria/${category.slug}`} atual={pagina} total={totalPaginas} />
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">Nenhum artigo encontrado nesta categoria.</p>
            <a
              href="/blog"
              className="inline-block mt-4 text-primary-light hover:text-primary-hover transition-colors"
            >
              Voltar para o início
            </a>
          </div>
        )}
      </section>

      {/* Other Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-xl font-bold text-white mb-6">Outras Categorias</h2>
        <div className="flex flex-wrap gap-3">
          {allCategories
            .filter((c) => c.slug !== slug)
            .map((cat) => (
              <a
                key={cat.slug}
                href={`/blog/categoria/${cat.slug}`}
                className="px-4 py-2 bg-dark-card border border-border rounded-lg text-text-secondary hover:text-white hover:border-primary transition-all"
              >
                {cat.name}
              </a>
            ))}
        </div>
      </section>
    </div>
  )
}
