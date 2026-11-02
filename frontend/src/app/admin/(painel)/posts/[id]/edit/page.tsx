import { FormDoPost } from '@/components/blog-admin/FormDoPost'
import type { CategoriaDoPainel, PostDoPainel, TagDoPainel } from '@/components/blog-admin/tipos'
import { paraCategoria, paraPost } from '@/lib/painel'
import { ler, usuarioDoPainel } from '@/lib/painel-servidor'

export const metadata = { title: 'Editar Post | Painel | Tribhus Blog' }

// /admin/posts/:id, /categories e /tags. O post mantem o autor que ja tem
// (o painel antigo trocava pelo autor logado a cada edicao; ver o relatorio
// de 31/10/2026).
export default async function Pagina({ params }: { params: { id: string } }) {
  const id = encodeURIComponent(params.id)
  const [post, categorias, tags, usuario] = await Promise.all([
    ler<{ data: PostDoPainel }>(`/admin/posts/${id}`, { naoEncontrado: true }),
    ler<{ data: CategoriaDoPainel[] }>('/categories'),
    ler<{ data: TagDoPainel[] }>('/tags'),
    usuarioDoPainel(),
  ])
  const p = paraPost(post.data)
  return (
    <FormDoPost key={p.id} post={p} categorias={categorias.data.map(paraCategoria)} tags={tags.data.map(({ id, name, slug }) => ({ id, name, slug }))} autorId={p.author?.id ?? usuario.id} />
  )
}
