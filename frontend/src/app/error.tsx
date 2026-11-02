'use client'

import { ErroDoBlog } from '@/components/blog/ErroDoBlog'

// A tela de erro do blog (pacote de 30/10/2026). No ar nao existia.
export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return <ErroDoBlog tentar={reset} />
}
