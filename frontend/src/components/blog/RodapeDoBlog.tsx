/* =========================================================================
   O RODAPÉ DO BLOG

   A contracapa da casa (as mesmas classes do rodapé do site), com o
   conteúdo do blog e as palavras do ar: a marca com "Blog" e a frase, as
   colunas Categorias, Tribhus e Social, e a linha de baixo com Privacidade
   e Termos. As redes vão pelo nome, sem ícone.
   ========================================================================= */
const CATEGORIAS = [
  { href: '/blog/categoria/noticias', texto: 'Notícias' },
  { href: '/blog/categoria/lancamentos', texto: 'Lançamentos' },
  { href: '/blog/categoria/internacional', texto: 'Internacional' },
  { href: '/blog/categoria/eventos', texto: 'Eventos' },
];
const TRIBHUS = [
  { href: 'https://tribhus.com', texto: 'Plataforma', fora: true },
  { href: 'https://tribhus.com/bandas', texto: 'Bandas', fora: true },
  { href: 'https://tribhus.com/sobre', texto: 'Sobre', fora: false },
];
/* Os endereços do ar. No ar eles são DIFERENTES dos da faixa do alto
   (instagram.com/tribhus aqui, /tribhusbr lá): ver o levantamento. */
const SOCIAL = [
  { href: 'https://instagram.com/tribhus', texto: 'Instagram' },
  { href: 'https://twitter.com/tribhus', texto: 'Twitter' },
  { href: 'https://youtube.com/tribhus', texto: 'YouTube' },
];

export function RodapeDoBlog() {
  const ano = new Date().getFullYear();
  return (
    <footer className="rodape total bl-rodape">
      <div className="rodape-grade">
        <div className="rodape-assinatura">
          <a className="marca rodape-marca" href="/blog" aria-label="Tribhus Blog - Ir para pagina inicial">
            <img className="palheta" src="/img/logo-simbolo.webp" alt="" width={160} height={144} />
            <img className="wordmark" src="/img/logo-wordmark.webp" alt="" width={420} height={156} />
          </a>
          <p className="bl-rodape-frase">O melhor conteúdo sobre rock underground e independente do Brasil.</p>
        </div>
        <nav aria-labelledby="bl-rod-cat">
          <h2 className="rodape-h" id="bl-rod-cat">Categorias</h2>
          <ul>{CATEGORIAS.map((l) => <li key={l.href}><a href={l.href}>{l.texto}</a></li>)}</ul>
        </nav>
        <nav aria-labelledby="bl-rod-tri">
          <h2 className="rodape-h" id="bl-rod-tri">Tribhus</h2>
          <ul>{TRIBHUS.map((l) => <li key={l.href}><a href={l.href} {...(l.fora ? { target: '_blank', rel: 'noopener' } : {})}>{l.texto}</a></li>)}</ul>
        </nav>
        <nav aria-labelledby="bl-rod-soc">
          <h2 className="rodape-h" id="bl-rod-soc">Social</h2>
          <ul>{SOCIAL.map((l) => <li key={l.href}><a href={l.href} target="_blank" rel="noopener">{l.texto}</a></li>)}</ul>
        </nav>
      </div>
      <div className="rodape-fim">
        <p className="bl-rodape-legal">
          <a href="https://tribhus.com/politica-de-privacidade">Privacidade</a>
          <a href="https://tribhus.com/termos/usuario">Termos</a>
        </p>
        <p className="rodape-direitos">{ano} Tribhus. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
