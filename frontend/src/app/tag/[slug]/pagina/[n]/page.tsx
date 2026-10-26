import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { PaginaDaTag, metadataDaTag } from '../../tag'

type Props = { params: { slug: string; n: string } }

function numero(n: string): number {
  return /^[0-9]+$/.test(n) ? parseInt(n, 10) : NaN
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pagina = numero(params.n)
  if (!(pagina >= 2)) return {}
  return metadataDaTag(params.slug, pagina)
}

export default function TagPaginada({ params }: Props) {
  const pagina = numero(params.n)
  if (pagina === 1) permanentRedirect(`/tag/${params.slug}`)
  if (!(pagina >= 2)) notFound()
  return <PaginaDaTag slug={params.slug} pagina={pagina} />
}
