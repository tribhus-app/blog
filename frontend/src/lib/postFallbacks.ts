import type { Category } from '@/types'

/**
 * Categoria de reserva para posts sem categoria.
 *
 * POR QUE ISSO EXISTE: o tipo declara `category: Category` (obrigatorio), mas a API
 * devolve `null` quando o post nao tem categoria — o TypeScript nao pega, e o React
 * quebra ao renderizar no servidor com "Cannot read properties of null (reading 'color')".
 *
 * Em 21/08/2026 UM unico post sem categoria derrubou 4 paginas de tag e o /arquivo?page=7
 * com erro 500, e o Google registrava esse erro desde 24/05/2026 — tres meses no ar.
 * A pagina do post nao quebrava porque [slug]/page.tsx ja tinha esse mesmo fallback;
 * quem quebrava eram os componentes de LISTAGEM, que nao tinham.
 *
 * Use em QUALQUER componente que renderize post vindo de lista.
 */
export const CATEGORIA_PADRAO: Category = {
  id: '',
  name: 'Sem categoria',
  slug: 'sem-categoria',
  description: '',
  color: '#914100',
}

export function categoriaDoPost(post: { category?: Category | null }): Category {
  return post.category || CATEGORIA_PADRAO
}
