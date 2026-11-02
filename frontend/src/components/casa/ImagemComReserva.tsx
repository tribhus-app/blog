'use client';

import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from 'react';

/* =========================================================================
   A IMAGEM COM RESERVA

   Quando o endereço existe mas o arquivo não abre (no ar, em 28/10, as
   miniaturas de take davam 404 no servidor de vídeo), o navegador desenha o
   ícone de imagem quebrada num quadrado preto. Esta peça troca a imagem
   pela RESERVA de cada lugar: no take, o primeiro quadro do próprio vídeo;
   no Radar, a letra do título, como já acontece sem capa; no cartaz do
   Palco, o cartaz sem foto (`embrulho` some junto com a imagem).

   A imagem pode falhar antes de a página ganhar vida (veio no HTML do
   servidor), quando o `onError` ainda não existe. Por isso, ao montar, ela
   confere se já terminou sem nada (`complete` com largura zero).

   NO SITE (envio de 28/10/2026): os atributos vão inteiros para a `<img>`,
   então o `srcSet` e o `sizes` do `imagemOtimizada` continuam valendo.
   ========================================================================= */
export function ImagemComReserva({ reserva = null, embrulho, ...img }: ImgHTMLAttributes<HTMLImageElement> & {
  /** O que entra no lugar quando o arquivo não abre. */
  reserva?: ReactNode;
  /** A classe de um `<span>` em volta da imagem, que sai junto com ela. */
  embrulho?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const el = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const i = el.current;
    if (i && i.complete && i.naturalWidth === 0) setFalhou(true);
  }, []);

  if (falhou) return <>{reserva}</>;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  const imagem = <img ref={el} {...img} onError={() => setFalhou(true)} />;
  return embrulho ? <span className={embrulho} aria-hidden="true">{imagem}</span> : imagem;
}
