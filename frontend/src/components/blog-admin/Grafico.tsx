'use client';

import { useId, useMemo, useState } from 'react';
import type { PontoNoTempo } from './tipos';

/* =========================================================================
   O GRÁFICO DE ÁREA ("Tráfego ao longo do tempo", "Views ao longo do tempo")

   As mesmas duas séries do ar, Views e Visitantes únicos. Views é a área
   laranja; únicos é a linha clara por cima. Passando o mouse (ou o dedo),
   uma régua acompanha e o dia aparece em cima com os dois números, como
   no gráfico do app Ações. Sem ponto nenhum, a régua some.
   Desenhado em SVG, sem biblioteca: no ar era o Recharts, e ele pode
   ficar; o que importa é a cor, a linha e a etiqueta.
   ========================================================================= */

const L = 1000, A = 260, TOPO = 16, BASE = 28;

/* A curva que passa por todos os pontos sem subir acima do pico nem
   descer abaixo de zero entre eles (monótona, Fritsch-Carlson). */
function curva(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 3) return xs.map((x, k) => `${k ? 'L' : 'M'}${x.toFixed(1)},${ys[k].toFixed(1)}`).join('');
  const d = xs.slice(1).map((x, k) => (ys[k + 1] - ys[k]) / (x - xs[k]));
  const m = xs.map((_, k) => (k === 0 ? d[0] : k === n - 1 ? d[n - 2] : d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2));
  for (let k = 0; k < n - 1; k++) {
    if (d[k] === 0) { m[k] = 0; m[k + 1] = 0; continue; }
    const a = m[k] / d[k], b = m[k + 1] / d[k], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[k] = t * a * d[k]; m[k + 1] = t * b * d[k]; }
  }
  let caminho = `M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
  for (let k = 0; k < n - 1; k++) {
    const h = (xs[k + 1] - xs[k]) / 3;
    caminho += `C${(xs[k] + h).toFixed(1)},${(ys[k] + m[k] * h).toFixed(1)} ${(xs[k + 1] - h).toFixed(1)},${(ys[k + 1] - m[k + 1] * h).toFixed(1)} ${xs[k + 1].toFixed(1)},${ys[k + 1].toFixed(1)}`;
  }
  return caminho;
}

function dia(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** `rotuloUnicos={null}` tira a linha dos únicos (o analytics de um post
 *  não tem únicos por dia na API). */
export function Grafico({ pontos, rotuloUnicos = 'Visitantes únicos' }: { pontos: PontoNoTempo[]; rotuloUnicos?: string | null }) {
  const id = useId().replace(/:/g, '');
  const [i, setI] = useState<number | null>(null);
  const max = Math.max(1, ...pontos.map((p) => p.views));
  const teto = Math.ceil(max / 4) * 4 || 4;
  const x = (k: number) => (pontos.length < 2 ? L / 2 : (k / (pontos.length - 1)) * L);
  const y = (v: number) => TOPO + (1 - v / teto) * (A - TOPO - BASE);

  const { area, linhaV, linhaU } = useMemo(() => {
    const xs = pontos.map((_, k) => x(k));
    const lv = curva(xs, pontos.map((p) => y(p.views)));
    const lu = curva(xs, pontos.map((p) => y(p.unicos)));
    return { linhaV: lv, linhaU: lu, area: `${lv}L${L},${A - BASE}L0,${A - BASE}Z` };
  }, [pontos, teto]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pontos.length || pontos.every((p) => !p.views)) {
    return <p className="adm-grafico-vazio">Sem dados no período</p>;
  }

  const marcas = [0, .5, 1].map((f) => Math.round(teto * f));
  const passo = Math.max(1, Math.ceil(pontos.length / 6));
  const p = i === null ? null : pontos[i];

  function mover(clientX: number, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setI(Math.round(f * (pontos.length - 1)));
  }

  return (
    <div className="adm-grafico">
      <ul className="adm-grafico-leg" aria-hidden="true">
        <li data-s="v">Views</li>
        {rotuloUnicos ? <li data-s="u">{rotuloUnicos}</li> : null}
      </ul>
      <div className="adm-grafico-area"><div className="adm-grafico-plot"
        onPointerMove={(e) => mover(e.clientX, e.currentTarget)}
        onPointerDown={(e) => mover(e.clientX, e.currentTarget)}
        onPointerLeave={() => setI(null)}>
        <svg viewBox={`0 0 ${L} ${A}`} preserveAspectRatio="none" role="img"
          aria-label={`${pontos.length} dias. Pico de ${max} views.`}>
          <defs>
            <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#FF6A00" stopOpacity=".34" />
              <stop offset="1" stopColor="#FF6A00" stopOpacity="0" />
            </linearGradient>
          </defs>
          {marcas.map((m) => <line key={m} className="adm-grafico-grade" x1="0" x2={L} y1={y(m)} y2={y(m)} />)}
          <path d={area} fill={`url(#g${id})`} />
          <path d={linhaV} className="adm-grafico-v" />
          {rotuloUnicos ? <path d={linhaU} className="adm-grafico-u" /> : null}
          {p ? <line className="adm-grafico-regua" x1={x(i!)} x2={x(i!)} y1={TOPO} y2={A - BASE} /> : null}
        </svg>
        {marcas.map((m) => <span key={m} className="adm-grafico-y" style={{ top: `${(y(m) / A) * 100}%` }}>{m}</span>)}
        <div className="adm-grafico-x" aria-hidden="true">
          {pontos.map((q, k) => (k % passo === 0 ? <span key={q.dia} style={{ left: `${(x(k) / L) * 100}%` }}>{dia(q.dia)}</span> : null))}
        </div>
        {p ? (
          <>
            <i className="adm-grafico-ponto" style={{ left: `${(x(i!) / L) * 100}%`, top: `${(y(p.views) / A) * 100}%` }} />
            <div className="adm-grafico-dica" style={{ left: `${(x(i!) / L) * 100}%` }} data-lado={i! > pontos.length / 2 ? 'e' : 'd'}>
              <b>{dia(p.dia)}</b>
              <span data-s="v">{p.views} views</span>
              {rotuloUnicos ? <span data-s="u">{p.unicos} únicos</span> : null}
            </div>
          </>
        ) : null}
      </div></div>
    </div>
  );
}
