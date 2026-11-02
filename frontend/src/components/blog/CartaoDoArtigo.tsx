import type { ResumoDoArtigo } from './tipos';
import { serieDoTitulo, resumoDe, capaQueVoa } from './corpo';

/* =========================================================================
   O CARTÃO DE UM ARTIGO, em toda lista do blog

   A foto e o título, e só. A linha de cima diz a série (quando é de uma) ou
   a categoria, em letra de painel, sem pílula colorida.

   SEM DATA NO CARTÃO. Numa lista, "18 de junho" ao lado de "28 de outubro"
   faz o blog parecer parado (a regra da casa para todo feed). A data fica
   no artigo, onde ela informa, e no dado que o Google lê.

   O título é o link, e o cartão inteiro responde ao toque pelo `::after`
   esticado: um link só para o leitor de tela, em vez de três.
   ========================================================================= */
export function CartaoDoArtigo({ artigo, grande = false, prioridade = false, quadrado = false, titulo: Titulo = 'h3' }: {
  artigo: ResumoDoArtigo;
  grande?: boolean;
  prioridade?: boolean;
  /** A foto em quadrado: a maior parte das capas do blog é capa de disco
   *  (1200 x 1200), e o quadrado mostra o disco inteiro, sem cortar. */
  quadrado?: boolean;
  /** O nível do título na página (na capa, "Últimas publicações" usa h2). */
  titulo?: 'h2' | 'h3';
}) {
  const { serie, resto } = serieDoTitulo(artigo.title);
  const resumo = grande ? resumoDe(artigo) : null;
  return (
    <article className={`bl-cartao${grande ? ' grande' : ''}${quadrado ? ' quadrado' : ''}`}>
      <div className="bl-cartao-foto" style={{ viewTransitionName: capaQueVoa(artigo.slug) }}>
        {artigo.coverImage
          ? <img src={artigo.coverImage} alt="" loading={prioridade ? 'eager' : 'lazy'} decoding="async"
                 width={800} height={500} {...(prioridade ? { fetchPriority: 'high' as const } : {})} />
          : (
            /* SEM CAPA (2 artigos no ar): a capa vira cartaz de letra, a
               série ou a categoria em cima e o título embaixo, e não um
               quadrado vazio que parece foto que não carregou */
            <span className="bl-cartao-sem" aria-hidden="true">
              <span className="bl-cartao-sem-sobre">{serie ?? artigo.category.name}</span>
              <span className="bl-cartao-sem-tit">{resto}</span>
            </span>
          )}
      </div>
      <div className="bl-cartao-txt">
        <p className="bl-cartao-sobre">{serie ?? artigo.category.name}</p>
        <Titulo className="bl-cartao-tit">
          <a href={`/blog/${artigo.slug}`}>{resto}</a>
        </Titulo>
        {resumo && <p className="bl-cartao-resumo">{resumo}</p>}
      </div>
    </article>
  );
}
