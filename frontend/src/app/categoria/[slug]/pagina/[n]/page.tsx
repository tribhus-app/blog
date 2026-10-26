import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { PaginaDaCategoria, metadataDaCategoria } from '../../categoria'

type Props = { params: { slug: string; n: string } }

function numero(n: string): number {
  return /^[0-9]+$/.test(n) ? parseInt(n, 10) : NaN
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pagina = numero(params.n)
  if (!(pagina >= 2)) return {}
  return metadataDaCategoria(params.slug, pagina)
}

export default function CategoriaPaginada({ params }: Props) {
  const pagina = numero(params.n)
  if (pagina === 1) permanentRedirect(`/categoria/${params.slug}`)
  if (!(pagina >= 2)) notFound()
  return <PaginaDaCategoria slug={params.slug} pagina={pagina} />
}
