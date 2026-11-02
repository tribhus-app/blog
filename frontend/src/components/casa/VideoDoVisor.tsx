'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TextosDoVisor } from './Visor';

/* =========================================================================
   O PLAYER DE VÍDEO DA CASA (dentro do visor)

   Os controles do navegador (a barra cinza, os três pontinhos) eram a parte
   mais feia do visor, justo no take, que é o conteúdo mais forte da cena.
   Estes são da casa: o botão de tocar, O SULCO (a barra de tempo, a mesma
   língua da página de música: o trecho tocado em laranja, a agulha, o tempo
   na letra de painel), o som e a tela cheia.

   - Somem enquanto o vídeo toca, e voltam ao mexer o mouse, tocar a tela ou
     usar o teclado. Pausado, ficam.
   - Teclado (com o foco no visor): espaço toca e pausa, M liga e desliga o
     som, F tela cheia, J e L voltam e avançam 5 s.
   - O sulco se arrasta com o mouse e com o dedo, mostra o tempo do ponto sob
     o cursor e é um `slider` de verdade para o leitor de tela.
   - A caixa segue o formato REAL do vídeo (take em pé, vídeo deitado).

   FUNCIONA COM O PLAYER HLS DO SITE: os controles só leem e mandam no
   elemento `<video>`. Passe `preparar` (no `Visor`, a prop `prepararVideo`)
   para ligar o hls.js ao elemento, como a página do take já faz; sem ela, o
   `src` vai direto no vídeo (mp4, ou HLS no Safari).
   ========================================================================= */

/* a escolha do som vale para o próximo vídeo: quem tirou o som num take
   não leva susto no seguinte */
let MUDO_ESCOLHIDO = false;

const mmss = (s: number) => {
  const v = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
};

