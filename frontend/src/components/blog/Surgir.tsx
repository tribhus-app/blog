'use client';

import { useEffect } from 'react';

/* A ENTRADA DOS BLOCOS E DAS FOTOS, uma vez só.

   OS BLOCOS: cada `[data-surge]` sobe um pouco e aparece quando chega na
   tela, e fica. Na grade, um depois do outro pela coluna (`--i`). Só quem
   não pediu menos movimento vê (o `revela` no <html> vem do script antes do
   primeiro desenho). Sem script, ou se ele falhar, o CSS mostra tudo sozinho
   em quatro segundos: a página nunca fica em branco.

   AS FOTOS: a foto que chega depois (as `loading="lazy"`) aparece aos
   poucos, em vez de estalar inteira no meio do quadro vazio. A que já
   chegou é marcada ANTES de o `data-surgir` ligar a regra, e por isso nada
   que já estava na tela some e volta. A foto que o Google mede (a capa, sem
   lazy) nunca começa apagada. */
export function Surgir() {
  useEffect(() => {
    const raiz = document.documentElement;
    const fotos = () => document.querySelectorAll<HTMLImageElement>('.bl img[loading="lazy"]:not([data-pronta])');
    const pronta = (i: HTMLImageElement) => i.setAttribute('data-pronta', '');
    fotos().forEach((i) => { if (i.complete && i.naturalWidth > 0) pronta(i); });
    const chegou = (e: Event) => {
      const i = e.target;
      if (i instanceof HTMLImageElement && i.closest('.bl')) pronta(i);
    };
    document.addEventListener('load', chegou, true);
    raiz.setAttribute('data-surgir', '');

    const alvos = [...document.querySelectorAll<HTMLElement>('[data-surge]:not([data-visto])')];
    let ob: IntersectionObserver | null = null;
    if (alvos.length) {
      if (!('IntersectionObserver' in window)) alvos.forEach((a) => a.setAttribute('data-visto', ''));
      else {
        ob = new IntersectionObserver((es) => {
          for (const e of es) if (e.isIntersecting) { e.target.setAttribute('data-visto', ''); ob?.unobserve(e.target); }
        }, { rootMargin: '0px 0px -4% 0px' });
        alvos.forEach((a) => ob?.observe(a));
      }
    }
    return () => { document.removeEventListener('load', chegou, true); ob?.disconnect(); };
  }, []);
  return null;
}
