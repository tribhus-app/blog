'use client';

import { useEffect, useRef } from 'react';
import { Visor, useVisor, VISOR_PT, type ItemDoVisor } from '../casa/Visor';
import type { FotoDoArtigo } from './corpo';
import type { BandaDaMateria } from './tipos';

/* =========================================================================
   O QUE O ARTIGO FAZ NO NAVEGADOR

   O artigo chega pronto do servidor (e fica em cache, como hoje). Isto só
   acrescenta o que precisa de mão:

   - A BARRA DE LEITURA: um fio laranja no alto da tela que enche conforme o
     texto passa. Anda por `transform`, nunca por largura, e só existe
     enquanto há texto para ler (some no fim da matéria).
   - O VÍDEO: a miniatura vira o player do YouTube (o domínio sem cookie) só
     quando a pessoa aperta, já tocando.
   - A FOTO: abre no visor da casa, o mesmo do Radar e da banda. Se a matéria
     é de uma banda só, o visor leva a ela ("Ver a banda").
   ========================================================================= */
export function LeituraViva({ titulo, fotos, bandas }: {
  titulo: string;
  fotos: FotoDoArtigo[];
  bandas: BandaDaMateria[];
}) {
  const barra = useRef<HTMLSpanElement>(null);

  /* a barra de leitura */
  useEffect(() => {
    const texto = document.querySelector<HTMLElement>('.bl-texto');
    const fio = barra.current;
    if (!texto || !fio) return;
    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const r = texto.getBoundingClientRect();
      const total = r.height - innerHeight * 0.55;
      const andou = Math.min(1, Math.max(0, (innerHeight * 0.3 - r.top) / Math.max(1, total)));
      fio.style.transform = `scaleX(${andou})`;
      fio.parentElement!.toggleAttribute('data-fim', andou >= 1);
      fio.parentElement!.toggleAttribute('data-antes', andou <= 0);
    };
    const pedir = () => { if (!pedido) pedido = requestAnimationFrame(medir); };
    medir();
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir);
    return () => { removeEventListener('scroll', pedir); removeEventListener('resize', pedir); cancelAnimationFrame(pedido); };
  }, []);

  /* o vídeo: troca a miniatura pelo player só no toque */
  useEffect(() => {
    const aoClicar = (ev: MouseEvent) => {
      const bt = (ev.target as Element | null)?.closest<HTMLButtonElement>('.bl-video-bt');
      if (!bt) return;
      const caixa = bt.parentElement as HTMLElement;
      const id = caixa.dataset.yt;
      if (!id) return;
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      f.title = 'Vídeo do YouTube';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      caixa.setAttribute('data-tocando', '');
      bt.replaceWith(f);
      f.focus();
    };
    /* vídeo apagado do YouTube: a miniatura volta 404 (no ar, um caso em
       "ouvir-rock-nacional"). A caixa diz que o vídeo saiu, em vez de um
       play que abre a tela de erro do YouTube */
    const indisponivel = (img: HTMLImageElement) => {
      const bt = img.closest<HTMLButtonElement>('.bl-video-bt');
      if (!bt || bt.disabled) return;
      bt.disabled = true;
      bt.setAttribute('aria-label', 'Vídeo indisponível no YouTube');
      bt.parentElement!.setAttribute('data-indisponivel', '');
      const aviso = document.createElement('span');
      aviso.className = 'bl-video-aviso';
      aviso.textContent = 'Vídeo indisponível no YouTube';
      bt.append(aviso);
    };
    /* o 404 do YouTube vem com corpo: a imagem cinza de 120 x 90 (a
       miniatura de verdade, hqdefault, tem 480) */
    const apagado = (img: HTMLImageElement) => img.complete && img.naturalWidth <= 120;
    const aoCarregar = (ev: Event) => {
      const img = ev.target;
      if (img instanceof HTMLImageElement && img.hasAttribute('data-yt-capa') && apagado(img)) indisponivel(img);
    };
    document.querySelectorAll<HTMLImageElement>('img[data-yt-capa]').forEach((img) => {
      if (img.complete && img.currentSrc && apagado(img)) indisponivel(img);
    });
    document.addEventListener('load', aoCarregar, true);
    document.addEventListener('error', aoCarregar, true);
    document.addEventListener('click', aoClicar);
    return () => { document.removeEventListener('click', aoClicar); document.removeEventListener('load', aoCarregar, true); document.removeEventListener('error', aoCarregar, true); };
  }, []);

  /* a foto no visor da casa */
  const banda = bandas.length === 1 ? bandas[0] : null;
  const itens: ItemDoVisor[] = fotos.map((f) => ({
    id: f.id, tipo: 'foto', titulo, rotulo: 'Foto da matéria',
    imagem: f.src, miniatura: f.src, texto: f.legenda,
    autor: banda ? { nome: banda.nome, href: `/bandas/${banda.slug}`, fotoUrl: banda.fotoUrl, cidade: banda.cidade, tipo: 'banda' } : null,
  }));
  const visor = useVisor('.bl-texto', () => itens);

  return (
    <>
      <div className="bl-leitura" aria-hidden="true" data-antes=""><span ref={barra} /></div>
      {visor.props && <Visor {...visor.props} textos={VISOR_PT} />}
    </>
  );
}
