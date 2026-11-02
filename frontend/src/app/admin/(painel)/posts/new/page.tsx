import { FormDoPost } from '@/components/blog-admin/FormDoPost'
import type { CategoriaDoPainel, TagDoPainel } from '@/components/blog-admin/tipos'
import { paraCategoria } from '@/lib/painel'
import { ler, usuarioDoPainel } from '@/lib/painel-servidor'

export const metadata = { title: 'Novo Post | Painel | Tribhus Blog' }

// /categories e /tags; o autor do post novo e quem esta logado (/auth/me),
// como no painel antigo.
export default async function Pagina() {
  const [usuario, categorias, tags] = await Promise.all([
    usuarioDoPainel(),
    ler<{ data: CategoriaDoPainel[] }>('/categories'),
    ler<{ data: TagDoPainel[] }>('/tags'),
  ])
  return (
    <FormDoPost post={null} categorias={categorias.data.map(paraCategoria)} tags={tags.data.map(({ id, name, slug }) => ({ id, name, slug }))} autorId={usuario.id} />
  )
}
