'use client';

import { useEffect, useRef, useState } from 'react';

/* O menu do celular da casa (o mesmo do cabeçalho do site). O blog é outro app
   e não enxerga os componentes do site, que dependem do login e das traduções
   de lá; por isso a cópia mora aqui. Veio do pacote do blog de 30/10/2026. */

/* "Início" do blog é /blog, que é o começo de todo endereço do blog: ele só
   acende na própria capa. */
function atual(caminho: string, href: string) {
  if (!href.startsWith('/')) return false;
  return href === '/blog' ? caminho === '/blog' : caminho === href || caminho.startsWith(href + '/');
}

/* NA TELA ESTREITA, a navegação vira o menu que abre por baixo da pílula:
   o botão de três traços, e a lista grande, fácil para o dedo. */
export function MenuEstreito({ itens, caminho, entrar }: { itens: { href: string; rotulo: string }[]; caminho: string; entrar?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => { setAberto(false); }, [caminho]);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('pointerdown', fora);
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('pointerdown', fora); document.removeEventListener('keydown', tecla); };
  }, [aberto]);
  return (
    <div className="menu-estreito" ref={caixa}>
      <button className="cab-ico" type="button" aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto}
              aria-controls="menu-estreito" onClick={() => setAberto((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">{aberto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
      </button>
      <nav className="menu-estreito-lista" id="menu-estreito" aria-label="Principal" hidden={!aberto}>
        {itens.map((i) => (
          <a key={i.href} href={i.href} aria-current={atual(caminho, i.href) ? 'page' : undefined}>{i.rotulo}</a>
        ))}
        {/* no telefone o "Entrar" sai da pílula e mora aqui */}
        {entrar ? <a className="menu-estreito-entrar" href="/login">Entrar</a> : null}
      </nav>
    </div>
  );
}
