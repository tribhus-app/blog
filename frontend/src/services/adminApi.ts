import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

async function fetchAdminApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options
  const token = Cookies.get('admin_token')

  let url = `${API_URL}/api${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error || `API Error: ${response.status}`)
  }

  return response.json()
}

// Auth
export interface LoginResponse {
  token: string
  user: AdminUser
}

export interface AdminUser {
  id: string
  name: string
  email: string
  avatar: string | null
  isAdmin: boolean
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return fetchAdminApi<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getCurrentUser(): Promise<{ user: AdminUser }> {
  return fetchAdminApi<{ user: AdminUser }>('/auth/me')
}

// Stats
export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  scheduledPosts: number
  totalViews: number
  totalCategories: number
  totalAuthors: number
  recentPosts: AdminPost[]
}

export async function getStats(): Promise<DashboardStats> {
  return fetchAdminApi<DashboardStats>('/admin/stats')
}

// Posts
export interface AdminPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  imageCredit: string | null
  imageCreditUrl: string | null
  status: 'draft' | 'published' | 'scheduled'
  featured: boolean
  publishedAt: string | null
  scheduledAt: string | null
  views: number
  metaTitle: string | null
  metaDescription: string | null
  focusKeyword: string | null
  sourceUrl: string | null
  sourceName: string | null
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    slug: string
  } | null
  author: {
    id: string
    name: string
    isAi?: boolean
  }
  tags: { id: string; name: string; slug: string }[]
}

export interface GetAdminPostsParams {
  page?: number
  limit?: number
  status?: string
  categoryId?: string
  search?: string
  [key: string]: string | number | boolean | undefined
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getAdminPosts(params: GetAdminPostsParams = {}): Promise<PaginatedResponse<AdminPost>> {
  return fetchAdminApi<PaginatedResponse<AdminPost>>('/admin/posts', { params })
}

export async function getAdminPost(id: string): Promise<AdminPost> {
  const response = await fetchAdminApi<{ data: AdminPost }>(`/admin/posts/${id}`)
  return response.data
}

export interface CreatePostData {
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  imageCredit?: string
  imageCreditUrl?: string
  status: 'draft' | 'published' | 'scheduled'
  featured?: boolean
  scheduledAt?: string
  metaTitle?: string
  metaDescription?: string
  focusKeyword?: string
  categoryId?: string
  authorId: string
  tagIds?: string[]
}

export async function createPost(data: CreatePostData): Promise<AdminPost> {
  const response = await fetchAdminApi<{ data: AdminPost }>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.data
}

export async function updatePost(id: string, data: Partial<CreatePostData>): Promise<AdminPost> {
  const response = await fetchAdminApi<{ data: AdminPost }>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.data
}

export async function deletePost(id: string): Promise<void> {
  await fetchAdminApi(`/posts/${id}`, { method: 'DELETE' })
}

export async function publishPost(id: string): Promise<AdminPost> {
  const response = await fetchAdminApi<{ data: AdminPost }>(`/posts/${id}/publish`, {
    method: 'PATCH',
  })
  return response.data
}

export async function unpublishPost(id: string): Promise<AdminPost> {
  const response = await fetchAdminApi<{ data: AdminPost }>(`/posts/${id}/unpublish`, {
    method: 'PATCH',
  })
  return response.data
}

// Categories
export interface AdminCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  postCount: number
  createdAt: string
}

export async function getCategories(): Promise<AdminCategory[]> {
  const response = await fetchAdminApi<{ data: AdminCategory[] }>('/categories')
  return response.data
}

export async function createCategory(data: { name: string; slug: string; description?: string; color?: string }): Promise<AdminCategory> {
  const response = await fetchAdminApi<{ data: AdminCategory }>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.data
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string; color?: string }): Promise<AdminCategory> {
  const response = await fetchAdminApi<{ data: AdminCategory }>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.data
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchAdminApi(`/categories/${id}`, { method: 'DELETE' })
}

// Authors
export interface AdminAuthor {
  id: string
  name: string
  slug: string
  bio: string | null
  avatar: string | null
  email: string
  isAi: boolean
  isAdmin: boolean
  postCount: number
  createdAt: string
}

export async function getAuthors(): Promise<AdminAuthor[]> {
  const response = await fetchAdminApi<{ data: AdminAuthor[] }>('/authors')
  return response.data
}

export async function createAuthor(data: { name: string; slug: string; email: string; password: string; bio?: string; avatar?: string; isAi?: boolean; isAdmin?: boolean }): Promise<AdminAuthor> {
  const response = await fetchAdminApi<{ data: AdminAuthor }>('/authors', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.data
}

export async function updateAuthor(id: string, data: Partial<{ name: string; slug: string; email: string; bio: string; avatar: string; isAi: boolean; isAdmin: boolean }>): Promise<AdminAuthor> {
  const response = await fetchAdminApi<{ data: AdminAuthor }>(`/authors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.data
}

