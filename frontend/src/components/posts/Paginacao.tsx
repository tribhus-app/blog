/* Paginação de categoria e tag (20/10/2026, auditoria de SEO).
   Antes as duas listas paravam em 50 posts e ignoravam `?page=`: a página 2 repetia a 1, e os
   posts mais antigos de cada categoria não tinham caminho nenhum até eles. Endereço por página
   (`/categoria/x/pagina/2`) em vez de `?page=` para a página continuar em cache (ISR) e ter
   canônico próprio. A página 1 é sempre o endereço sem `/pagina`. */

export const POR_PAGINA = 24

export function caminhoDaPagina(base: string, pagina: number): string {
  return pagina <= 1 ? base : `${base}/pagina/${pagina}`
}

export default function Paginacao({ base, atual, total }: { base: string; atual: number; total: number }) {
  if (total <= 1) return null
  const inicio = Math.max(1, Math.min(atual - 2, total - 4))
  const paginas = Array.from({ length: Math.min(5, total) }, (_, i) => inicio + i)
  const botao = 'px-4 py-2 bg-dark-card border border-border rounded-lg text-text-secondary hover:text-white hover:border-primary transition-all'

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-2 mt-12">
      {atual > 1 && (
        <a href={`/blog${caminhoDaPagina(base, atual - 1)}`} rel="prev" className={botao}>Anterior</a>
      )}
      <div className="flex items-center gap-1">
        {paginas.map((n) => (
          <a
            key={n}
            href={`/blog${caminhoDaPagina(base, n)}`}
            aria-current={n === atual ? 'page' : undefined}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
              n === atual
                ? 'bg-primary text-white'
                : 'bg-dark-card border border-border text-text-secondary hover:text-white hover:border-primary'
            }`}
          >
            {n}
          </a>
        ))}
      </div>
      {atual < total && (
        <a href={`/blog${caminhoDaPagina(base, atual + 1)}`} rel="next" className={botao}>Próxima</a>
      )}
    </nav>
  )
}
