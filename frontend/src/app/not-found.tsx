import { Metadata } from 'next'
import { NaoEncontradoDoBlog } from '@/components/blog/NaoEncontradoDoBlog'
import { recentes } from '@/lib/blog'

// O 404 do blog, em portugues, com a busca e as ultimas publicacoes (pacote de
// 30/10/2026). Antes era a tela padrao do Next, em ingles. noindex.
export const metadata: Metadata = { title: 'Página não encontrada | Tribhus Blog', robots: { index: false } }

export default async function NaoAchou() {
  return <NaoEncontradoDoBlog recentes={await recentes(4)} />
}
