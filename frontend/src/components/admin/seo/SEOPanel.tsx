'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import GooglePreview from './GooglePreview'
import { uploadImage } from '@/services/adminApi'

interface SEOPanelProps {
  focusKeyword: string
  metaTitle: string
  metaDescription: string
  slug: string
  ogImage: string
  onFocusKeywordChange: (value: string) => void
  onMetaTitleChange: (value: string) => void
  onMetaDescriptionChange: (value: string) => void
  onSlugChange: (value: string) => void
  onOgImageChange: (value: string) => void
}

export default function SEOPanel({
  focusKeyword,
  metaTitle,
  metaDescription,
  slug,
  ogImage,
  onFocusKeywordChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onSlugChange,
  onOgImageChange,
}: SEOPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isUploadingOgImage, setIsUploadingOgImage] = useState(false)

  const titleLength = metaTitle.length
  const descriptionLength = metaDescription.length
  const titleProgress = Math.min((titleLength / 60) * 100, 100)
  const descriptionProgress = Math.min((descriptionLength / 160) * 100, 100)

  const fullUrl = `https://blog.tribhus.com.br/${slug}`

  const onDropOgImage = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploadingOgImage(true)
    try {
      const result = await uploadImage(file)
      onOgImageChange(result.url)
    } catch (err) {
      console.error('Failed to upload OG image:', err)
    } finally {
      setIsUploadingOgImage(false)
    }
  }, [onOgImageChange])

  const { getRootProps: getOgRootProps, getInputProps: getOgInputProps, isDragActive: isOgDragActive } = useDropzone({
    onDrop: onDropOgImage,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  function getProgressColor(length: number, max: number): string {
    const ratio = length / max
    if (ratio < 0.7) return 'bg-accent-yellow'
    if (ratio <= 1) return 'bg-accent-green'
    return 'bg-accent-red'
  }

  return (
    <div className="bg-dark-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="font-medium text-white">SEO</span>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-border space-y-6">
          {/* Focus Keyword */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Palavra-chave Principal
            </label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => onFocusKeywordChange(e.target.value)}
              className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              placeholder="Ex: rock underground brasileiro"
            />
          </div>

          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">
                Meta Title
              </label>
              <span className={`text-xs ${titleLength > 60 ? 'text-accent-red' : 'text-text-muted'}`}>
                {titleLength}/60 caracteres
              </span>
            </div>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              placeholder="Titulo para os mecanismos de busca"
            />
            <div className="w-full bg-dark-input rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full transition-all ${getProgressColor(titleLength, 60)}`}
                style={{ width: `${titleProgress}%` }}
              />
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">
                Meta Description
              </label>
              <span className={`text-xs ${descriptionLength > 160 ? 'text-accent-red' : 'text-text-muted'}`}>
                {descriptionLength}/160 caracteres
              </span>
            </div>
            <textarea
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Descricao para os mecanismos de busca"
            />
            <div className="w-full bg-dark-input rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full transition-all ${getProgressColor(descriptionLength, 160)}`}
                style={{ width: `${descriptionProgress}%` }}
              />
            </div>
          </div>

          {/* Slug/URL */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              URL/Slug
            </label>
            <div className="flex items-center">
              <span className="px-4 py-2 bg-dark border border-r-0 border-border rounded-l-lg text-text-muted text-sm">
                blog.tribhus.com.br/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="flex-1 px-4 py-2 bg-dark-input border border-border rounded-r-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                placeholder="meu-post"
              />
            </div>
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Imagem para Redes Sociais (OG Image)
            </label>
            {ogImage ? (
              <div className="relative">
                <img
                  src={ogImage}
                  alt="OG Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onOgImageChange('')}
                  className="absolute top-2 right-2 p-2 bg-dark/80 rounded-lg text-white hover:bg-dark transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                {...getOgRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isOgDragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getOgInputProps()} />
                {isUploadingOgImage ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-text-secondary">Enviando...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-8 h-8 mx-auto text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-text-secondary text-sm">
                      Arraste ou clique para adicionar (1200x630 recomendado)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Google Preview */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Preview do Google
            </label>
            <GooglePreview
              title={metaTitle}
              description={metaDescription}
              url={fullUrl}
            />
          </div>
        </div>
      )}
    </div>
  )
}
