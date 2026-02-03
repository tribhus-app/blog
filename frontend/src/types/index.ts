export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  imageCredit?: string
  imageCreditUrl?: string
  category: Category
  author: Author
  tags: Tag[]
  status: 'draft' | 'published' | 'scheduled'
  featured: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
  metaTitle?: string
  metaDescription?: string
  views: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  color: string
  postCount?: number
}

export interface Author {
  id: string
  name: string
  slug: string
  bio: string
  avatar: string
  email: string
  isAi: boolean
}

export interface Tag {
  id: string
  name: string
  slug: string
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

export interface ApiError {
  message: string
  code: string
}
