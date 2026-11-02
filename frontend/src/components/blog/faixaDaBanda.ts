import type { FaixaParaTocar } from './tipos';

/* =========================================================================
   A FAIXA DA BANDA NO "OUÇA ENQUANTO LÊ" (conserto de 31/10)

   O disco mais novo que tem faixa com áudio, e a primeira faixa com áudio
   dele. Banda sem nenhum áudio devolve `null`, e a ficha aparece sem o play.

   No pacote ela recebe a `BandaCrua` da página da banda. O blog não monta a
   banda inteira: `lib/blog.ts` entrega só o que esta função lê, com os
   discos de `/bands/public/albuns` e as faixas de
   `/bands/public/album-tracks` (os mesmos da página da banda no site).
   ========================================================================= */
export interface BandaComDiscos {
  nome: string;
  logoUrl?: string | null;
  lancamentos?: {
    ano?: number | null;
    capaUrl?: string | null;
    faixas?: { id?: number | null; titulo: string; audioUrl?: string | null; duracaoSegundos?: number | null }[];
  }[];
}

export function faixaDaBanda(banda: BandaComDiscos): FaixaParaTocar | null {
  const discos = [...(banda.lancamentos ?? [])].reverse().sort((a, b) => (b.ano ?? 0) - (a.ano ?? 0));
  for (const d of discos) {
    const f = (d.faixas ?? []).find((x) => x.audioUrl && x.id != null);
    if (f && f.audioUrl && f.id != null) {
      return {
        id: f.id, titulo: f.titulo, banda: banda.nome, capaUrl: d.capaUrl ?? banda.logoUrl ?? null,
        audioUrl: f.audioUrl, duracaoSegundos: f.duracaoSegundos ?? null,
      };
    }
  }
  return null;
}
