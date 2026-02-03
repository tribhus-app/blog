'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { getAuthors, createAuthor, updateAuthor, deleteAuthor, uploadImage, AdminAuthor } from '@/services/adminApi'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AdminAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<AdminAuthor | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isAi, setIsAi] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    loadAuthors()
  }, [])

  useEffect(() => {
    if (!editingAuthor && name) {
      setSlug(slugify(name))
    }
  }, [name, editingAuthor])

  async function loadAuthors() {
    setIsLoading(true)
    try {
      const data = await getAuthors()
      setAuthors(data)
    } catch (err) {
      setError('Erro ao carregar autores')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setSlug('')
    setEmail('')
    setPassword('')
    setBio('')
    setAvatar('')
    setIsAi(false)
    setIsAdmin(false)
    setEditingAuthor(null)
    setIsFormOpen(false)
  }

  function handleEdit(author: AdminAuthor) {
    setEditingAuthor(author)
    setName(author.name)
    setSlug(author.slug)
    setEmail(author.email)
    setPassword('')
    setBio(author.bio || '')
    setAvatar(author.avatar || '')
    setIsAi(author.isAi)
    setIsAdmin(author.isAdmin)
    setIsFormOpen(true)
  }

  const onDropAvatar = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const result = await uploadImage(file)
      setAvatar(result.url)
    } catch (err) {
      console.error('Failed to upload avatar:', err)
    } finally {
      setIsUploadingAvatar(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropAvatar,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      if (editingAuthor) {
        await updateAuthor(editingAuthor.id, {
          name,
          slug,
          email,
          bio,
          avatar,
          isAi,
          isAdmin,
        })
      } else {
        if (!password) {
          setError('Senha e obrigatoria para novos autores')
          setIsSaving(false)
          return
        }
        await createAuthor({
          name,
          slug,
          email,
          password,
          bio,
          avatar,
          isAi,
          isAdmin,
        })
      }
      resetForm()
      loadAuthors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar autor')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este autor?')) return

    try {
      await deleteAuthor(id)
      loadAuthors()
    } catch (err) {
      setError('Erro ao excluir autor')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Autores</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Autor</span>
        </button>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-card border border-border rounded-xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-white">
                {editingAuthor ? 'Editar Autor' : 'Novo Autor'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-text-muted hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Avatar</label>
                {avatar ? (
                  <div className="relative w-24 h-24">
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="absolute -top-2 -right-2 p-1 bg-dark rounded-full text-white hover:bg-dark-input transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {isUploadingAvatar ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="Nome do autor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="slug-do-autor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Senha {editingAuthor && <span className="text-text-muted">(deixe vazio para manter)</span>}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  required={!editingAuthor}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Breve biografia do autor"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-dark-input text-primary focus:ring-primary focus:ring-offset-dark"
                  />
                  <span className="text-sm text-text-secondary">Administrador</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAi}
                    onChange={(e) => setIsAi(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-dark-input text-primary focus:ring-primary focus:ring-offset-dark"
                  />
                  <span className="text-sm text-text-secondary">Autor IA</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-text-secondary hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{editingAuthor ? 'Atualizar' : 'Criar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authors grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : authors.length === 0 ? (
        <div className="bg-dark-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted">Nenhum autor encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map((author) => (
            <div
              key={author.id}
              className="bg-dark-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-dark rounded-full flex items-center justify-center flex-shrink-0">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {author.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{author.name}</h3>
                    {author.isAdmin && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent-purple/10 text-accent-purple">
                        Admin
                      </span>
                    )}
                    {author.isAi && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent-blue/10 text-accent-blue">
                        IA
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-sm truncate">{author.email}</p>
                  {author.bio && (
                    <p className="text-text-secondary text-sm mt-1 line-clamp-2">{author.bio}</p>
                  )}
                  <p className="text-text-muted text-xs mt-2">{author.postCount} posts</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => handleEdit(author)}
                  className="p-2 text-text-muted hover:text-white transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(author.id)}
                  className="p-2 text-text-muted hover:text-accent-red transition-colors"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
