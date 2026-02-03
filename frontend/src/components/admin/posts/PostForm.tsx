'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import RichTextEditor from '@/components/admin/editor/RichTextEditor'
import SEOPanel from '@/components/admin/seo/SEOPanel'
import {
  AdminPost,
  AdminCategory,
  AdminTag,
  AdminAuthor,
  getCategories,
  getAuthors,
  getTags,
  createPost,
  updatePost,
  createTag,
  uploadImage,
} from '@/services/adminApi'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface PostFormProps {
  post?: AdminPost
  isEditing?: boolean
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function PostForm({ post, isEditing = false }: PostFormProps) {
  const router = useRouter()
  const { user } = useAdminAuth()

  // Form state
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || '')
  const [coverImage, setCoverImage] = useState(post?.coverImage || '')
  const [imageCredit, setImageCredit] = useState(post?.imageCredit || '')
  const [imageCreditUrl, setImageCreditUrl] = useState(post?.imageCreditUrl || '')
  const [categoryId, setCategoryId] = useState(post?.category?.id || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags?.map(t => t.id) || [])
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>(post?.status || 'draft')
  const [featured, setFeatured] = useState(post?.featured || false)
  const [scheduledAt, setScheduledAt] = useState(post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '')

  // SEO state
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword || '')
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || '')
  const [ogImage, setOgImage] = useState(post?.coverImage || '')

  // Data state
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [authors, setAuthors] = useState<AdminAuthor[]>([])
  const [tags, setTags] = useState<AdminTag[]>([])
  const [newTagName, setNewTagName] = useState('')

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && !post?.slug) {
      setSlug(slugify(title))
    }
  }, [title, isEditing, post?.slug])

  // Auto-set meta title from title
  useEffect(() => {
    if (!metaTitle && title) {
      setMetaTitle(title)
    }
  }, [title, metaTitle])

  async function loadData() {
    setIsLoading(true)
    try {
      const [categoriesData, authorsData, tagsData] = await Promise.all([
        getCategories(),
        getAuthors(),
        getTags(),
      ])
      setCategories(categoriesData)
      setAuthors(authorsData)
      setTags(tagsData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const onDropCover = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploadingCover(true)
    try {
      const result = await uploadImage(file)
      setCoverImage(result.url)
      if (!ogImage) {
        setOgImage(result.url)
      }
    } catch (err) {
      setError('Falha no upload da imagem de capa')
      console.error(err)
    } finally {
      setIsUploadingCover(false)
    }
  }, [ogImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCover,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  async function handleAddTag() {
    if (!newTagName.trim()) return

    try {
      const tag = await createTag({
        name: newTagName.trim(),
        slug: slugify(newTagName.trim()),
      })
      setTags([...tags, tag])
      setSelectedTags([...selectedTags, tag.id])
      setNewTagName('')
    } catch (err) {
      console.error('Failed to create tag:', err)
    }
  }

  async function handleSubmit(e: React.FormEvent, saveStatus?: 'draft' | 'published' | 'scheduled') {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSaving(true)

    const finalStatus = saveStatus || status

    try {
      const data = {
        title,
        slug,
        excerpt: excerpt || undefined,
        content,
        coverImage: coverImage || undefined,
        imageCredit: imageCredit || undefined,
        imageCreditUrl: imageCreditUrl || undefined,
        status: finalStatus,
        featured,
        scheduledAt: finalStatus === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        focusKeyword: focusKeyword || undefined,
        categoryId: categoryId || undefined,
        authorId: user?.id || '',
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      }

      if (isEditing && post) {
        await updatePost(post.id, data)
        setSuccessMessage('Post atualizado com sucesso!')
      } else {
        const newPost = await createPost(data)
        setSuccessMessage('Post criado com sucesso!')
        router.push(`/admin/posts/${newPost.id}/edit`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar post')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo do post"
              className="w-full px-4 py-3 bg-dark-card border border-border rounded-lg text-white text-xl font-semibold placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Conteudo
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Comece a escrever seu post..."
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Resumo (aparece na listagem)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-dark-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Breve descricao do post..."
            />
          </div>

          {/* SEO Panel */}
          <SEOPanel
            focusKeyword={focusKeyword}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            slug={slug}
            ogImage={ogImage}
            onFocusKeywordChange={setFocusKeyword}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={setMetaDescription}
            onSlugChange={setSlug}
            onOgImageChange={setOgImage}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish box */}
          <div className="bg-dark-card border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-medium text-white">Publicar</h3>

            {/* Status */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'scheduled')}
                className="w-full px-3 py-2 bg-dark-input border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="scheduled">Agendado</option>
              </select>
            </div>

            {/* Scheduled date */}
            {status === 'scheduled' && (
              <div>
                <label className="block text-sm text-text-secondary mb-2">Data de publicacao</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-input border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
            )}

            {/* Featured */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-dark-input text-primary focus:ring-primary focus:ring-offset-dark"
              />
              <span className="text-sm text-text-secondary">Destacar post</span>
            </label>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-dark hover:bg-dark-input border border-border text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Salvar Rascunho
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'published')}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>{isEditing ? 'Atualizar' : 'Publicar'}</span>
                )}
              </button>
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-dark-card border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-medium text-white">Imagem de Capa</h3>

            {coverImage ? (
              <div className="relative">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 p-2 bg-dark/80 rounded-lg text-white hover:bg-dark transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                {isUploadingCover ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-text-secondary text-sm">Enviando...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-8 h-8 mx-auto text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-text-secondary text-sm">Arraste ou clique</p>
                  </div>
                )}
              </div>
            )}

            {/* Creditos da imagem */}
            <div className="space-y-3 pt-3 border-t border-border">
              <h4 className="text-sm font-medium text-text-secondary">Creditos da Imagem</h4>
              <div>
                <label className="block text-xs text-text-muted mb-1">Nome/Fonte</label>
                <input
                  type="text"
                  value={imageCredit}
                  onChange={(e) => setImageCredit(e.target.value)}
                  placeholder="Ex: Foto por John Doe"
                  className="w-full px-3 py-2 bg-dark-input border border-border rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Link (opcional)</label>
                <input
                  type="url"
                  value={imageCreditUrl}
                  onChange={(e) => setImageCreditUrl(e.target.value)}
                  placeholder="https://instagram.com/fotografo"
                  className="w-full px-3 py-2 bg-dark-input border border-border rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-text-muted mt-1">Se preenchido, o credito sera clicavel</p>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-dark-card border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-medium text-white">Categoria</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-dark-input border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-dark-card border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-medium text-white">Tags</h3>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary text-white'
                      : 'bg-dark text-text-secondary hover:bg-dark-input'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.id])
                      } else {
                        setSelectedTags(selectedTags.filter(id => id !== tag.id))
                      }
                    }}
                    className="sr-only"
                  />
                  {tag.name}
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nova tag"
                className="flex-1 px-3 py-2 bg-dark-input border border-border rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-dark hover:bg-dark-input border border-border text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
