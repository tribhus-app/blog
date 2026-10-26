import { Metadata } from 'next'
import { PaginaDaTag, metadataDaTag, slugsDasTags } from './tag'

// A lista mora em ./tag.tsx, dividida com /tag/[slug]/pagina/[n].
export async function generateStaticParams() {
  return slugsDasTags()
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return metadataDaTag(params.slug, 1)
}

export default function TagPage({ params }: { params: { slug: string } }) {
  return <PaginaDaTag slug={params.slug} pagina={1} />
}
