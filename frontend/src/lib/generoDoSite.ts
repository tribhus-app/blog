/**
 * De qual post-guia do blog o leitor deve ser mandado para qual página de gênero do
 * site tribhus.com.br.
 *
 * POR QUE ISSO EXISTE: em 19/06/2026 o blog publicou 14 posts explicando gêneros. Dois
 * meses depois, 13 deles não traziam praticamente ninguém da busca, enquanto as páginas
 * de gênero do site saltaram de cerca de 770 para 9.592 aparições em 15 dias. Os dois
 * domínios disputavam a mesma busca e o site ganhava.
 *
 * A divisão adotada em 21/08/2026: o site é o dicionário de gênero, o blog é a redação
 * (notícia, lançamento, descoberta de banda). Em vez de o leitor encalhar num texto que
 * não vai crescer, ele recebe no topo do post um caminho para o catálogo de bandas.
 *
 * A ÚNICA exceção é `bandas-de-nu-metal`, que fica de fora de propósito: é o único
 * gênero em que o blog ganha do site de verdade (1.411 aparições em 90 dias contra 3 da
 * página irmã). Não colocar nu metal aqui.
 *
 * Os destinos foram conferidos um a um em 21/08/2026: todos respondem 200 e têm bandas
 * cadastradas. Antes de acrescentar um par novo, abrir a página e conferir.
 */
export const GENERO_NO_SITE: Record<string, { slug: string; nome: string }> = {
  'bandas-de-black-metal': { slug: 'black-metal', nome: 'black metal' },
  'bandas-de-death-metal': { slug: 'death-metal', nome: 'death metal' },
  'bandas-de-grunge': { slug: 'grunge', nome: 'grunge' },
  'bandas-de-hardcore': { slug: 'hardcore', nome: 'hardcore' },
  'bandas-de-hard-rock': { slug: 'hard-rock', nome: 'hard rock' },
  'bandas-de-heavy-metal-brasileiras': { slug: 'heavy-metal', nome: 'heavy metal' },
  'bandas-de-metal-industrial': { slug: 'metal-industrial', nome: 'metal industrial' },
  'bandas-de-punk-rock': { slug: 'punk-rock', nome: 'punk rock' },
  'bandas-de-rock-gospel': { slug: 'rock-cristao', nome: 'rock cristão' },
  'bandas-de-shoegaze-dream-pop': { slug: 'shoegazing', nome: 'shoegazing' },
  'bandas-de-ska': { slug: 'ska-punk', nome: 'ska punk' },
  'bandas-de-surf-rock': { slug: 'surf-rock', nome: 'surf rock' },
  'bandas-de-thrash-metal': { slug: 'thrash-metal', nome: 'thrash metal' },
}

export function generoDoPost(slug: string) {
  return GENERO_NO_SITE[slug] || null
}
