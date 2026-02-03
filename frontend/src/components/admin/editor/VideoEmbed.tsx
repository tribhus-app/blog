'use client'

import { useState } from 'react'

interface VideoEmbedProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string) => void
}

export default function VideoEmbed({ isOpen, onClose, onInsert }: VideoEmbedProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  function extractVideoId(url: string): { type: 'youtube' | 'vimeo' | null; id: string | null } {
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    if (youtubeMatch) {
      return { type: 'youtube', id: youtubeMatch[1] }
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
    const vimeoMatch = url.match(vimeoRegex)
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1] }
    }

    return { type: null, id: null }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { type, id } = extractVideoId(url)

    if (!type || !id) {
      setError('URL de video invalida. Use URLs do YouTube ou Vimeo.')
      return
    }

    onInsert(url)
    setUrl('')
    onClose()
  }

  function handleClose() {
    setUrl('')
    setError('')
    onClose()
  }

  const { type, id } = extractVideoId(url)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-border rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-white">Inserir Video</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-text-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="video-url" className="block text-sm font-medium text-text-secondary mb-2">
              URL do Video (YouTube ou Vimeo)
            </label>
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 bg-dark-input border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>

          {error && (
            <p className="text-accent-red text-sm">{error}</p>
          )}

          {type && id && (
            <div className="bg-dark rounded-lg p-4">
              <p className="text-text-secondary text-sm mb-2">Preview:</p>
              <div className="aspect-video rounded-lg overflow-hidden">
                {type === 'youtube' && (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                )}
                {type === 'vimeo' && (
                  <iframe
                    src={`https://player.vimeo.com/video/${id}`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-text-secondary hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            >
              Inserir
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
