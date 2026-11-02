'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MenuEstreito } from '../casa/MenuEstreito';
import { INERTE } from '../casa/inerte';

/* =========================================================================
   O CABEÇALHO DO BLOG

   A MESMA PÍLULA DA CASA, com o conteúdo do blog. No ar, o blog tem um
   cabeçalho próprio (outra fonte, outro fundo, outra altura), e por isso
   parecia outro site. Aqui ele é o objeto do site inteiro, o vidro escuro
   flutuando, e só muda o que tem dentro, com as palavras do ar:

     - a marca da casa e a palavra "Blog", que leva à capa do blog;
     - Início, Bandas, Notícias, Curiosidades, Internacional;
     - a lupa, que abre "Buscar artigos..." (vai para /blog/busca?q=);
     - "Tribhus", que abre o site em outra aba.

   No telefone, a navegação vira o menu da casa, com "Acessar Tribhus" no
   fim, como no ar.

   A faixa laranja de baixo (App Store, Play Store, Site, Instagram,
   YouTube, Facebook, WhatsApp) virou `FaixaDaCasa`, logo abaixo: os mesmos
   sete links, sem o bloco de cor.
   ========================================================================= */

const NAV = [
  { href: '/blog', rotulo: 'Início' },
  { href: '/blog/categoria/bandas', rotulo: 'Bandas' },
  { href: '/blog/categoria/noticias', rotulo: 'Notícias' },
  { href: '/blog/categoria/curiosidades', rotulo: 'Curiosidades' },
  { href: '/blog/categoria/internacional', rotulo: 'Internacional' },
];

const atual = (caminho: string, href: string) =>
  href === '/blog' ? caminho === '/blog' : caminho === href || caminho.startsWith(`${href}/`);

export function CabecalhoDoBlog() {
  /* com o basePath, o usePathname devolve o caminho SEM o /blog: os links
     daqui levam o /blog inteiro, então ele volta para a comparação */
  const resto = usePathname() || '/';
  const caminho = resto === '/' ? '/blog' : `/blog${resto}`;

  /* A LUPA. No site da banda quem abre a busca é o `player.js`; o blog é
     outro app e não carrega esse script, então o cabeçalho traz o próprio
     comportamento, o mesmo: abre por cima da navegação já com o cursor no
     campo, fecha no X, no Esc e no toque fora, e a barra "/" abre de
     qualquer lugar da página. Se o `player.js` estiver na página também,
     os dois fazem a mesma coisa e nada briga. */
  useEffect(() => {
    const caixa = document.getElementById('busca') as HTMLFormElement | null;
    const bt = document.getElementById('bt-busca');
    const fechar = document.getElementById('fechar-busca');
    const campo = caixa?.querySelector('input');
    if (!caixa || !bt || !fechar || !campo) return;
    const aberta = () => caixa.classList.contains('aberta');
    const abrir = () => {
      caixa.inert = false; caixa.classList.add('aberta');
      bt.setAttribute('aria-expanded', 'true');
      campo.focus(); campo.select();
    };
    const fecharBusca = () => {
      if (!aberta()) return;
      caixa.classList.remove('aberta'); caixa.inert = true;
      bt.setAttribute('aria-expanded', 'false');
      campo.value = '';
      bt.focus();
    };
    /* busca vazia não sai do lugar */
    const aoEnviar = (ev: SubmitEvent) => { if (!campo.value.trim()) { ev.preventDefault(); campo.focus(); } };
    const aoTeclar = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && aberta()) { fecharBusca(); return; }
      const t = (ev.target as HTMLElement).tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || (ev.target as HTMLElement).isContentEditable || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.key === '/') { ev.preventDefault(); abrir(); }
    };
    const aoTocar = (ev: PointerEvent) => {
      if (aberta() && !caixa.contains(ev.target as Node) && !bt.contains(ev.target as Node)) fecharBusca();
    };
    bt.addEventListener('click', abrir);
    fechar.addEventListener('click', fecharBusca);
    caixa.addEventListener('submit', aoEnviar);
    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('pointerdown', aoTocar);
    return () => {
      bt.removeEventListener('click', abrir);
      fechar.removeEventListener('click', fecharBusca);
      caixa.removeEventListener('submit', aoEnviar);
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('pointerdown', aoTocar);
    };
  }, []);
  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <header className="cabecalho bl-cab">
        <div className="cabecalho-in">
          <a className="marca" href="/blog" aria-label="Tribhus Blog - Ir para pagina inicial">
            <img className="palheta" src="/img/logo-simbolo.webp" alt="" width={160} height={144} />
            <img className="wordmark" src="/img/logo-wordmark.webp" alt="Tribhus" width={420} height={156} />
            <span className="bl-cab-blog">Blog</span>
          </a>
          <nav className="nav" aria-label="Principal">
            {NAV.map((i) => (
              <a key={i.href} href={i.href} aria-current={atual(caminho, i.href) ? 'page' : undefined}>{i.rotulo}</a>
            ))}
          </nav>
          <form className="busca" id="busca" role="search" action="/blog/busca" method="get" {...INERTE}>
            <input type="search" name="q" placeholder="Buscar artigos..." aria-label="Buscar artigos" autoComplete="off" />
            <button type="button" className="fechar-busca" id="fechar-busca" aria-label="Fechar busca">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </form>
          <div className="acoes">
            <button className="lupa" id="bt-busca" aria-expanded="false" aria-controls="busca" aria-label="Buscar">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
              <span>Buscar</span>
            </button>
            <MenuEstreito itens={[...NAV, { href: 'https://tribhus.com', rotulo: 'Acessar Tribhus' }]} caminho={caminho} />
            <a className="bt-solido bl-cab-tribhus" href="https://tribhus.com" target="_blank" rel="noopener">
              Tribhus
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h9v9M18 6L7 17" /></svg>
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

/* OS SETE LINKS DA FAIXA LARANJA, na mesma ordem e com os mesmos
   endereços do ar. Viram uma linha de letra pequena no alto da página, só
   as palavras: no ar, a faixa laranja de 50 px era a coisa mais forte da
   tela, mais que a matéria, e os ícones de marca desenhados à mão (Apple,
   Google, Facebook) seriam cópia mal feita do que cada marca já desenha. */
const FAIXA = [
  { href: 'https://apps.apple.com/us/app/tribhus/id6739949821', rotulo: 'App Store' },
  { href: 'https://play.google.com/store/apps/details?id=com.tribhus', rotulo: 'Play Store' },
  { href: 'https://tribhus.com', rotulo: 'Site' },
  { href: 'https://instagram.com/tribhusbr', rotulo: 'Instagram' },
  { href: 'https://www.youtube.com/@tribhus5311', rotulo: 'YouTube' },
  { href: 'https://facebook.com/tribhusbr', rotulo: 'Facebook' },
  { href: 'https://wa.me/5519996647030', rotulo: 'WhatsApp' },
];

export function FaixaDaCasa() {
  return (
    <nav className="bl-faixa" aria-label="Tribhus nas redes e nas lojas">
      <ul>
        {FAIXA.map((f) => (
          <li key={f.rotulo}><a href={f.href} target="_blank" rel="noopener">{f.rotulo}</a></li>
        ))}
      </ul>
    </nav>
  );
}
