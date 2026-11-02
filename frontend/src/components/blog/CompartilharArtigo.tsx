'use client';

import { useEffect, useRef, useState } from 'react';

/* =========================================================================
   COMPARTILHAR, no fim do artigo

   Os quatro do ar, na mesma ordem e com os mesmos endereços: Twitter (hoje
   X), Facebook, WhatsApp ("<título> - <url>") e "Copiar link". No ar são
   quadrados só com o ícone; aqui são pílulas com o nome (controle é
   pílula na casa), porque desenhar à mão o logotipo de cada marca seria
   cópia mal feita do que elas já desenham.

   "COPIAR LINK" NÃO ABRE ALERTA. No ar ele chama o `alert()` do navegador
   ("Link copiado!"), que trava a página até alguém apertar OK. Aqui o
   próprio botão diz "Link copiado!" por dois segundos, e o leitor de tela
   ouve pela região `aria-live`. Se o navegador barrar a cópia (o de dentro
   do Instagram barra), o botão vira o endereço selecionado, para copiar na
   mão.
   ========================================================================= */
export function CompartilharArtigo({ url, titulo }: { url: string; titulo: string }) {
  const [estado, setEstado] = useState<'' | 'copiado' | 'mao'>('');
  const volta = useRef(0);
  useEffect(() => () => clearTimeout(volta.current), []);

  const copiar = async () => {
    let foi = false;
    try { await navigator.clipboard.writeText(url); foi = true; } catch { /* barrado */ }
    if (!foi) {
      const t = document.createElement('textarea');
      t.value = url; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { foi = document.execCommand('copy'); } catch { foi = false; }
      t.remove();
    }
    setEstado(foi ? 'copiado' : 'mao');
    clearTimeout(volta.current);
    if (foi) volta.current = window.setTimeout(() => setEstado(''), 2000);
  };

  const u = encodeURIComponent(url);
  const destinos = [
    { nome: 'X', rotulo: 'Compartilhar no X (Twitter)', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(titulo)}&url=${u}` },
    { nome: 'Facebook', rotulo: 'Compartilhar no Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { nome: 'WhatsApp', rotulo: 'Compartilhar no WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${titulo} - ${url}`)}` },
  ];

  return (
    <div className="bl-partilha-linha">
      <ul>
        {destinos.map((d) => (
          <li key={d.nome}>
            <a className="bl-partilha-bt" href={d.href} target="_blank" rel="noopener noreferrer" aria-label={d.rotulo}>{d.nome}</a>
          </li>
        ))}
        <li>
          <button type="button" className="bl-partilha-bt bl-partilha-copiar" onClick={copiar}
                  data-copiado={estado === 'copiado' ? '' : undefined}>
            <span aria-hidden={estado === 'copiado'}>Copiar link</span>
            <span className="bl-partilha-ok" aria-hidden="true">Link copiado!</span>
          </button>
        </li>
      </ul>
      {estado === 'mao' && (
        <p className="bl-partilha-mao">
          O navegador não deixou copiar. Selecione o endereço:
          <input type="text" readOnly value={url} aria-label="Endereço do artigo" onFocus={(e) => e.currentTarget.select()} autoFocus />
        </p>
      )}
      <p className="so-leitor" role="status" aria-live="polite">{estado === 'copiado' ? 'Link copiado!' : ''}</p>
    </div>
  );
}
