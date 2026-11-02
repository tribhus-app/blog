'use client';

import { FaixaDaCasa } from './CabecalhoDoBlog';

/* =========================================================================
   QUANDO O BLOG NÃO RESPONDE

   A API do blog fora do ar, ou um artigo que quebrou no meio: em vez da
   tela branca do Next, o aviso no tom da casa, com "Tentar de novo" (que
   pede a página outra vez) e o caminho de volta para a capa do blog.
   ========================================================================= */
export function ErroDoBlog({ tentar }: { tentar: () => void }) {
  return (
    <main id="conteudo" className="bl bll bl404">
      <FaixaDaCasa />
      <header className="bll-topo">
        <h1 className="bll-h1">Não deu para abrir esta página</h1>
        <p className="bll-descricao">O blog demorou para responder. Tente de novo em alguns segundos.</p>
        <p className="bl-erro-acoes">
          <button type="button" className="blb-bt" onClick={tentar}>Tentar de novo</button>
          <a className="blc-ver" href="/blog">Voltar para o início do blog</a>
        </p>
      </header>
    </main>
  );
}
