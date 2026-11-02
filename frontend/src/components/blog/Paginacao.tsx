/* =========================================================================
   A PAGINAÇÃO DO BLOG, na categoria, na tag, no arquivo e na busca

   As palavras do ar: "Anterior", os números e "Próxima". Cinco números de
   cada vez, com o atual no meio quando dá, e a primeira e a última sempre
   à mão (no arquivo são 17 páginas: da 9 se chega à 17 num toque).

   O endereço de cada página vem de quem usa (`href`), porque cada lista tem
   o seu: `/categoria/bandas/pagina/2`, `/tag/metal/pagina/2`,
   `/arquivo?page=2`, `/busca?q=metal&page=2`. A página 1 é sempre o
   endereço sem número, como no ar.
   ========================================================================= */
export function Paginacao({ atual, total, href }: {
  atual: number;
  total: number;
  href: (n: number) => string;
}) {
  if (total <= 1) return null;
  const ini = Math.max(1, Math.min(atual - 2, total - 4));
  const fim = Math.min(total, ini + 4);
  const numeros: number[] = [];
  for (let n = ini; n <= fim; n++) numeros.push(n);

  return (
    <nav className="bl-pag" aria-label="Páginas">
      {atual > 1
        ? <a className="bl-pag-lado" href={href(atual - 1)} rel="prev">Anterior</a>
        : <span className="bl-pag-lado" aria-hidden="true">Anterior</span>}
      <ol>
        {ini > 1 && (
          <>
            <li><a href={href(1)} aria-label="Página 1">1</a></li>
            {ini > 2 && <li className="bl-pag-salto" aria-hidden="true">...</li>}
          </>
        )}
        {numeros.map((n) => (
          <li key={n}>
            {n === atual
              ? <a href={href(n)} aria-current="page" aria-label={`Página ${n}, esta`}>{n}</a>
              : <a href={href(n)} aria-label={`Página ${n}`}>{n}</a>}
          </li>
        ))}
        {fim < total && (
          <>
            {fim < total - 1 && <li className="bl-pag-salto" aria-hidden="true">...</li>}
            <li><a href={href(total)} aria-label={`Página ${total}, a última`}>{total}</a></li>
          </>
        )}
      </ol>
      {atual < total
        ? <a className="bl-pag-lado" href={href(atual + 1)} rel="next">Próxima</a>
        : <span className="bl-pag-lado" aria-hidden="true">Próxima</span>}
    </nav>
  );
}
