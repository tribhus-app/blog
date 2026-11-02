import type { ResumoDoArtigo } from './tipos';
import { CartaoDoArtigo } from './CartaoDoArtigo';
import { FaixaDaCasa } from './CabecalhoDoBlog';

/* =========================================================================
   O 404 DO BLOG

   No ar é a tela padrão do Next, em inglês ("404 | This page could not be
   found."), entre o cabeçalho e o rodapé do blog. Quem cai aqui quase
   sempre veio de um link velho do Google ou de um artigo que mudou de
   endereço: em vez de um beco, a busca do blog já aberta e as matérias mais
   novas para seguir lendo.
   ========================================================================= */
export function NaoEncontradoDoBlog({ recentes }: { recentes: ResumoDoArtigo[] }) {
  return (
    <main id="conteudo" className="bl bll bl404">
      <FaixaDaCasa />
      <header className="bll-topo">
        <p className="bl404-n" aria-hidden="true">404</p>
        <h1 className="bll-h1">Página não encontrada</h1>
        <p className="bll-descricao">O artigo que você procurou não existe ou mudou de endereço. Busque pelo nome da banda ou do assunto:</p>
        <form className="blb-form" role="search" action="/blog/busca" method="get">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="search" name="q" placeholder="Digite sua busca..." aria-label="Digite sua busca" autoComplete="off" enterKeyHint="search" />
          <button type="submit" className="blb-bt">Buscar</button>
        </form>
        <a className="blc-ver bl404-voltar" href="/blog">Voltar para o início do blog</a>
      </header>

      {recentes.length > 0 && (
        <section className="bll-outras bl404-recentes" aria-labelledby="bl404-rec-tit">
          <h2 className="bl-rotulo" id="bl404-rec-tit">Últimas publicações</h2>
          <ul className="bll-grade">
            {recentes.map((a) => <li key={a.slug}><CartaoDoArtigo artigo={a} quadrado titulo="h3" /></li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
