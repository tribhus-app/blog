'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  postId: string
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // Registra a visualização apenas uma vez por sessão
    const viewedPosts = sessionStorage.getItem('viewedPosts')
    const viewed = viewedPosts ? JSON.parse(viewedPosts) : []

    if (!viewed.includes(postId)) {
      // Usa URL relativa - nginx roteia /api para o backend
      fetch(`/api/posts/${postId}/view`, {
        method: 'POST',
      }).catch(console.error)

      viewed.push(postId)
      sessionStorage.setItem('viewedPosts', JSON.stringify(viewed))
    }
  }, [postId])

  return null
}