export function VideoDoVisor({ src, poster, emPe, textos, preparar, naPagina = false }: {
  src: string;
  poster: string | null;
  emPe: boolean;
  textos: TextosDoVisor;
  /** Liga o player do site (hls.js) ao elemento. Devolve a limpeza. */
  preparar?: (video: HTMLVideoElement, src: string) => void | (() => void);
  /** Na página da coisa (e não no visor): NÃO TOCA SOZINHO (quem chega pelo
   *  link vê a capa e o tocar grande, e aperta), e as teclas só valem com o
   *  foco no vídeo ou solto na página: o espaço num link rola a página. */
  naPagina?: boolean;
}) {
  const t = textos;
  const ref = useRef<HTMLVideoElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const sulco = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState(emPe);
  const [tocando, setTocando] = useState(false);
  const [mudo, setMudo] = useState(MUDO_ESCOLHIDO);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [carregado, setCarregado] = useState(0);
  const [quieto, setQuieto] = useState(false);
  const [mira, setMira] = useState<{ x: number; t: number } | null>(null);
  const [esperando, setEsperando] = useState(true);
  const sono = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* o player do site (HLS), quando houver */
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = MUDO_ESCOLHIDO;
    /* se o navegador não deixar tocar com som, toca mudo (e o botão do som
       mostra que está mudo), em vez de ficar parado */
    const tocarComOuSemSom = () => { v.play().catch(() => { v.muted = true; setMudo(true); v.play().catch(() => {}); }); };
    if (!naPagina) v.addEventListener('loadeddata', tocarComOuSemSom, { once: true });
    if (preparar) {
      const limpar = preparar(v, src);
      return () => { v.removeEventListener('loadeddata', tocarComOuSemSom); if (limpar) limpar(); };
    }
    v.src = src;
    return () => { v.removeEventListener('loadeddata', tocarComOuSemSom); v.removeAttribute('src'); v.load(); };
  }, [src, preparar, naPagina]);

  /* os controles cochilam enquanto toca */
  const acordar = useCallback(() => {
    setQuieto(false);
    clearTimeout(sono.current);
    sono.current = setTimeout(() => { if (!ref.current?.paused) setQuieto(true); }, 2400);
  }, []);
  useEffect(() => () => clearTimeout(sono.current), []);

  const alternar = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
    acordar();
  }, [acordar]);
  const pular = useCallback((s: number) => {
    const v = ref.current;
    if (v && v.duration) v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + s));
    acordar();
  }, [acordar]);
  const somar = useCallback(() => {
    const v = ref.current;
    if (v) { v.muted = !v.muted; setMudo(v.muted); MUDO_ESCOLHIDO = v.muted; }
    acordar();
  }, [acordar]);
  const cheia = useCallback(() => {
    const c = caixa.current;
    if (!c) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else c.requestFullscreen?.().catch(() => {});
  }, []);

  /* teclado: espaço, M, F, J, L (não rouba as setas, que passam a galeria) */
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.closest('input, textarea, [contenteditable]')) return;
      if (alvo.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
      if (naPagina && alvo !== document.body && !caixa.current?.contains(alvo)) return;
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'k') { e.preventDefault(); alternar(); }
      else if (k === 'm') somar();
      else if (k === 'f') cheia();
      else if (k === 'j') pular(-5);
      else if (k === 'l') pular(5);
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [alternar, somar, cheia, pular, naPagina]);

  /* o sulco: clicar, arrastar e ver o tempo sob o cursor */
  const tempoEm = (clientX: number) => {
    const r = sulco.current!.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return { f, x: f * r.width, t: f * (ref.current?.duration || 0) };
  };
  const arrastar = (e: React.PointerEvent) => {
    const v = ref.current;
    if (!v || !v.duration) return;
    e.preventDefault();
    sulco.current!.setPointerCapture(e.pointerId);
    const ir = (x: number) => { const { t: s } = tempoEm(x); v.currentTime = s; setPos(s); };
    ir(e.clientX);
    const mover = (ev: PointerEvent) => ir(ev.clientX);
    const soltar = () => { sulco.current?.removeEventListener('pointermove', mover); };
    sulco.current!.addEventListener('pointermove', mover);
    sulco.current!.addEventListener('pointerup', soltar, { once: true });
    acordar();
  };
  const teclaNoSulco = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); e.stopPropagation();
      pular(e.key === 'ArrowRight' ? 5 : -5);
    } else if (e.key === 'Home' && ref.current) { e.preventDefault(); ref.current.currentTime = 0; }
    else if (e.key === 'End' && ref.current?.duration) { e.preventDefault(); ref.current.currentTime = ref.current.duration - 0.5; }
  };

  const f = dur ? pos / dur : 0;
  return (
    <div className="vv" ref={caixa} data-vertical={vertical ? '' : undefined} data-quieto={quieto && tocando ? '' : undefined}
         data-tocando={tocando ? '' : undefined} onPointerMove={acordar}>
      <video ref={ref} className="vs-midia vv-video" poster={poster ?? undefined} playsInline preload="auto"
             onClick={alternar}
             onLoadedMetadata={(e) => { const v = e.currentTarget; if (v.videoWidth) setVertical(v.videoHeight > v.videoWidth); setDur(v.duration || 0); }}
             onDurationChange={(e) => setDur(e.currentTarget.duration || 0)}
             onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
             onProgress={(e) => { const v = e.currentTarget; if (v.buffered.length && v.duration) setCarregado(v.buffered.end(v.buffered.length - 1) / v.duration); }}
             onPlay={() => { setTocando(true); acordar(); }} onPause={() => { setTocando(false); setQuieto(false); }}
             onWaiting={() => setEsperando(true)} onPlaying={() => setEsperando(false)} onCanPlay={() => setEsperando(false)}
             onVolumeChange={(e) => setMudo(e.currentTarget.muted)} />

      {/* o tocar grande, no meio, quando está parado */}
      {!tocando && (
        <button type="button" className="vv-grande" onClick={alternar} aria-label={t.tocar}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" /></svg>
        </button>
      )}
      {tocando && esperando ? <span className="vv-espera" aria-hidden="true"></span> : null}

      <div className="vv-barra">
        <button type="button" className="vv-bt" onClick={alternar} aria-label={tocando ? t.pausar : t.tocar}>
          {tocando
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" /></svg>}
        </button>
        <span className="vv-tempo" aria-hidden="true">{mmss(pos)}</span>
        <div className="vv-sulco" ref={sulco} role="slider" tabIndex={0} aria-label={t.tempo}
             aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(pos)} aria-valuetext={`${mmss(pos)} / ${mmss(dur)}`}
             onPointerDown={arrastar} onKeyDown={teclaNoSulco}
             onPointerMove={(e) => { if (dur) setMira(tempoEm(e.clientX)); }} onPointerLeave={() => setMira(null)}>
          <span className="vv-sulco-trilho">
            <i className="vv-sulco-carregado" style={{ transform: `scaleX(${carregado})` }}></i>
            <i className="vv-sulco-tocado" style={{ transform: `scaleX(${f})` }}></i>
          </span>
          <span className="vv-agulha"><i style={{ transform: `translateX(${f * 100}%)` }}></i></span>
          {mira ? <span className="vv-mira" style={{ transform: `translateX(${mira.x}px)` }}>{mmss(mira.t)}</span> : null}
        </div>
        <span className="vv-tempo vv-tempo-total" aria-hidden="true">{mmss(dur)}</span>
        <button type="button" className="vv-bt" onClick={somar} aria-label={mudo ? t.somLigar : t.somDesligar} aria-pressed={mudo}>
          {mudo
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path className="vv-traco" d="M16 9.5l5 5M21 9.5l-5 5" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path className="vv-traco" d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" /></svg>}
        </button>
        <button type="button" className="vv-bt" onClick={cheia} aria-label={t.telaCheia}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path className="vv-traco" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
        </button>
      </div>
    </div>
  );
}
