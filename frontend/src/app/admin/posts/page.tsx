'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PostsTable from '@/components/admin/posts/PostsTable'
import { getAdminPosts, getCategories, AdminPost, AdminCategory, PaginatedResponse } from '@/services/adminApi'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadPosts()
  }, [statusFilter, categoryFilter, currentPage])

  async function loadCategories() {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  async function loadPosts() {
    setIsLoading(true)
    setError('')
    try {
      const response = await getAdminPosts({
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        search: search || undefined,
      })
      setPosts(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError('Erro ao carregar posts')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setCurrentPage(1)
    loadPosts()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Post</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-border rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar posts..."
              className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-dark-input border border-border rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="">Todos os status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
            <option value="scheduled">Agendados</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-dark-input border border-border rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-dark hover:bg-dark-input border border-border text-white rounded-lg transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <PostsTable posts={posts} onRefresh={loadPosts} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-text-muted text-sm">
                Mostrando {posts.length} de {pagination.total} posts
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-dark hover:bg-dark-input border border-border text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-text-secondary">
                  Pagina {currentPage} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 bg-dark hover:bg-dark-input border border-border text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
