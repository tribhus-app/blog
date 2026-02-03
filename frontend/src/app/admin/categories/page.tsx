'use client'

import { useEffect, useState } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory, AdminCategory } from '@/services/adminApi'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#914100')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (!editingCategory && name) {
      setSlug(slugify(name))
    }
  }, [name, editingCategory])

  async function loadCategories() {
    setIsLoading(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError('Erro ao carregar categorias')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setSlug('')
    setDescription('')
    setColor('#914100')
    setEditingCategory(null)
    setIsFormOpen(false)
  }

  function handleEdit(category: AdminCategory) {
    setEditingCategory(category)
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description || '')
    setColor(category.color || '#914100')
    setIsFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name, slug, description, color })
      } else {
        await createCategory({ name, slug, description, color })
      }
      resetForm()
      loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      await deleteCategory(id)
      loadCategories()
    } catch (err) {
      setError('Erro ao excluir categoria')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Categorias</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nova Categoria</span>
        </button>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-border rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="Nome da categoria"
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
                  placeholder="slug-da-categoria"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Descricao</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Descricao da categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Cor</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-4 py-2 bg-dark-input border border-border rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
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
                  <span>{editingCategory ? 'Atualizar' : 'Criar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-dark-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted">Nenhuma categoria encontrada</p>
        </div>
      ) : (
        <div className="bg-dark-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Cor</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Nome</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Slug</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Posts</th>
                <th className="text-right px-4 py-3 text-text-secondary font-medium text-sm">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border last:border-0 hover:bg-dark transition-colors">
                  <td className="px-4 py-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: category.color || '#914100' }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{category.name}</span>
                    {category.description && (
                      <p className="text-text-muted text-sm truncate max-w-xs">{category.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text-secondary text-sm">{category.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text-secondary">{category.postCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-text-muted hover:text-white transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-text-muted hover:text-accent-red transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