export async function deleteAuthor(id: string): Promise<void> {
  await fetchAdminApi(`/authors/${id}`, { method: 'DELETE' })
}

// Tags
export interface AdminTag {
  id: string
  name: string
  slug: string
}

export async function getTags(): Promise<AdminTag[]> {
  const response = await fetchAdminApi<{ data: AdminTag[] }>('/tags')
  return response.data
}

export async function createTag(data: { name: string; slug: string }): Promise<AdminTag> {
  const response = await fetchAdminApi<{ data: AdminTag }>('/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.data
}

export async function deleteTag(id: string): Promise<void> {
  await fetchAdminApi(`/tags/${id}`, { method: 'DELETE' })
}

// Upload
export async function uploadImage(file: File): Promise<{ url: string }> {
  const token = Cookies.get('admin_token')
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Falha no upload da imagem')
  }

  return response.json()
}

// ========================================
// IA - Geracao Automatica de Artigos
// ========================================

export interface AiSchedulerStatus {
  scheduler: {
    enabled: boolean
    nextRun: string | null
    lastRun: string | null
    isJobRunning: boolean
  }
  config: {
    claudeConfigured: boolean
    tavilyConfigured: boolean
    searchMode: 'tavily' | 'rss'
    timezone: string
    schedule: string
    maxArticlesPerRun: number
  }
  searchInfo: {
    mode: 'tavily' | 'rss'
    description: string
  }
  todayCategory: {
    slug: string
    name: string
  }
  editorialCalendar: {
    day: string
    category: string
  }[]
  alerts: {
    type: string
    message: string
    timestamp: string
  }[]
  hasAlerts: boolean
}

export interface AiJobsStatus {
  claudeConfigured: boolean
  jobs: Record<string, {
    name: string
    lastRun: string | null
    nextRun: string | null
    isRunning: boolean
    lastResult?: {
      success: boolean
      articlesGenerated: number
      errors?: string[]
    }
  }>
}

export interface NewsPreviewItem {
  title: string
  source: string
  pubDate: string
  link: string
  hasImage: boolean
}

export interface GenerateResult {
  success: boolean
  articlesGenerated?: number
  articlesSkipped?: number
  articleId?: string
  message?: string
  error?: string
  errors?: string[]
  category?: string
  searchMode?: 'tavily' | 'rss'
}

// Buscar status do scheduler
export async function getAiSchedulerStatus(): Promise<AiSchedulerStatus> {
  return fetchAdminApi<AiSchedulerStatus>('/ai/scheduler/status')
}

// Buscar status dos jobs
export async function getAiJobsStatus(): Promise<AiJobsStatus> {
  return fetchAdminApi<AiJobsStatus>('/ai/jobs/status')
}

// Iniciar scheduler
export async function startAiScheduler(): Promise<{ success: boolean; message: string }> {
  return fetchAdminApi<{ success: boolean; message: string }>('/ai/scheduler/start', {
    method: 'POST',
  })
}

// Parar scheduler
export async function stopAiScheduler(): Promise<{ success: boolean; message: string }> {
  return fetchAdminApi<{ success: boolean; message: string }>('/ai/scheduler/stop', {
    method: 'POST',
  })
}

// Gerar artigos de noticias manualmente (timeout maior para geracao com IA)
export async function generateNewsArticles(categorySlug?: string): Promise<GenerateResult> {
  const token = Cookies.get('admin_token')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutos

  try {
    const response = await fetch(`${API_URL}/api/ai/generate/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ category: categorySlug }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(error.error || `API Error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido. A geracao pode ainda estar em andamento - verifique os rascunhos.')
    }
    throw error
  }
}

// Gerar artigo de boas-vindas para uma banda
export async function generateWelcomeArticle(bandId: number): Promise<GenerateResult> {
  return fetchAdminApi<GenerateResult>(`/ai/generate/welcome/${bandId}`, {
    method: 'POST',
  })
}

// Preview de noticias agregadas
export async function getNewsPreview(limit: number = 10): Promise<{ count: number; news: NewsPreviewItem[] }> {
  return fetchAdminApi<{ count: number; news: NewsPreviewItem[] }>('/ai/news/preview', {
    params: { limit },
  })
}
