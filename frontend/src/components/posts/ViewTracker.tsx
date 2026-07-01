'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  postId: string
}

// Gera/recupera um id de sessao estavel (por aba do navegador).
function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('analytics_sid')
    if (!sid) {
      sid =
        (crypto?.randomUUID?.() as string) ||
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      sessionStorage.setItem('analytics_sid', sid)
    }
    return sid
  } catch {
    return 'no-session'
  }
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    let viewId: string | null = null
    let maxScroll = 0
    let sent = false
    const startedAt = Date.now()

    const params = new URLSearchParams(window.location.search)
    const sessionId = getSessionId()

    // 1) Registra a view (uma vez por sessao por post). Mesmo se ja vista,
    //    seguimos medindo scroll/tempo so nao criamos novo evento.
    const viewedRaw = sessionStorage.getItem('viewedPosts')
    const viewed: string[] = viewedRaw ? JSON.parse(viewedRaw) : []
    const alreadyViewed = viewed.includes(postId)

    if (!alreadyViewed) {
      fetch(`/api/posts/${postId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          referer: document.referrer || null,
          utm_source: params.get('utm_source') || undefined,
          utm_medium: params.get('utm_medium') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          viewId = data?.viewId || null
        })
        .catch(() => {})

      viewed.push(postId)
      sessionStorage.setItem('viewedPosts', JSON.stringify(viewed))
    }

    // 2) Mede o scroll maximo (% do artigo lido)
    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      const pct = scrollable > 0 ? Math.round((doc.scrollTop / scrollable) * 100) : 100
      if (pct > maxScroll) maxScroll = Math.min(100, pct)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // 3) Ao sair/esconder a aba, envia tempo + scroll via sendBeacon
    const flush = () => {
      if (sent || !viewId) return
      sent = true
      const timeOnPage = Math.round((Date.now() - startedAt) / 1000)
      const payload = JSON.stringify({ time_on_page: timeOnPage, scroll_depth: maxScroll })
      const url = `/api/posts/view/${viewId}/engagement`
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }))
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          })
        }
      } catch {
        // best-effort
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)

    return () => {
      flush()
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
    }
  }, [postId])

  return null
}
