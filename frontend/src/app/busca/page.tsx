import { Metadata } from 'next'
import { PaginaDaBusca } from '@/components/blog/PaginaDaBusca'
import { POR_PAGINA, buscar, categorias, populares } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Busca | Tribhus Blog',
  description: 'Busque por artigos, notícias e conteúdos sobre rock underground e independente.',
  robots: {
    index: false,
    follow: true,
  },
}

type Props = { searchParams: { q?: string; page?: string } }

// Desenho do pacote do redesenho (30/10/2026). Ate aqui a busca do ar nao buscava:
// mostrava sempre dois resultados de exemplo escritos no codigo. Agora procura de
// verdade (buscar(), em lib/blog.ts), sem endpoint novo.
export default async function SearchPage({ searchParams }: Props) {
  const termo = (searchParams.q ?? '').trim().slice(0, 80)
  const [resultados, cats] = await Promise.all([termo ? buscar(termo) : Promise.resolve(null), categorias()])
  const total = Math.max(1, Math.ceil((resultados?.length ?? 0) / POR_PAGINA))
  const pedida = searchParams.page && /^\d+$/.test(searchParams.page) ? Math.max(1, Number(searchParams.page)) : 1
  const atual = Math.min(pedida, total)
  const itens = (resultados ?? []).slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA)
  // as Mais lidas so quando nao achou nada: quem nao achou tem por onde seguir
  const maisLidas = !resultados?.length ? await populares(4) : []
  return (
    <PaginaDaBusca
      termo={termo}
      resultados={resultados}
      pagina={{ atual, total, itens }}
      categorias={cats}
      maisLidas={maisLidas}
    />
  )
}
