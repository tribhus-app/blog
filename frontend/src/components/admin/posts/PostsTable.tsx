'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdminPost, deletePost, publishPost, unpublishPost } from '@/services/adminApi'

interface PostsTableProps {
  posts: AdminPost[]
  onRefresh: () => void
}

export default function PostsTable({ posts, onRefresh }: PostsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este post?')) return

    setDeletingId(id)
    try {
      await deletePost(id)
      onRefresh()
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Erro ao excluir post')
    } finally {
      setDeletingId(null)
    }
  }

  async function handlePublish(id: string) {
    setActionId(id)
    try {
      await publishPost(id)
      onRefresh()
    } catch (err) {
      console.error('Failed to publish post:', err)
      alert('Erro ao publicar post')
    } finally {
      setActionId(null)
    }
  }

  async function handleUnpublish(id: string) {
    setActionId(id)
    try {
      await unpublishPost(id)
      onRefresh()
    } catch (err) {
      console.error('Failed to unpublish post:', err)
      alert('Erro ao despublicar post')
    } finally {
      setActionId(null)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 text-xs rounded-full bg-accent-green/10 text-accent-green">Publicado</span>
      case 'scheduled':
        return <span className="px-2 py-1 text-xs rounded-full bg-accent-blue/10 text-accent-blue">Agendado</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-accent-yellow/10 text-accent-yellow">Rascunho</span>
    }
  }

  if (posts.length === 0) {
    return (
      <div className="bg-dark-card border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted">Nenhum post encontrado</p>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary-hover transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Criar primeiro post</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-dark-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Titulo</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Categoria</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Status</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Views</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Data</th>
              <th className="text-right px-4 py-3 text-text-secondary font-medium text-sm">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0 hover:bg-dark transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt=""
                        className="w-12 h-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="text-white hover:text-primary transition-colors font-medium block truncate max-w-xs"
                        >
                          {post.title}
                        </Link>
                        {post.sourceUrl && (
                          <a
                            href={post.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-primary hover:text-primary-light transition-colors"
                            title={`Fonte: ${post.sourceName || 'Ver original'}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {post.featured && (
                          <span className="text-xs text-primary">Destacado</span>
                        )}
                        {post.author?.isAi && (
                          <span className="text-xs text-accent-blue">IA</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-text-secondary text-sm">
                    {post.category?.name || '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(post.status)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-text-secondary text-sm">
                    {post.views.toLocaleString('pt-BR')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-text-secondary text-sm">
                    {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {post.status === 'published' ? (
                      <button
                        onClick={() => handleUnpublish(post.id)}
                        disabled={actionId === post.id}
                        className="p-2 text-text-muted hover:text-accent-yellow transition-colors disabled:opacity-50"
                        title="Despublicar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(post.id)}
                        disabled={actionId === post.id}
                        className="p-2 text-text-muted hover:text-accent-green transition-colors disabled:opacity-50"
                        title="Publicar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}

                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="p-2 text-text-muted hover:text-white transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>

                    {post.status === 'published' && (
                      <Link
                        href={`/${post.slug}`}
                        target="_blank"
                        className="p-2 text-text-muted hover:text-accent-blue transition-colors"
                        title="Ver no blog"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    )}

                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="p-2 text-text-muted hover:text-accent-red transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      {deletingId === post.id ? (
                        <div className="w-4 h-4 border-2 border-accent-red border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
