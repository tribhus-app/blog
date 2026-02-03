import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/types'
import { imagePresets } from '@/lib/imagePresets'

interface PostCardProps {
  post: Post
  variant?: 'default' | 'large' | 'minimal' | 'horizontal'
  showExcerpt?: boolean
  priority?: boolean
}

export default function PostCard({ post, variant = 'default', showExcerpt = true, priority = false }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Card grande - para destaque secundário (ou fallback do LCP)
  if (variant === 'large') {
    return (
      <article className="group relative">
        <Link href={`/${post.slug}`} className="block">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority={priority}
                {...imagePresets.cardLarge}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-dark-card to-dark" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span
                className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: post.category.color, color: '#fff' }}
              >
                {post.category.name}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-primary-light transition-colors">
                {post.title}
              </h2>
              <p className="text-white/70 text-sm line-clamp-2">{post.excerpt}</p>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // Card horizontal - para listagens laterais
  if (variant === 'horizontal') {
    return (
      <article className="group">
        <Link href={`/${post.slug}`} className="flex gap-4 items-start">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                {...imagePresets.cardHorizontal}
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-dark-card" />
            )}
          </div>
          <div className="flex-1 pt-1">
            <span className="text-xs text-primary-light font-medium">{post.category.name}</span>
            <h3 className="text-white font-medium mt-1 line-clamp-2 group-hover:text-primary-light transition-colors">
              {post.title}
            </h3>
            <span className="text-xs text-text-muted mt-2 block">{formatDate(post.publishedAt)}</span>
          </div>
        </Link>
      </article>
    )
  }

  // Card mínimo - para listas simples
  if (variant === 'minimal') {
    return (
      <article className="group py-4 border-b border-border/30 last:border-0">
        <Link href={`/${post.slug}`} className="block">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: post.category.color }}
            />
            <span className="text-xs text-text-muted">{formatDate(post.publishedAt)}</span>
          </div>
          <h3 className="text-white font-medium group-hover:text-primary-light transition-colors">
            {post.title}
          </h3>
        </Link>
      </article>
    )
  }

  // Card padrão - redesenhado
  return (
    <article className="group">
      <Link href={`/${post.slug}`} className="block">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority={priority}
              {...imagePresets.cardDefault}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-dark-card to-dark" />
          )}
          {post.featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                Destaque
              </span>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: post.category.color }}
            >
              {post.category.name}
            </span>
            <span className="text-text-muted text-xs">{formatDate(post.publishedAt)}</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-light transition-colors line-clamp-2">
            {post.title}
          </h2>
          {showExcerpt && (
            <p className="text-text-secondary text-sm line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}