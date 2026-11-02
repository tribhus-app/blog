import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { POR_PAGINA, caminhoDaPagina } from '@/components/posts/Paginacao'
import { PaginaDaLista } from '@/components/blog/PaginaDaLista'
import { resumo } from '@/lib/blog'
import { Post, Category } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_URL}/api/categories/${slug}`, {
      // ISR de 60s em vez de `cache: 'no-store'` (21/08/2026, auditoria de SEO).
      // Com no-store a pagina vira dinamica e o Next devolve
      // `Cache-Control: private, no-cache, no-store, must-revalidate`, que DESLIGA o
      // cache de voltar/avancar do navegador. Num blog, onde a pessoa entra num post e
      // volta para a lista, cada "voltar" recarregava tudo. 60s e o mesmo intervalo que
      // a pagina de post ja usava.
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || json
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      // ISR de 60s em vez de `cache: 'no-store'` (21/08/2026, auditoria de SEO).
      // Com no-store a pagina vira dinamica e o Next devolve
      // `Cache-Control: private, no-cache, no-store, must-revalidate`, que DESLIGA o
      // cache de voltar/avancar do navegador. Num blog, onde a pessoa entra num post e
      // volta para a lista, cada "voltar" recarregava tudo. 60s e o mesmo intervalo que
      // a pagina de post ja usava.
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || json || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getPostsByCategory(categoryId: string, pagina: number): Promise<{ posts: Post[], total: number }> {
  try {
    const res = await fetch(`${API_URL}/api/posts?categoryId=${categoryId}&limit=${POR_PAGINA}&page=${pagina}`, {
      // ISR de 60s em vez de `cache: 'no-store'` (21/08/2026, auditoria de SEO).
      // Com no-store a pagina vira dinamica e o Next devolve
      // `Cache-Control: private, no-cache, no-store, must-revalidate`, que DESLIGA o
      // cache de voltar/avancar do navegador. Num blog, onde a pessoa entra num post e
      // volta para a lista, cada "voltar" recarregava tudo. 60s e o mesmo intervalo que
      // a pagina de post ja usava.
      next: { revalidate: 60 },
    })
    if (!res.ok) return { posts: [], total: 0 }
    const json = await res.json()
    return {
      posts: json.data || json.posts || [],
      total: json.pagination?.total || json.total || 0
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], total: 0 }
  }
}

export async function metadataDaCategoria(slug: string, pagina: number): Promise<Metadata> {
  const category = await getCategory(slug)

  // o 404 sai ja dos metadados, para o status voltar 404 de verdade (e a pagina alem
  // da ultima tambem; o fetch e o mesmo da pagina, o Next nao repete o pedido)
  if (!category) notFound()
  if (pagina > 1 && (await getPostsByCategory(category.id, pagina)).posts.length === 0) notFound()

  const sufixo = pagina > 1 ? ` (página ${pagina})` : ''
  const url = `https://tribhus.com/blog${caminhoDaPagina(`/categoria/${category.slug}`, pagina)}`
  return {
    title: `${category.name}${sufixo} | Tribhus Blog`,
    description: category.description || `Artigos sobre ${category.name}`,
    openGraph: {
      title: `${category.name} | Tribhus Blog`,
      description: category.description || `Artigos sobre ${category.name}`,
      url,
      type: 'website',
      // Ao definir `openGraph` aqui, o Next SUBSTITUI o bloco do layout inteiro — e a
      // imagem padrao se perdia junto. Eram 42 tags e 8 categorias indo para o WhatsApp
      // e o Instagram sem miniatura nenhuma (auditoria de 21/08/2026).
      images: ['/images/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/images/og-image.jpg'],
      title: `${category.name} | Tribhus Blog`,
      description: category.description || `Artigos sobre ${category.name}`,
    },
    alternates: {
      canonical: url,
    },
  }
}

export async function PaginaDaCategoria({ slug, pagina }: { slug: string; pagina: number }) {
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const { posts, total } = await getPostsByCategory(category.id, pagina)
  const totalPaginas = Math.ceil(total / POR_PAGINA)
  // pagina alem da ultima nao existe (e nao vira copia da primeira)
  if (pagina > 1 && posts.length === 0) notFound()
  const allCategories = await getCategories()

  // Desenho do pacote do redesenho (30/10/2026); as palavras sao as do ar
  return (
    <PaginaDaLista
      migalha={[{ href: '/blog', t: 'Início' }, { t: 'Categorias' }, { t: category.name }]}
      titulo={category.name}
      descricao={category.description || `Artigos sobre ${category.name}`}
      contagem={`${total} ${total === 1 ? 'artigo encontrado' : 'artigos encontrados'}`}
      artigos={posts.map((p) => resumo(p as never))}
      abrirLargo={pagina === 1}
      paginacao={{ atual: pagina, total: totalPaginas, href: (k) => `/blog${caminhoDaPagina(`/categoria/${category.slug}`, k)}` }}
      vazio={<><p>Nenhum artigo encontrado nesta categoria.</p><a className="blc-ver" href="/blog">Voltar para o início</a></>}
      outras={{ titulo: 'Outras Categorias', itens: allCategories.filter((c) => c.slug !== slug).map((c) => ({ href: `/blog/categoria/${c.slug}`, t: c.name })) }}
    />
  )
}
