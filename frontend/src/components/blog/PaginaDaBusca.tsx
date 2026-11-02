import type { ResumoDoArtigo } from './tipos';
import { CartaoDoArtigo } from './CartaoDoArtigo';
import { FaixaDaCasa } from './CabecalhoDoBlog';
import { Surgir } from './Surgir';
import { Paginacao } from './Paginacao';

/* =========================================================================
   A BUSCA DO BLOG, rota `/blog/busca?q=<termo>`

   NO AR A BUSCA NÃO BUSCA: qualquer termo mostra os mesmos dois resultados
   de exemplo, escritos no código, que levam para artigos que não existem.
   Aqui ela procura de verdade. A API do blog ignora o termo (`/posts?search=`
   devolve tudo), então o site faz o filtro no servidor, sobre a mesma
   lista que o arquivo já busca (`/posts?limit=500`): título, resumo,
   categoria, tags e texto, sem acento e sem caixa, o que bate no título
   primeiro. Nenhum endpoint novo. Ver `buscar()` em exemplo/blog-ar.ts.

   AS PALAVRAS DO AR: "Buscar", "Digite sua busca...", o botão "Buscar",
   "Faça uma busca" (no ar sem cedilha), "Digite um termo no campo acima
   para encontrar artigos." e "<N> resultados encontrados para".

   OS TRÊS ESTADOS:
     - sem termo: o convite, e as categorias para quem não sabe o que buscar;
     - com resultado: a conta, a grade de 24 e a paginação;
     - sem resultado: diz o que procurou e oferece as categorias (no ar,
       esse estado nunca acontecia, porque a busca era falsa).
   Nos dois estados sem grade, as "Mais lidas" (o mesmo `/posts/popular`
   da capa) embaixo: quem não achou o que queria tem por onde seguir, e a
   página não fica oca.
   ========================================================================= */
export function PaginaDaBusca({ termo, resultados, pagina, categorias, maisLidas = [] }: {
  termo: string;
  /** null quando não há termo. */
  resultados: ResumoDoArtigo[] | null;
  pagina: { atual: number; total: number; itens: ResumoDoArtigo[] };
  categorias: { name: string; slug: string }[];
  /** As mais lidas do blog, para os estados sem resultado. */
  maisLidas?: ResumoDoArtigo[];
}) {
  const n = resultados?.length ?? 0;
  const explorar = (
    <nav className="blb-explorar" aria-label="Explorar categorias">
      <p className="bl-rotulo">Explorar:</p>
      <ul className="bl-tags sem-cerquilha">
        {categorias.map((c) => <li key={c.slug}><a href={`/blog/categoria/${c.slug}`}>{c.name}</a></li>)}
      </ul>
    </nav>
  );

  return (
    <main id="conteudo" className="bl bll blb">
      <Surgir />
      <FaixaDaCasa />
      <header className="bll-topo">
        <nav className="bl-migalha" aria-label="Você está em">
          <ol><li><a href="/blog">Início</a></li><li><span>Buscar</span></li></ol>
        </nav>
        <h1 className="bll-h1">Buscar</h1>
        <form className="blb-form" role="search" action="/blog/busca" method="get">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="search" name="q" defaultValue={termo} placeholder="Digite sua busca..."
                 aria-label="Digite sua busca" autoComplete="off" enterKeyHint="search" autoFocus={!termo} />
          <button type="submit" className="blb-bt">Buscar</button>
        </form>
      </header>

      {resultados === null && (
        <section className="blb-estado" aria-labelledby="blb-estado-tit">
          <h2 className="blb-h2" id="blb-estado-tit">Faça uma busca</h2>
          <p>Digite um termo no campo acima para encontrar artigos.</p>
          {explorar}
        </section>
      )}

      {resultados !== null && n === 0 && (
        <section className="blb-estado" aria-labelledby="blb-estado-tit">
          <h2 className="blb-h2" id="blb-estado-tit">Nada encontrado para &ldquo;{termo}&rdquo;</h2>
          <p>Confira se a palavra está certa, tente uma palavra só (o nome da banda, o gênero) ou explore as categorias.</p>
          {explorar}
        </section>
      )}

      {n === 0 && maisLidas.length > 0 && (
        <section className="bll-outras blb-lidas" aria-labelledby="blb-lidas-tit">
          <h2 className="bl-rotulo" id="blb-lidas-tit">Mais lidas</h2>
          <ul className="bll-grade">
            {maisLidas.slice(0, 4).map((a) => <li key={a.slug}><CartaoDoArtigo artigo={a} quadrado titulo="h3" /></li>)}
          </ul>
        </section>
      )}

      {n > 0 && (
        <>
          <p className="bll-conta blb-conta" role="status">
            {n} {n === 1 ? 'resultado encontrado' : 'resultados encontrados'} para <b>&ldquo;{termo}&rdquo;</b>
          </p>
          <ul className="bll-grade">
            {pagina.itens.map((a, i) => (
              <li key={a.slug}><CartaoDoArtigo artigo={a} quadrado titulo="h2" prioridade={i < 4} /></li>
            ))}
          </ul>
          <Paginacao atual={pagina.atual} total={pagina.total}
                     href={(p) => `/blog/busca?q=${encodeURIComponent(termo)}${p > 1 ? `&page=${p}` : ''}`} />
        </>
      )}
    </main>
  );
}
