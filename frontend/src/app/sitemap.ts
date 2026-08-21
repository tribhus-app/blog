import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getAllPosts(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/posts?limit=1000`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json = await res.json()
    const posts = json.data || json.posts || []
    return posts.map((p: { slug: string; updatedAt: string }) => ({
      slug: p.slug,
      updatedAt: p.updatedAt,
    }))
  } catch (error) {
    console.error('Sitemap: error fetching posts:', error)
    return []
  }
}

async function getIndexableCategories(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json = await res.json()
    const categories = json.data || json || []
    // Mesmo piso de 3 posts que as tags ja aplicavam. Sem ele entravam
    // /categoria/tecnologia (2 posts, 113 palavras) e /categoria/novidades (3 posts,
    // 163 palavras) — as duas paginas mais rasas do blog, e o Google ja indexou a
    // primeira. Categoria sem massa e pagina de passagem, nao pagina de destino.
    // Se `postCount` nao vier da API, mantem a categoria (nao derrubar por falta de dado).
    return categories.filter(
      (c: { postCount?: number }) => c.postCount === undefined || c.postCount >= 3
    )
  } catch (error) {
    console.error('Sitemap: error fetching categories:', error)
    return []
  }
}

async function getIndexableTags(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/tags`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json = await res.json()
    const tags = json.data || json || []
    return tags.filter((t: { postCount?: number }) => t.postCount !== undefined && t.postCount >= 3)
  } catch (error) {
    console.error('Sitemap: error fetching tags:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://blog.tribhus.com.br'

  const [posts, categories, tags] = await Promise.all([
    getAllPosts(),
    getIndexableCategories(),
    getIndexableTags(),
  ])

  // Paginas estaticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // /sobre e /contato foram REMOVIDAS em 21/08/2026: estavam escritas aqui na mao,
    // mas nao existe rota `app/sobre` nem `app/contato` no projeto — nunca existiram.
    // O Google confirmava 404 em /sobre desde 31/05/2026 e nunca chegou a buscar
    // /contato. Se um dia as paginas forem criadas, e so devolver estas linhas.
    {
      // Estava indexada, linkada no site e com impressao real na busca, mas fora do
      // sitemap.
      url: `${baseUrl}/arquivo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ]

  // Posts reais da API
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  // Categorias reais da API
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categoria/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Tags com 3+ posts (nao-noindex)
  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...postPages, ...categoryPages, ...tagPages]
}
