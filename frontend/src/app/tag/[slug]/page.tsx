import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostCard from '@/components/posts/PostCard'
import { Post, Tag } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface TagWithCount extends Tag {
  postCount?: number
}

async function getAllTags(): Promise<TagWithCount[]> {
  try {
    const res = await fetch(`${API_URL}/api/tags`, {
      cache: 'no-store',
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

async function getPostsByTag(slug: string): Promise<{ posts: Post[]; tag: Tag | null }> {
  try {
    const res = await fetch(`${API_URL}/api/tags/${slug}/posts?limit=50`, {
      cache: 'no-store',
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

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tag) => ({ slug: tag.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug)

  if (!tag) {
    return {
      title: 'Tag nao encontrada',
    }
  }

  const title = `Posts sobre ${tag.name} | Tribhus Blog`
  const description = `Confira todos os posts sobre ${tag.name} no Tribhus Blog. Rock independente, underground e muito mais.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://blog.tribhus.com.br/tag/${tag.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://blog.tribhus.com.br/tag/${tag.slug}`,
    },
    ...(tag.postCount !== undefined && tag.postCount < 3 && {
      robots: { index: false, follow: true },
    }),
  }
}

export default async function TagPage({ params }: PageProps) {
  const tag = await getTagBySlug(params.slug)

  if (!tag) {
    notFound()
  }

  const { posts } = await getPostsByTag(params.slug)
  const allTags = await getAllTags()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-16 border-b border-border bg-primary/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <a href="/" className="hover:text-white transition-colors">Inicio</a>
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
            {posts.length} {posts.length === 1 ? 'post encontrado' : 'posts encontrados'}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">Nenhum post encontrado com esta tag.</p>
            <a
              href="/"
              className="inline-block mt-4 text-primary-light hover:text-primary-hover transition-colors"
            >
              Voltar para o inicio
            </a>
          </div>
        )}
      </section>

      {/* Other Tags */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-xl font-bold text-white mb-6">Outras Tags</h2>
        <div className="flex flex-wrap gap-3">
          {allTags
            .filter((t) => t.slug !== params.slug)
            .map((t) => (
              <a
                key={t.slug}
                href={`/tag/${t.slug}`}
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
