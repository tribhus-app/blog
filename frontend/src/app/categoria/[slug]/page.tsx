import { Metadata } from 'next'
import { PaginaDaCategoria, metadataDaCategoria } from './categoria'

// A lista mora em ./categoria.tsx, dividida com /categoria/[slug]/pagina/[n].
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return metadataDaCategoria(params.slug, 1)
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <PaginaDaCategoria slug={params.slug} pagina={1} />
}
