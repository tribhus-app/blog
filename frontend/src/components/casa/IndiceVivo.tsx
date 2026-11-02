'use client';

import { useEffect, useState } from 'react';

/* O ÍNDICE PRESO AO LADO, que acende a seção em que a pessoa está.

   Sem script ele é uma lista de links como qualquer outra. Com script, a
   seção que passa pela faixa de cima da tela (logo abaixo do cabeçalho)
   fica acesa: a marca laranja na margem, o texto claro. Nada se mexe além
   da cor; o índice não rola sozinho. */
export function IndiceVivo({ itens }: { itens: { id: string; n: string | null; t: string }[] }) {
  const [atual, setAtual] = useState<string | null>(null);

  useEffect(() => {
    const alvos = itens.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!alvos.length || !('IntersectionObserver' in window)) return;
    const visiveis = new Set<string>();
    const ob = new IntersectionObserver((es) => {
      for (const e of es) (e.isIntersecting ? visiveis.add(e.target.id) : visiveis.delete(e.target.id));
      const primeiro = alvos.find((a) => visiveis.has(a.id));
      if (primeiro) setAtual(primeiro.id);
    }, { rootMargin: '-18% 0px -62% 0px' });
    alvos.forEach((a) => ob.observe(a));
    return () => ob.disconnect();
  }, [itens]);

  return (
    <nav className="doc-indice" aria-label="Índice">
      <p className="doc-indice-t">Índice</p>
      <ol>
        {itens.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={atual === s.id ? 'location' : undefined}>
              <span>{s.n ?? ''}</span>{s.t}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
