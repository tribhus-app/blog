'use client'

import { useState } from 'react'

/**
 * Vídeo do YouTube que só carrega o player quando a pessoa clica.
 *
 * POR QUE ISSO EXISTE: cada `<iframe>` do YouTube baixa o player inteiro assim que a
 * página abre, mesmo que ninguém aperte o play. Medido em 21/08/2026: ~950 KB a 1,4 MB
 * e 180-300 ms de travamento POR VÍDEO. O blog tinha 695 iframes em 167 páginas; o post
 * "15 músicas para você passar o Natal com muito rock", com 16 vídeos, pesava 17 MB e
 * travava a tela por quase 3 segundos.
 *
 * Aqui só entra a miniatura (~15 KB). O player real é criado no clique, já com
 * `autoplay=1` — então continua sendo UM clique para assistir, igual a antes.
 *
 * Miniatura: `hqdefault` existe para todo vídeo. `maxresdefault` tem mais qualidade mas
 * devolve 404 em vídeo antigo, e aí a capa fica quebrada — por isso não é usada.
 */
export default function LiteYouTube({ id, titulo }: { id: string; titulo?: string }) {
  const [tocando, setTocando] = useState(false)
  const rotulo = titulo || 'Assistir ao vídeo no YouTube'

  if (tocando) {
    return (
      <div className="video-container my-6">
        <iframe
          className="w-full aspect-video rounded-lg"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={rotulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="video-container my-6">
      <button
        type="button"
        onClick={() => setTocando(true)}
        aria-label={rotulo}
        className="group relative block w-full aspect-video rounded-lg overflow-hidden bg-dark-card cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[68px] h-[48px] rounded-xl bg-black/70 group-hover:bg-[#f00] transition-colors">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    </div>
  )
}
