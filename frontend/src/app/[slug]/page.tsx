import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import PostCard from '@/components/posts/PostCard'
import ShareButtons from '@/components/posts/ShareButtons'
import PostContent from '@/components/posts/PostContent'
import ViewTracker from '@/components/posts/ViewTracker'
import { Post } from '@/types'
import { imagePresets } from '@/lib/imagePresets'

// Calcula tempo de leitura baseado no conteudo
function calculateReadingTime(content: string): number {
  // Remove tags HTML
  const text = content.replace(/<[^>]*>/g, '')
  // Conta palavras
  const words = text.trim().split(/\s+/).length
  // Media de 200 palavras por minuto
  const minutes = Math.ceil(words / 200)
  return Math.max(1, minutes) // Minimo 1 minuto
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/api/posts/slug/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || json
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

async function getRelatedPosts(categoryId: string, currentPostId: string): Promise<Post[]> {
  try {
    const res = await fetch(`${API_URL}/api/posts?categoryId=${categoryId}&limit=3`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    // Filter out current post
    return (data.posts || []).filter((p: Post) => p.id !== currentPostId).slice(0, 2)
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return { title: 'Artigo nao encontrado' }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    authors: [{ name: post.author?.name || 'Tribhus' }],
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: `https://blog.tribhus.com.br/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name || 'Tribhus'],
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: {
      canonical: `https://blog.tribhus.com.br/${post.slug}`,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.category?.id || '', post.id)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const category = post.category || { name: 'Sem categoria', slug: 'sem-categoria', color: '#914100' }
  const author = post.author || { name: 'Tribhus', bio: '', avatar: '' }
  const tags = post.tags || []
  const readingTime = calculateReadingTime(post.content)

  return (
    <>
      {/* Tracker de visualizacoes */}
      <ViewTracker postId={post.id} />

      {/* JSON-LD Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            author: {
              '@type': 'Organization',
              name: author.name,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Tribhus',
              logo: {
                '@type': 'ImageObject',
                url: 'https://blog.tribhus.com.br/images/logo.png',
              },
            },
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://blog.tribhus.com.br/${post.slug}`,
            },
          }),
        }}
      />

      <article className="min-h-screen">
        {/* Hero */}
        <header className="relative">
          {post.coverImage && (
            <div className="max-w-5xl mx-auto px-4">
              <div className="relative h-[55vh] md:h-[70vh] rounded-t-lg overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority={imagePresets.hero.priority}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 896px, 896px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
                {/* Creditos da imagem */}
                {post.imageCredit && (
                  <div className="absolute top-4 right-4 z-10">
                    {post.imageCreditUrl ? (
                      <a
                        href={post.imageCreditUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-dark/80 backdrop-blur-sm rounded text-xs text-text-secondary hover:text-white hover:bg-dark transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.imageCredit}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-dark/80 backdrop-blur-sm rounded text-xs text-text-secondary">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.imageCredit}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={`max-w-5xl mx-auto px-4 ${post.coverImage ? '-mt-32 relative z-10' : 'pt-12'}`}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <a href="/" className="hover:text-white transition-colors">Inicio</a>
              <span>/</span>
              <a
                href={`/categoria/${category.slug}`}
                className="hover:text-white transition-colors"
                style={{ color: category.color }}
              >
                {category.name}
              </a>
            </nav>

            {/* Category & Date */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.name}
              </span>
              <span className="text-text-muted">{formatDate(post.publishedAt)}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-text-secondary mb-8">
              {post.excerpt}
            </p>

            {/* Author & Stats */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-border">
              <div className="flex items-center gap-3">
                {author.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary text-lg font-medium">
                      {author.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{author.name}</p>
                  <p className="text-text-muted text-sm">Autor</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-text-muted text-sm">
                <span>{post.views || 0} visualizacoes</span>
                <span>{readingTime} min de leitura</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          <PostContent content={post.content} />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-sm font-medium text-text-muted mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any) => (
                  <a
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="px-3 py-1 bg-dark-card border border-border rounded-full text-sm text-text-secondary hover:text-white hover:border-primary transition-all"
                  >
                    {tag.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-sm font-medium text-text-muted mb-3">Compartilhar</h3>
            <ShareButtons title={post.title} slug={post.slug} />
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-dark-card border border-border rounded-lg">
            <div className="flex items-start gap-4">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-2xl font-medium">
                    {author.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold mb-1">{author.name}</h3>
                <p className="text-text-secondary text-sm">{author.bio || 'Equipe Tribhus'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
            <h2 className="text-2xl font-bold text-white mb-8">Artigos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}

