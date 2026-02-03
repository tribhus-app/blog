import { MetadataRoute } from 'next'

// Em producao, isso buscaria os dados da API
const categories = [
  'noticias',
  'lancamentos',
  'tecnologia',
  'novidades',
  'curiosidades',
  'entrevistas',
  'eventos',
  'reviews',
]

// Mock posts - em producao viria da API
const posts = [
  { slug: 'bandas-rock-underground-2025', updatedAt: '2025-01-26' },
  { slug: 'festival-bandas-independentes', updatedAt: '2025-01-25' },
  { slug: 'home-studio-gastando-pouco', updatedAt: '2025-01-24' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://blog.tribhus.com.br'

  // Paginas estaticas
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Categorias
  const categoryPages = categories.map((slug) => ({
    url: `${baseUrl}/categoria/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Posts
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...categoryPages, ...postPages]
}
