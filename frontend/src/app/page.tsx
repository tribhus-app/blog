import { Metadata } from 'next'
import Link from 'next/link'
import PostCard from '@/components/posts/PostCard'
import FeaturedPost from '@/components/posts/FeaturedPost'
import { getCategories, getPosts, getFeaturedPosts, getPopularPosts, CategoryResponse, PostResponse } from '@/services/api'
import { Post, Category } from '@/types'

export const metadata: Metadata = {
  title: 'Tribhus Blog | Rock Underground e Independente',
  description: 'O melhor conteudo sobre rock underground e independente. Noticias, lancamentos, entrevistas, reviews e muito mais do cenario musical alternativo.',
}

function mapCategoryToType(category: CategoryResponse): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    color: category.color || '#914100',
  }
}

function mapPostToType(post: PostResponse): Post {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content,
    coverImage: post.coverImage || '/images/placeholder-1.jpg',
    category: mapCategoryToType(post.category),
    author: {
      id: post.author.id,
      name: post.author.name,
      slug: post.author.slug,
      bio: post.author.bio || '',
      avatar: post.author.avatar || '',
      email: post.author.email,
      isAi: post.author.isAi,
    },
    tags: (post.tags || []).map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    status: post.status as 'draft' | 'published' | 'scheduled',
    featured: post.featured,
    publishedAt: post.publishedAt || post.createdAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    views: post.views,
  }
}

async function getData() {
  try {
    const [categoriesData, postsData, featuredData, popularData] = await Promise.all([
      getCategories().catch(() => []),
      getPosts({ limit: 10, status: 'published' }).catch(() => ({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } })),
      getFeaturedPosts(1).catch(() => []),
      getPopularPosts(5).catch(() => []),
    ])

    return {
      categories: categoriesData,
      posts: postsData.data,
      featuredPost: featuredData[0] || null,
      popularPosts: popularData,
    }
  } catch {
    return {
      categories: [],
      posts: [],
      featuredPost: null,
      popularPosts: [],
    }
  }
}

export default async function HomePage() {
  const { categories, posts, featuredPost, popularPosts } = await getData()

  const mappedCategories = categories.map(mapCategoryToType)
  const mappedPosts = posts.map(mapPostToType)
  const mappedFeatured = featuredPost ? mapPostToType(featuredPost) : null
  const mappedPopular = popularPosts.map(mapPostToType)

  const recentPosts = mappedFeatured
    ? mappedPosts.filter((post) => post.id !== mappedFeatured.id)
    : mappedPosts

  const hasContent = mappedPosts.length > 0 || mappedFeatured

  return (
    <div className="min-h-screen">
      {/* Hero - Featured Post */}
      {mappedFeatured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-10">
          <FeaturedPost post={mappedFeatured} />
        </section>
      )}

      {/* Sem conteúdo */}
      {!hasContent && (
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="py-16">
            <h2 className="text-3xl font-bold text-white mb-4">Em breve novos conteudos</h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Estamos preparando artigos incriveis sobre o cenario rock underground e independente.
            </p>
          </div>
        </section>
      )}

      {/* Categorias - navegação mais sutil */}
      {mappedCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-text-muted text-sm flex-shrink-0">Explorar:</span>
            {mappedCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="flex-shrink-0 text-text-secondary hover:text-white transition-colors text-sm font-medium"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      {hasContent && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Posts principais */}
            <div className="lg:col-span-8">
              {recentPosts.length > 0 && (
                <>
                  <div className="flex items-baseline justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Ultimas publicacoes</h2>
                    <Link
                      href="/arquivo"
                      className="text-text-muted hover:text-primary-light transition-colors text-sm"
                    >
                      Ver todas
                    </Link>
                  </div>

                  {/* Grid assimétrico mais interessante */}
                  <div className="space-y-12">
                    {/* Primeiro post maior */}
                    {recentPosts[0] && (
                      <PostCard post={recentPosts[0]} variant="large" priority={!mappedFeatured} />
                    )}

                    {/* Grid 2 colunas para os próximos */}
                    {recentPosts.length > 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {recentPosts.slice(1, 5).map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    )}

                    {/* Posts restantes em lista */}
                    {recentPosts.length > 5 && (
                      <div className="pt-8 border-t border-border/30">
                        <h3 className="text-lg font-semibold text-white mb-6">Mais artigos</h3>
                        <div className="space-y-1">
                          {recentPosts.slice(5).map((post) => (
                            <PostCard key={post.id} post={post} variant="minimal" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar - mais clean */}
            <aside className="lg:col-span-4 space-y-12">
              {/* Sobre */}
              <div>
                <p className="text-text-secondary leading-relaxed">
                  O <span className="text-white font-medium">Tribhus Blog</span> traz noticias,
                  reviews e entrevistas do cenario rock underground e independente brasileiro.
                </p>
                <Link
                  href="https://tribhus.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-light hover:text-primary-hover transition-colors text-sm mt-4"
                >
                  Conhecer o Tribhus
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              {/* Popular */}
              {mappedPopular.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-6">
                    Mais lidas
                  </h3>
                  <div className="space-y-6">
                    {mappedPopular.slice(0, 4).map((post) => (
                      <PostCard key={post.id} post={post} variant="horizontal" />
                    ))}
                  </div>
                </div>
              )}

              {/* Categorias */}
              {mappedCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-6">
                    Categorias
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mappedCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/categoria/${category.slug}`}
                        className="px-4 py-2 rounded-full text-sm text-text-secondary hover:text-white border border-border/50 hover:border-primary/50 transition-all"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2">Newsletter</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Receba as melhores noticias do rock direto no seu email.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full bg-dark/50 border border-border/50 rounded-xl px-4 py-3 text-white placeholder-text-muted focus:border-primary/50 focus:outline-none transition-colors text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-colors text-sm"
                  >
                    Inscrever-se
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Seção de categorias - redesenhada */}
      {mappedCategories.length > 0 && hasContent && (
        <section className="py-16 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-white mb-2">Explore por categoria</h2>
              <p className="text-text-muted">Encontre conteudo do seu interesse</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mappedCategories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={`/categoria/${category.slug}`}
                  className="group relative p-6 rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                  style={{ backgroundColor: `${category.color}10` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: `${category.color}20` }}
                  />
                  <div className="relative">
                    <div
                      className="w-3 h-3 rounded-full mb-4"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="text-white font-semibold mb-1 group-hover:text-primary-light transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-text-muted text-sm line-clamp-1">{category.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
