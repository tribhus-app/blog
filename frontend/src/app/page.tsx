import { Metadata } from 'next'
import { PaginaDaCapa } from '@/components/blog/PaginaDaCapa'
import { capa } from '@/lib/blog'

// Desenho do pacote do redesenho (30/10/2026). Os metadados sao os do ar.
export const metadata: Metadata = {
  title: 'Tribhus Blog | Rock Underground e Independente',
  description: 'O melhor conteúdo sobre rock underground e independente. Notícias, lançamentos, entrevistas, reviews e muito mais do cenário musical alternativo.',
}

export default async function HomePage() {
  const dados = await capa()
  // Sem nenhum artigo (API fora do ar), a capa do pacote nao tem destaque para abrir
  if (!dados.recentes.length) {
    return (
      <main id="conteudo" className="bl blc">
        <h1 className="bl-rotulo">Em breve novos conteúdos</h1>
      </main>
    )
  }
  return <PaginaDaCapa capa={dados} />
}
