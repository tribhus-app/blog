import { Metadata } from 'next'
import { PaginaDaLista } from '@/components/blog/PaginaDaLista'
import { POR_PAGINA, doArquivo } from '@/lib/blog'

interface PageProps {
  searchParams: { page?: string }
}

// Canonico proprio (20/10/2026): sem ele a pagina herdava o do layout, que aponta para a home,
// e o Google ignorava o arquivo inteiro, que e o unico lugar com caminho para todos os posts.
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const pagina = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const url = `https://tribhus.com/blog/arquivo${pagina > 1 ? `?page=${pagina}` : ''}`
  const title = `Arquivo${pagina > 1 ? ` (página ${pagina})` : ''} | Tribhus Blog`
  const description = 'Todos os artigos do Tribhus Blog sobre rock underground e independente.'
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', images: ['/images/og-image.jpg'] },
  }
}

// Desenho do pacote do redesenho (30/10/2026): o molde e o ListaDoArquivo do exemplo.
export default async function ArchivePage({ searchParams }: PageProps) {
  const n = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const { artigos, total } = await doArquivo(n)
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  return (
    <PaginaDaLista
      migalha={[{ href: '/blog', t: 'Início' }, { t: 'Arquivo' }]}
      titulo="Todas as Publicações"
      contagem={`${total} ${total === 1 ? 'artigo publicado' : 'artigos publicados'}`}
      artigos={artigos}
      paginacao={{ atual: n, total: paginas, href: (k) => `/blog/arquivo${k > 1 ? `?page=${k}` : ''}` }}
      vazio={<><p>Nenhum artigo encontrado.</p><a className="blc-ver" href="/blog">Voltar para o início</a></>}
    />
  )
}
