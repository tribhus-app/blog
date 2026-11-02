'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { BandaDaMateria } from './tipos';
import { ImagemComReserva } from '../casa/ImagemComReserva';

/* =========================================================================
   OUÇA ENQUANTO LÊ

   O que nenhum outro blog de rock tem: a banda de que o texto fala está na
   Tribhus, e toca aqui, sem sair da matéria. No computador, a coluna fica
   presa ao lado do texto; quem lê vai rolando e o player continua à vista.
   No telefone, ela vem logo depois da foto, numa fileira que passa para o
   lado.

   CADA BANDA É UM PLAYER (31/10), no desenho de player de música de
   verdade, e não de campo de formulário:
   - no computador, com uma banda só, a capa do disco grande, na largura da
     coluna, na mão como no Álbum (sombra e o fio de luz, nada por cima da
     arte). Ela fica um pouco menor parada e cresce quando a música toca,
     como no Apple Music (parada para quem pede menos movimento). Com
     várias bandas, e no telefone, a capa vai pequena ao lado do texto;
   - o gênero com a cidade em rótulo, o nome da banda em letra de cartaz
     (o nome e a capa levam à página dela) e o nome da faixa, com as três
     barrinhas da casa acesas enquanto toca;
   - embaixo, o botão redondo laranja (a ação da casa: play e pausa, com o
     giro enquanto o som não chega) e, na mesma linha, o tempo tocado, a
     linha do tempo (arrasta, clica e anda pelas setas) e a duração;
   - tocando, a faixa fica em âmbar (a luz de "tocando" da casa) e a linha
     se enche de âmbar;
   - a banda sem faixa com áudio é só a ficha de cima, com a foto dela.

   O BLOG TOCA SOZINHO. O blog é um app separado e não tem o player do site
   (a primeira versão mandava a faixa para o `player.js` e, no ar, não
   tocava). Aqui há um `<audio>` só, para todas as bandas da matéria:
   - outra banda: troca a faixa, nunca duas ao mesmo tempo;
   - no fim, tudo volta ao começo;
   - a faixa vai para os controles do sistema (a tela bloqueada do celular,
     as teclas de mídia), com a capa, e o play e a pausa de lá funcionam;
   - se o áudio falhar, o player diz e leva à página da banda;
   - sair da matéria para o som.
   A linha do tempo anda por quadro direto no estilo (`transform`), sem
   desenhar a página de novo. Se um dia o blog ganhar o player do site,
   troque o corpo de `alternar` por `tocar([faixa])` de `disco/tocador.ts`,
   como a Busca faz.

   A banda sem foto mostra a palheta da casa, nunca a inicial.
   ========================================================================= */
type Estado = 'carregando' | 'tocando' | 'pausado' | 'falhou';

