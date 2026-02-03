import { Metadata } from 'next'
import PostCard from '@/components/posts/PostCard'
import { Post, Category } from '@/types'

export const metadata: Metadata = {
  title: 'Busca | Tribhus Blog',
  description: 'Busque por artigos, noticias e conteudos sobre rock underground e independente.',
  robots: {
    index: false,
    follow: true,
  },
}

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Noticias', slug: 'noticias', description: '', color: '#e74c3c' },
  { id: '2', name: 'Lancamentos', slug: 'lancamentos', description: '', color: '#2196F3' },
]

const mockAuthor = {
  id: '1',
  name: 'Tribhus',
  slug: 'tribhus',
  bio: '',
  avatar: '',
  email: '',
  isAi: false,
}

const mockResults: Post[] = [
  {
    id: '1',
    title: 'Resultado de busca exemplo 1',
    slug: 'resultado-exemplo-1',
    excerpt: 'Este e um resultado de exemplo para demonstrar a pagina de busca.',
    content: '',
    coverImage: '/images/placeholder-1.jpg',
    category: mockCategories[0],
    author: mockAuthor,
    tags: [],
    status: 'published',
    featured: false,
    publishedAt: '2025-01-26T10:00:00Z',
    createdAt: '2025-01-26T10:00:00Z',
    updatedAt: '2025-01-26T10:00:00Z',
    views: 450,
  },
  {
    id: '2',
    title: 'Resultado de busca exemplo 2',
    slug: 'resultado-exemplo-2',
    excerpt: 'Mais um resultado de exemplo para a busca.',
    content: '',
    coverImage: '/images/placeholder-2.jpg',
    category: mockCategories[1],
    author: mockAuthor,
    tags: [],
    status: 'published',
    featured: false,
    publishedAt: '2025-01-25T14:00:00Z',
    createdAt: '2025-01-25T14:00:00Z',
    updatedAt: '2025-01-25T14:00:00Z',
    views: 320,
  },
]

interface PageProps {
  searchParams: { q?: string }
}

export default function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || ''
  const results = query ? mockResults : []

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="bg-dark-card border-b border-border py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-6">Buscar</h1>
          <form action="/busca" method="GET">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Digite sua busca..."
                className="w-full bg-dark-input border border-border rounded-lg px-5 py-4 pl-12 text-white text-lg placeholder-text-muted focus:border-primary focus:outline-none transition-colors"
                autoFocus
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {query ? (
          <>
            <p className="text-text-muted mb-8">
              {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para{' '}
              <span className="text-white font-medium">&quot;{query}&quot;</span>
            </p>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg
                  className="w-16 h-16 mx-auto text-text-muted mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl text-white font-medium mb-2">Nenhum resultado encontrado</h2>
                <p className="text-text-muted mb-6">
                  Tente buscar por outros termos ou navegue pelas categorias.
                </p>
                <a
                  href="/"
                  className="inline-block text-primary-light hover:text-primary-hover transition-colors"
                >
                  Voltar para o inicio
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto text-text-muted mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-xl text-white font-medium mb-2">Faca uma busca</h2>
            <p className="text-text-muted">
              Digite um termo no campo acima para encontrar artigos.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
