import type { CSSProperties, ReactNode } from 'react';
import type { ResumoDoArtigo } from './tipos';
import { CartaoDoArtigo } from './CartaoDoArtigo';
import { FaixaDaCasa } from './CabecalhoDoBlog';
import { Paginacao } from './Paginacao';
import { Surgir } from './Surgir';

/* =========================================================================
   AS LISTAS DO BLOG: a categoria, a tag e o arquivo

   Rotas `/blog/categoria/<slug>` (e `/pagina/N`), `/blog/tag/<slug>` (e
   `/pagina/N`) e `/blog/arquivo` (e `?page=N`). As três são a mesma página
   com outro nome em cima, então são uma peça só.

   AS PARTES E AS PALAVRAS DO AR, na ordem:
     1. a migalha ("Início / Categorias / Bandas", "Início / Tags / metal",
        "Início / Arquivo");
     2. o nome como H1, em letra de cartaz (na tag, com o "#" na frente,
        desenhado pelo CSS para o H1 ser só o nome) e a
        descrição da categoria;
     3. a conta: "178 artigos encontrados", "19 posts encontrados", "398
        artigos publicados" (as três frases do ar, cada uma no seu lugar);
     4. a grade, 24 por página, e a paginação;
     5. "Outras Categorias" ou "Outras Tags".

   A GRADE É A DA CAPA: cartões quadrados (as capas do blog são capa de
   disco, 1200 x 1200), quatro por linha no computador, dois no telefone,
   sem data e sem cor de categoria. A primeira página da categoria abre com
   o mais novo em cartão largo, como a capa abre as últimas: a lista começa
   com uma matéria, e não com uma planilha.
   ========================================================================= */
export interface ItemDeOutras { href: string; t: string }

export function PaginaDaLista({ migalha, titulo, prefixo, descricao, contagem, artigos, paginacao, outras, vazio, abrirLargo = false }: {
  migalha: { href?: string; t: string }[];
  titulo: string;
  /** "#" na tag, como no ar. */
  prefixo?: string;
  descricao?: string | null;
  contagem: string;
  artigos: ResumoDoArtigo[];
  paginacao?: { atual: number; total: number; href: (n: number) => string };
  outras?: { titulo: string; itens: ItemDeOutras[]; tag?: boolean };
  /** O que aparece quando a lista não tem nenhum artigo. */
  vazio?: ReactNode;
  /** O primeiro em cartão largo (só na primeira página). */
  abrirLargo?: boolean;
}) {
  const [primeiro, ...resto] = artigos;
  const largo = abrirLargo && primeiro ? primeiro : null;
  const grade = largo ? resto : artigos;

  return (
    <main id="conteudo" className="bl bll">
      <Surgir />
      <FaixaDaCasa />

      <header className="bll-topo">
        <nav className="bl-migalha" aria-label="Você está em">
          <ol>
            {migalha.map((m) => (
              <li key={m.t}>{m.href ? <a href={m.href}>{m.t}</a> : <span>{m.t}</span>}</li>
            ))}
          </ol>
        </nav>
        {/* o "#" da tag vem do CSS (::before), fora do texto do H1 */}
        <h1 className="bll-h1" data-prefixo={prefixo || undefined}>{titulo}</h1>
        {/* No computador, a descrição e a conta vão para a direita, no pé
            do título: o nome da categoria ocupa a largura como cabeçalho de
            seção de revista, sem o vazio ao lado de "BANDAS". */}
        <div className="bll-topo-lado">
          {descricao && <p className="bll-descricao">{descricao}</p>}
          <p className="bll-conta">{contagem}</p>
        </div>
      </header>

      {artigos.length === 0 ? (
        <div className="bll-vazio">{vazio}</div>
      ) : (
        <>
          {largo && <div className="bll-largo" data-surge><CartaoDoArtigo artigo={largo} grande prioridade titulo="h2" /></div>}
          <ul className="bll-grade">
            {grade.map((a, i) => (
              <li key={a.slug} data-surge style={{ '--i': i % 4 } as CSSProperties}>
                <CartaoDoArtigo artigo={a} quadrado titulo="h2" prioridade={!largo && i < 4} />
              </li>
            ))}
          </ul>
          {paginacao && <Paginacao {...paginacao} />}
        </>
      )}

      {outras && outras.itens.length > 0 && (
        <section className="bll-outras" aria-labelledby="bll-outras-tit">
          <h2 className="bl-rotulo" id="bll-outras-tit">{outras.titulo}</h2>
          <ul className={`bl-tags${outras.tag ? '' : ' sem-cerquilha'}`}>
            {outras.itens.map((o) => <li key={o.href}><a href={o.href}>{o.t}</a></li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