const tempo = (s: number) => {
  const t = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

interface Pecas { cheio: HTMLSpanElement; ponto: HTMLSpanElement; agora: HTMLSpanElement; barra: HTMLInputElement }

export function OucaEnquantoLe({ bandas }: { bandas: BandaDaMateria[] }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const pecas = useRef(new Map<string, Partial<Pecas>>());
  /* trocar de faixa dispara um 'pause' atrasado da anterior: não é pausa */
  const trocando = useRef(false);
  const [atual, setAtual] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);

  function pintar(slug: string, pos: number, dur: number) {
    const p = pecas.current.get(slug);
    if (!p) return;
    const r = dur > 0 ? Math.min(1, pos / dur) : 0;
    if (p.cheio) p.cheio.style.transform = `scaleX(${r})`;
    if (p.ponto) p.ponto.style.transform = `translateX(${r * 100}%)`;
    if (p.agora) { const t = tempo(pos); if (p.agora.textContent !== t) p.agora.textContent = t; }
    if (p.barra && document.activeElement !== p.barra) p.barra.value = String(Math.floor(pos));
  }

  useEffect(() => {
    if (estado !== 'tocando' || !atual) return;
    let quadro = 0;
    const andar = () => {
      const a = audio.current;
      if (a) pintar(atual, a.currentTime, a.duration);
      quadro = requestAnimationFrame(andar);
    };
    quadro = requestAnimationFrame(andar);
    return () => cancelAnimationFrame(quadro);
  }, [estado, atual]);

  useEffect(() => () => { audio.current?.pause(); }, []);

  if (bandas.length === 0) return null;
  const varias = bandas.length > 1;

  function oAudio() {
    if (audio.current) return audio.current;
    const a = audio.current = new Audio();
    a.preload = 'none';
    a.addEventListener('playing', () => { trocando.current = false; setEstado('tocando'); });
    a.addEventListener('waiting', () => setEstado('carregando'));
    a.addEventListener('pause', () => { if (!trocando.current) setEstado((e) => (e === 'falhou' ? e : 'pausado')); });
    a.addEventListener('error', () => { trocando.current = false; setEstado('falhou'); });
    a.addEventListener('ended', () => {
      setAtual((s) => { if (s) pintar(s, 0, 1); return null; });
      setEstado(null);
    });
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => { void a.play(); });
      navigator.mediaSession.setActionHandler('pause', () => a.pause());
    }
    return a;
  }

  function alternar(b: BandaDaMateria) {
    const f = b.faixa;
    if (!f) return;
    const a = oAudio();
    if (atual === b.slug && estado !== 'falhou') {
      if (a.paused) void a.play().catch(() => setEstado('falhou'));
      else a.pause();
      return;
    }
    if (atual) pintar(atual, 0, 1);
    trocando.current = true;
    a.src = f.audioUrl;
    setAtual(b.slug);
    setEstado('carregando');
    void a.play().catch(() => { trocando.current = false; setEstado('falhou'); });
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: f.titulo, artist: b.nome, album: 'Tribhus',
        artwork: f.capaUrl ? [{ src: new URL(f.capaUrl, location.href).toString(), sizes: '512x512' }] : [],
      });
    }
  }

  function buscar(b: BandaDaMateria, e: ChangeEvent<HTMLInputElement>) {
    const a = audio.current;
    if (!a || atual !== b.slug) return;
    a.currentTime = Number(e.target.value);
    pintar(b.slug, a.currentTime, a.duration || b.faixa?.duracaoSegundos || 0);
  }

  const palheta = (
    <span className="bl-banda-foto bl-banda-palheta" aria-hidden="true">
      <img src="/img/logo-simbolo.webp" alt="" width={160} height={144} />
    </span>
  );
  const guardar = (slug: string, k: keyof Pecas) => (el: HTMLElement | null) => {
    const p = pecas.current.get(slug) ?? {};
    if (el) (p as Record<string, HTMLElement>)[k] = el; else delete p[k];
    pecas.current.set(slug, p);
  };

  return (
    <section className="bl-ouca" aria-labelledby="bl-ouca-tit" data-varias={varias ? '' : undefined}>
      <h2 className="bl-ouca-tit" id="bl-ouca-tit">{varias ? 'Ouça as bandas' : 'Ouça enquanto lê'}</h2>
      <ol className="bl-ouca-lista">
        {bandas.map((b) => {
          const f = b.faixa;
          const deste = atual === b.slug ? estado : null;
          const tocando = deste === 'tocando' || deste === 'carregando';
          const arte = (f?.capaUrl ?? b.fotoUrl) || null;
          const dur = f?.duracaoSegundos ?? 0;
          return (
            <li key={b.slug} className={`bl-banda${f ? ' com-faixa' : ''}`} data-estado={deste ?? undefined}>
              {/* a capa leva à banda, como o nome; fora da ordem do Tab para
                  não repetir o mesmo link duas vezes */}
              <a className="bl-banda-capa" href={`/bandas/${b.slug}`} tabIndex={-1} aria-hidden="true">
                {arte ? (
                  <ImagemComReserva embrulho="bl-banda-foto" src={arte} alt=""
                                    width={600} height={600} loading="lazy" decoding="async" reserva={palheta} />
                ) : palheta}
              </a>
              <div className="bl-banda-txt">
                {(b.cidade || b.genero) && <span className="bl-banda-meta">{[b.genero, b.cidade].filter(Boolean).join(' · ')}</span>}
                <a className="bl-banda-nome" href={`/bandas/${b.slug}`}>{b.nome}</a>
                {f && (
                  <span className="bl-banda-musica">
                    <span className="bl-nivel" aria-hidden="true"><b></b><b></b><b></b></span>
                    {f.titulo}
                  </span>
                )}
              </div>

              {f && deste === 'falhou' ? (
                <p className="bl-banda-falhou">
                  Não deu para tocar aqui. <a href={`/bandas/${b.slug}`}>Ouvir na página da banda</a>
                </p>
              ) : f ? (
                <>
                  <button className="bl-tocador-bt" type="button" onClick={() => alternar(b)}
                          aria-label={tocando ? `Pausar ${f.titulo}` : `Tocar ${f.titulo}, de ${b.nome}`}>
                    {deste === 'carregando' ? <span className="bl-tocador-giro" aria-hidden="true" />
                      : tocando ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5a.8.8 0 0 0-1.2.7z" /></svg>
                      )}
                  </button>
                  <div className="bl-tempo">
                    <span className="bl-tempo-n bl-tempo-agora" aria-hidden="true" ref={guardar(b.slug, 'agora')}>0:00</span>
                    <div className="bl-tempo-linha">
                      <span className="bl-tempo-trilho" aria-hidden="true">
                        <span className="bl-tempo-cheio" ref={guardar(b.slug, 'cheio')} />
                      </span>
                      <span className="bl-tempo-carro" aria-hidden="true" ref={guardar(b.slug, 'ponto')}><i /></span>
                      <input className="bl-tempo-barra" type="range" min={0} max={Math.max(1, Math.round(dur))} step={1} defaultValue={0}
                             ref={guardar(b.slug, 'barra')} disabled={!deste}
                             aria-label={`Posição em ${f.titulo}`} onChange={(e) => buscar(b, e)} />
                    </div>
                    <span className="bl-tempo-n bl-tempo-total" aria-hidden="true">{dur ? tempo(dur) : ''}</span>
                  </div>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
