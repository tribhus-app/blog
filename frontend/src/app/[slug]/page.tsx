import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ViewTracker from '@/components/posts/ViewTracker'
import { PaginaDoArtigo } from '@/components/blog/PaginaDoArtigo'
import { prepararCorpo } from '@/components/blog/corpo'
import { artigo as artigoDoPost, bandasCitadas, postDaApi, relacionados } from '@/lib/blog'
import { generoDoPost } from '@/lib/generoDoSite'
import { Post } from '@/types'

// Desenho do pacote do redesenho (30/10/2026). Os metadados e o JSON-LD continuam os
// do ar, palavra por palavra; so a tela mudou. NENHUM loading.tsx no blog: com ele o
// Next comeca a mandar a pagina antes do notFound() e o 404 sai como 200.
async function getPost(slug: string): Promise<Post | null> {
  return (await postDaApi(slug)) as unknown as Post | null
}

/* O post-guia de genero (lib/generoDoSite.ts) leva ao catalogo do site. No ar era
   uma caixa propria em cima do texto; aqui e a caixa "Descubra na Tribhus" do
   pacote, que e o mesmo convite, no mesmo lugar. */
function guiaDoGenero(slug: string): string | undefined {
  const genero = generoDoPost(slug)
  if (!genero) return undefined
  const href = `https://tribhus.com${genero.path ?? `/genero/${genero.slug}`}`
  return `<aside class="bl-descubra bl-guia"><p class="bl-descubra-rot">Quer ouvir ${genero.nome} agora?</p>`
    + `<p>A Tribhus reúne bandas de ${genero.nome} com perfil, músicas e próximos shows.</p>`
    + `<p><a data-convite href="${href}">Ver as bandas de ${genero.nome}</a></p></aside>`
}

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug)

  // o 404 sai ja dos metadados, para o status voltar 404 de verdade
  if (!post) notFound()

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    authors: [{ name: post.author?.name || 'Tribhus' }],
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: `https://tribhus.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name || 'Tribhus'],
      // Sem width/height fixos de proposito: a capa nem sempre e 1200x630 (arte de
      // single costuma ser quadrada) e declarar dimensao errada e pior que nao
      // declarar — o crawler confia no metadado e corta a previa errado.
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: {
      canonical: `https://tribhus.com/blog/${post.slug}`,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const [artigo, rel] = await Promise.all([
    artigoDoPost(post as never),
    relacionados(post.id),
  ])
  const bandas = await bandasCitadas(prepararCorpo(artigo.content).bandasCitadas)
  const [proxima = null, ...outros] = rel

  const category = post.category || { name: 'Sem categoria', slug: 'sem-categoria', color: '#914100' }
  const author = post.author || { name: 'Tribhus', bio: '', avatar: '' }

  // O schema declarava Organization para TODO post, inclusive nos 40 assinados por
  // pessoa fisica (Fernando: 38, Giulia Furlan: 2) — o dado contradizia o que a pagina
  // mostrava. O Google aceita os dois tipos, entao isso nao quebra nada; e questao de o
  // dado ser verdadeiro, que e o que pesa em E-E-A-T e para quem le o JSON-LD.
  // "Tribhus" e "Admin Tribhus" sao a marca, nao pessoa. "Tribhus IA" e marcado is_ai.
  const nomeDoAutor = (author.name || '').trim()
  const autorEhPessoa =
    !(author as { isAi?: boolean }).isAi &&
    !/^(tribhus|admin tribhus|tribhus ia)$/i.test(nomeDoAutor)
  return (
    <>
      {/* Tracker de visualizacoes */}
      <ViewTracker postId={post.id} />

      {/* JSON-LD Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            // Omitir a chave quando o dado nao existe, em vez de emitir null: 38 posts
            // sem excerpt e 1 sem capa mandavam `null` para um campo que o Google
            // espera como texto.
            ...(post.excerpt ? { description: post.excerpt } : {}),
            ...(post.coverImage ? { image: post.coverImage } : {}),
            author: {
              '@type': autorEhPessoa ? 'Person' : 'Organization',
              name: author.name,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Tribhus',
              logo: {
                '@type': 'ImageObject',
                url: 'https://tribhus.com/blog/images/logo.png',
              },
            },
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://tribhus.com/blog/${post.slug}`,
            },
          }),
        }}
      />

      {/* JSON-LD BreadcrumbList — o post ja tinha breadcrumb visual sem schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://tribhus.com/blog',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: category.name,
                item: `https://tribhus.com/blog/categoria/${category.slug}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `https://tribhus.com/blog/${post.slug}`,
              },
            ],
          }),
        }}
      />

      <PaginaDoArtigo
        artigo={artigo}
        endereco={`https://tribhus.com/blog/${post.slug}`}
        bandas={bandas}
        proxima={proxima}
        relacionados={outros}
        antesDoTexto={guiaDoGenero(post.slug)}
      />
    </>
  )
}

