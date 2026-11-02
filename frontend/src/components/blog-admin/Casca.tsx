'use client';

import Link from 'next/link';
import { INERTE } from '../casa/inerte';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { sair } from './acoes';
import { Icone, type NomeDoIcone } from './icones';
import { Avatar } from './comum';
import { Avisos } from './pecas';

/* =========================================================================
   A CASCA DO PAINEL DO BLOG

   TUDO NO MESMO LUGAR DO AR (o Dione, 30/10: "tem gente que trabalha com
   isso só de bater o olho já sabe certinho"): a coluna da esquerda com a
   marca em cima, os oito itens na mesma ordem e "Ver Blog" embaixo; a
   barra de cima com "Painel Administrativo" à esquerda e quem está logado
   à direita, com o Sair no menu. O item aberto continua laranja cheio.

   O que mudou é o material:
   - a marca da casa (a palheta e o TRIBHUS) no lugar do "T" num quadrado;
   - o laranja da casa, com a letra escura em cima (#140800), no lugar do
     laranja queimado com letra branca;
   - o laranja do item aberto DESLIZA de um item para o outro, em vez de
     piscar (só `transform`; quem pede menos movimento vê ele trocar);
   - a barra de cima é vidro: o conteúdo passa por baixo dela, e a linha
     de baixo só aparece depois que a página rolou;
   - "Novo Post" acende sozinho no Novo Post (no ar, Posts acendia junto).
   - no telefone, que o ar não tinha, a coluna vira a folha que entra da
     esquerda pelo botão de menu, e sai pelo mesmo lado.
   ========================================================================= */

type Item = { href: string; rotulo: string; icone: NomeDoIcone };

const ITENS: Item[] = [
  { href: '/admin', rotulo: 'Dashboard', icone: 'dashboard' },
  { href: '/admin/analytics', rotulo: 'Analytics', icone: 'analytics' },
  { href: '/admin/posts', rotulo: 'Posts', icone: 'posts' },
  { href: '/admin/posts/new', rotulo: 'Novo Post', icone: 'mais' },
  { href: '/admin/categories', rotulo: 'Categorias', icone: 'categorias' },
  { href: '/admin/authors', rotulo: 'Autores', icone: 'autores' },
  { href: '/admin/manual', rotulo: 'Manual', icone: 'manual' },
  { href: '/admin/ai', rotulo: 'IA', icone: 'ia' },
];

/* Os caminhos são os do Next, SEM o /blog: o basePath entra sozinho no
   <Link> e o usePathname() devolve sem ele (/admin/posts). */
function itemAtual(caminho: string) {
  const c = caminho.replace(/\/$/, '');
  if (c === '/admin') return '/admin';
  if (c === '/admin/posts/new') return '/admin/posts/new';
  return ITENS.slice(1).find((i) => i.href !== '/admin/posts/new' && (c === i.href || c.startsWith(i.href + '/')))?.href ?? null;
}

export interface UsuarioDoPainel { name: string; email: string; avatar?: string | null }

export function CascaDoPainel({ usuario, children }: { usuario: UsuarioDoPainel; children: ReactNode }) {
  const caminho = usePathname() || '';
  const atual = itemAtual(caminho);
  const [gaveta, setGaveta] = useState(false);
  const [menu, setMenu] = useState(false);
  const lista = useRef<HTMLUListElement>(null);
  const marca = useRef<HTMLSpanElement>(null);
  const [pronto, setPronto] = useState(false);

  /* o laranja vai para o item aberto */
  useLayoutEffect(() => {
    const ul = lista.current;
    const m = marca.current;
    if (!ul || !m) return;
    const li = ul.querySelector<HTMLElement>('[aria-current="page"]');
    if (!li) { m.style.opacity = '0'; return; }
    m.style.opacity = '1';
    m.style.transform = `translateY(${li.offsetTop}px)`;
    m.style.height = `${li.offsetHeight}px`;
  }, [atual]);
  useEffect(() => { const t = requestAnimationFrame(() => setPronto(true)); return () => cancelAnimationFrame(t); }, []);

  useEffect(() => { setGaveta(false); setMenu(false); }, [caminho]);
  useEffect(() => {
    if (!gaveta && !menu) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setGaveta(false); setMenu(false); } };
    const fora = (e: PointerEvent) => { if (menu && !(e.target as Element).closest('.adm-conta')) setMenu(false); };
    document.addEventListener('keydown', esc);
    document.addEventListener('pointerdown', fora);
    return () => { document.removeEventListener('keydown', esc); document.removeEventListener('pointerdown', fora); };
  }, [gaveta, menu]);

  return (
    <div className="adm" data-gaveta={gaveta ? '' : undefined}>
      <aside className="adm-lado" aria-label="Painel">
        <a className="adm-marca" href="/blog/admin" aria-label="Tribhus Blog, Painel Admin">
          <img className="adm-palheta" src="/img/logo-simbolo.webp" alt="" width={160} height={144} />
          <img className="adm-wordmark" src="/img/logo-wordmark.webp" alt="Tribhus" width={420} height={156} />
          <span className="adm-marca-blog">Blog</span>
        </a>
        <nav className="adm-nav" aria-label="Seções do painel">
          <span className="adm-nav-marca" ref={marca} data-pronto={pronto ? '' : undefined} aria-hidden="true" />
          <ul ref={lista}>
            {ITENS.map((i) => (
              <li key={i.href} aria-current={atual === i.href ? 'page' : undefined}>
                <Link href={i.href} aria-current={atual === i.href ? 'page' : undefined}>
                  <Icone nome={i.icone} />
                  <span>{i.rotulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a className="adm-ver-blog" href="/blog" target="_blank" rel="noopener">
          <Icone nome="verBlog" />
          <span>Ver Blog</span>
        </a>
      </aside>
      <button type="button" className="adm-gaveta-fundo" aria-label="Fechar o menu" tabIndex={-1} onClick={() => setGaveta(false)} />

      <div className="adm-direita">
        <header className="adm-topo">
          <button type="button" className="adm-bt-ic adm-abre-gaveta" onClick={() => setGaveta(true)} aria-label="Abrir o menu" aria-expanded={gaveta}>
            <Icone nome="menu" />
          </button>
          <p className="adm-topo-t">Painel Administrativo</p>
          <div className="adm-conta">
            <button type="button" className="adm-conta-bt" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
              <Avatar src={usuario.avatar} tamanho={34} />
              <span className="adm-conta-t">
                <b>{usuario.name}</b>
                <small>{usuario.email}</small>
              </span>
              <Icone nome="abaixo" tamanho={16} />
            </button>
            <div className="adm-conta-menu" role="menu" data-aberto={menu ? '' : undefined} {...(menu ? {} : INERTE)}>
              <p className="adm-conta-menu-quem"><b>{usuario.name}</b><small>{usuario.email}</small></p>
              <button type="button" role="menuitem" onClick={sair}>
                <Icone nome="sair" tamanho={18} />Sair
              </button>
            </div>
          </div>
        </header>
        <main className="adm-main" id="conteudo">{children}</main>
      </div>
      <Avisos />
    </div>
  );
}

/** A tela de entrar não tem a casca (no ar é igual: o layout do admin
 *  devolve só a página quando o caminho é /admin/login). */
export function PainelOuEntrada({ usuario, children }: { usuario: UsuarioDoPainel; children: ReactNode }) {
  const caminho = usePathname() || '';
  if (/\/admin\/login\/?$/.test(caminho)) return <>{children}</>;
  return <CascaDoPainel usuario={usuario}>{children}</CascaDoPainel>;
}
