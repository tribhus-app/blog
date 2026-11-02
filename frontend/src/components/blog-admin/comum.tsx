import type { ReactNode } from 'react';

/* =========================================================================
   O QUE É COMUM ÀS TELAS E NÃO TEM ESTADO: o avatar, o status, a cabeça da
   tela e os formatos (data, número, duração, slug). Serve ao servidor e ao
   cliente.
   ========================================================================= */

/* ---------- O AVATAR ----------
   A foto do autor; sem foto, a palheta da casa (nunca a inicial, que era o
   "A" laranja do ar e é a cara de modelo pronto que o site já tirou). */
export function Avatar({ src, tamanho = 36 }: { src?: string | null; tamanho?: number }) {
  return (
    <span className="adm-avatar" style={{ width: tamanho, height: tamanho }} data-vazio={src ? undefined : ''}>
      {src ? <img src={src} alt="" width={tamanho} height={tamanho} /> : <img src="/img/logo-simbolo.webp" alt="" width={tamanho} height={tamanho} />}
    </span>
  );
}

/* ---------- O STATUS ----------
   Publicado é o normal (398 de 400) e fica quieto; o que pede olho é o
   rascunho e o agendado, em âmbar. */
export const NOME_DO_STATUS = { published: 'Publicado', draft: 'Rascunho', scheduled: 'Agendado' } as const;
export function Status({ s }: { s: keyof typeof NOME_DO_STATUS }) {
  return <span className="adm-status" data-s={s}>{NOME_DO_STATUS[s]}</span>;
}

/* ---------- A CABEÇA DE CADA TELA ----------
   O título à esquerda e a ação principal à direita, onde o ar já tinha. */
export function CabecaDaTela({ titulo, sub, acao, voltar }: { titulo: ReactNode; sub?: ReactNode; acao?: ReactNode; voltar?: ReactNode }) {
  return (
    <header className="adm-cabeca">
      <div className="adm-cabeca-t">
        {voltar}
        <div>
          <h1>{titulo}</h1>
          {sub ? <p className="adm-cabeca-sub">{sub}</p> : null}
        </div>
      </div>
      {acao ? <div className="adm-cabeca-acao">{acao}</div> : null}
    </header>
  );
}

export const data = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' }) : '';

export const numero = (n: number) => n.toLocaleString('pt-BR');

export function duracao(s: number) {
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${String(Math.round(s % 60)).padStart(2, '0')}s`;
}

export const slugar = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
