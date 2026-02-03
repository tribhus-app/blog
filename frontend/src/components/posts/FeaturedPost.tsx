import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/types'
import { imagePresets } from '@/lib/imagePresets'

interface FeaturedPostProps {
  post: Post
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <article className="group relative">
      <Link href={`/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              {...imagePresets.hero}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-dark-card to-dark" />
          )}

          {/* Gradient overlay mais suave */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

          {/* Conteúdo */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <div className="max-w-3xl">
              {/* Tags */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-sm font-medium"
                  style={{ color: post.category.color }}
                >
                  {post.category.name}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-white/60 text-sm">{formatDate(post.publishedAt)}</span>
              </div>

              {/* Título */}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary-light transition-colors duration-300">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-white/70 text-base md:text-lg mb-6 line-clamp-2 max-w-2xl">
                {post.excerpt}
              </p>

              {/* Autor e CTA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.author.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center ring-2 ring-white/20">
                      <span className="text-white font-medium">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-white font-medium block">{post.author.name}</span>
                    {post.author.isAi && (
                      <span className="text-white/50 text-xs">Conteudo assistido por IA</span>
                    )}
                  </div>
                </div>

                <span className="hidden md:flex items-center gap-2 text-primary-light font-medium group-hover:gap-3 transition-all">
                  Ler artigo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}