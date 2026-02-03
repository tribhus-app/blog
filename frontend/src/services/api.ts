const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

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
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

export interface ApiResponse<T> {
  data: T
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

export interface CategoryResponse {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  createdAt: string
  postCount: number
}

export interface AuthorResponse {
  id: string
  name: string
  slug: string
  bio: string | null
  avatar: string | null
  email: string
  isAi: boolean
}

export interface TagResponse {
  id: string
  name: string
  slug: string
}

export interface PostResponse {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  status: string
  featured: boolean
  publishedAt: string | null
  scheduledAt: string | null
  views: number
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
  category: CategoryResponse
  author: AuthorResponse
  tags: TagResponse[]
}

// Categories
export async function getCategories(): Promise<CategoryResponse[]> {
  const response = await fetchApi<ApiResponse<CategoryResponse[]>>('/categories', {
    next: { revalidate: 3600 },
  })
  return response.data
}

export async function getCategoryBySlug(slug: string): Promise<CategoryResponse | null> {
  try {
    const response = await fetchApi<ApiResponse<CategoryResponse>>(`/categories/${slug}`, {
      next: { revalidate: 3600 },
    })
    return response.data
  } catch {
    return null
  }
}

// Posts
export interface GetPostsParams {
  page?: number
  limit?: number
  categoryId?: string
  status?: string
}

export async function getPosts(params: GetPostsParams = {}): Promise<PaginatedResponse<PostResponse>> {
  return fetchApi<PaginatedResponse<PostResponse>>('/posts', {
    params: params as Record<string, string | number | boolean | undefined>,
    next: { revalidate: 60 },
  })
}

export async function getPostBySlug(slug: string): Promise<PostResponse | null> {
  try {
    const response = await fetchApi<ApiResponse<PostResponse>>(`/posts/${slug}`, {
      next: { revalidate: 60 },
    })
    return response.data
  } catch {
    return null
  }
}

export async function getFeaturedPosts(limit = 5): Promise<PostResponse[]> {
  const response = await fetchApi<ApiResponse<PostResponse[]>>('/posts/featured', {
    params: { limit },
    next: { revalidate: 60 },
  })
  return response.data
}

export async function getPopularPosts(limit = 5): Promise<PostResponse[]> {
  const response = await fetchApi<ApiResponse<PostResponse[]>>('/posts/popular', {
    params: { limit },
    next: { revalidate: 60 },
  })
  return response.data
}

export async function getPostsByCategory(
  categorySlug: string,
  params: GetPostsParams = {}
): Promise<PaginatedResponse<PostResponse>> {
  return fetchApi<PaginatedResponse<PostResponse>>(`/posts/category/${categorySlug}`, {
    params: params as Record<string, string | number | boolean | undefined>,
    next: { revalidate: 60 },
  })
}

// Authors
export async function getAuthors(): Promise<AuthorResponse[]> {
  const response = await fetchApi<ApiResponse<AuthorResponse[]>>('/authors', {
    next: { revalidate: 3600 },
  })
  return response.data
}

export async function getAuthorBySlug(slug: string): Promise<AuthorResponse | null> {
  try {
    const response = await fetchApi<ApiResponse<AuthorResponse>>(`/authors/${slug}`, {
      next: { revalidate: 3600 },
    })
    return response.data
  } catch {
    return null
  }
}

// Tags
export async function getTags(): Promise<TagResponse[]> {
  const response = await fetchApi<ApiResponse<TagResponse[]>>('/tags', {
    next: { revalidate: 3600 },
  })
  return response.data
}

// Search
export interface SearchParams {
  q: string
  page?: number
  limit?: number
}

export async function searchPosts(params: SearchParams): Promise<PaginatedResponse<PostResponse>> {
  return fetchApi<PaginatedResponse<PostResponse>>('/search', {
    params: params as unknown as Record<string, string | number | boolean | undefined>,
  })
}
