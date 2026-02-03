'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatsCard from '@/components/admin/dashboard/StatsCard'
import { getStats, DashboardStats } from '@/services/adminApi'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      setError('Erro ao carregar estatisticas')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Posts"
          value={stats?.totalPosts ?? 0}
          color="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          }
        />
        <StatsCard
          title="Publicados"
          value={stats?.publishedPosts ?? 0}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <StatsCard
          title="Rascunhos"
          value={stats?.draftPosts ?? 0}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
        <StatsCard
          title="Visualizacoes"
          value={stats?.totalViews?.toLocaleString('pt-BR') ?? 0}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Posts Recentes</h2>
            <Link href="/admin/posts" className="text-primary hover:text-primary-hover text-sm">
              Ver todos
            </Link>
          </div>

          {stats?.recentPosts && stats.recentPosts.length > 0 ? (
            <ul className="space-y-3">
              {stats.recentPosts.slice(0, 5).map((post) => (
                <li key={post.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-white hover:text-primary transition-colors block truncate"
                    >
                      {post.title}
                    </Link>
                    <p className="text-text-muted text-xs mt-1">
                      {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ml-4 ${
                      post.status === 'published'
                        ? 'bg-accent-green/10 text-accent-green'
                        : post.status === 'scheduled'
                        ? 'bg-accent-blue/10 text-accent-blue'
                        : 'bg-accent-yellow/10 text-accent-yellow'
                    }`}
                  >
                    {post.status === 'published' ? 'Publicado' : post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted text-center py-8">Nenhum post encontrado</p>
          )}
        </div>

        <div className="bg-dark-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Acoes Rapidas</h2>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/posts/new"
              className="flex flex-col items-center justify-center p-6 bg-dark hover:bg-dark-input border border-border rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-white text-sm">Novo Post</span>
            </Link>

            <Link
              href="/admin/categories"
              className="flex flex-col items-center justify-center p-6 bg-dark hover:bg-dark-input border border-border rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-accent-yellow mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-white text-sm">Categorias</span>
            </Link>

            <Link
              href="/admin/authors"
              className="flex flex-col items-center justify-center p-6 bg-dark hover:bg-dark-input border border-border rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-accent-purple mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-white text-sm">Autores</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex flex-col items-center justify-center p-6 bg-dark hover:bg-dark-input border border-border rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-accent-blue mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="text-white text-sm">Ver Blog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
