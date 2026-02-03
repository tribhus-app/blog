import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostCard from '@/components/posts/PostCard'
import { Post, Category } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_URL}/api/categories/${slug}`, {
      cache: 'no-store',
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
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || json || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getPostsByCategory(categoryId: string): Promise<{ posts: Post[], total: number }> {
  try {
    const res = await fetch(`${API_URL}/api/posts?categoryId=${categoryId}&limit=50`, {
      cache: 'no-store',
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

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategory(params.slug)

  if (!category) {
    return {
      title: 'Categoria nao encontrada',
    }
  }

  return {
    title: `${category.name} | Tribhus Blog`,
    description: category.description || `Artigos sobre ${category.name}`,
    openGraph: {
      title: `${category.name} | Tribhus Blog`,
      description: category.description || `Artigos sobre ${category.name}`,
      url: `https://blog.tribhus.com.br/categoria/${category.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} | Tribhus Blog`,
      description: category.description || `Artigos sobre ${category.name}`,
    },
    alternates: {
      canonical: `https://blog.tribhus.com.br/categoria/${category.slug}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  const { posts, total } = await getPostsByCategory(category.id)
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
            <a href="/" className="hover:text-white transition-colors">Inicio</a>
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
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">Nenhum artigo encontrado nesta categoria.</p>
            <a
              href="/"
              className="inline-block mt-4 text-primary-light hover:text-primary-hover transition-colors"
            >
              Voltar para o inicio
            </a>
          </div>
        )}
      </section>

      {/* Other Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-xl font-bold text-white mb-6">Outras Categorias</h2>
        <div className="flex flex-wrap gap-3">
          {allCategories
            .filter((c) => c.slug !== params.slug)
            .map((cat) => (
              <a
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
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
