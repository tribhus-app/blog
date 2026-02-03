import { Metadata } from 'next'
import PostCard from '@/components/posts/PostCard'
import { Post } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const metadata: Metadata = {
  title: 'Arquivo | Tribhus Blog',
  description: 'Todos os artigos do Tribhus Blog sobre rock underground e independente.',
}

async function getAllPosts(page: number = 1): Promise<{ posts: Post[], total: number, totalPages: number }> {
  try {
    const res = await fetch(`${API_URL}/api/posts?page=${page}&limit=12`, {
      cache: 'no-store',
    })
    if (!res.ok) return { posts: [], total: 0, totalPages: 0 }
    const json = await res.json()
    return {
      posts: json.data || [],
      total: json.pagination?.total || 0,
      totalPages: json.pagination?.totalPages || 0,
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], total: 0, totalPages: 0 }
  }
}

interface PageProps {
  searchParams: { page?: string }
}

export default async function ArquivoPage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || '1')
  const { posts, total, totalPages } = await getAllPosts(currentPage)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <a href="/" className="hover:text-white transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white">Arquivo</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Todas as Publicacoes</h1>
          <p className="text-text-secondary">
            {total} {total === 1 ? 'artigo publicado' : 'artigos publicados'}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {currentPage > 1 && (
                  <a
                    href={`/arquivo?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-dark-card border border-border rounded-lg text-text-secondary hover:text-white hover:border-primary transition-all"
                  >
                    Anterior
                  </a>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <a
                        key={pageNum}
                        href={`/arquivo?page=${pageNum}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                          pageNum === currentPage
                            ? 'bg-primary text-white'
                            : 'bg-dark-card border border-border text-text-secondary hover:text-white hover:border-primary'
                        }`}
                      >
                        {pageNum}
                      </a>
                    )
                  })}
                </div>

                {currentPage < totalPages && (
                  <a
                    href={`/arquivo?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-dark-card border border-border rounded-lg text-text-secondary hover:text-white hover:border-primary transition-all"
                  >
                    Proxima
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">Nenhum artigo encontrado.</p>
            <a
              href="/"
              className="inline-block mt-4 text-primary-light hover:text-primary-hover transition-colors"
            >
              Voltar para o inicio
            </a>
          </div>
        )}
      </section>
    </div>
  )
}
