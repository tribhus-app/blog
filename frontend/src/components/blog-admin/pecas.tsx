'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icone } from './icones';

/* =========================================================================
   AS PEÇAS DO PAINEL: a janela, a confirmação, o aviso e o avatar

   A JANELA sobe do meio da tela, sobre o fundo escurecido (no telefone,
   de baixo, como folha). Esc e o clique fora fecham, o foco entra nela e
   fica preso, e volta para quem abriu. Só `transform` e `opacity` animam.

   A CONFIRMAÇÃO substitui o `confirm()` do navegador, a caixinha cinza do
   ar: o mesmo momento ("Tem certeza que deseja excluir?"), agora dizendo
   o que sai e com Excluir em vermelho, longe do Cancelar. Só existe para o
   que não volta (excluir); publicar e despublicar não pedem confirmação,
   porque voltam com um clique.

   O AVISO é a cápsula que aparece embaixo depois de salvar, publicar ou
   excluir, e some sozinha. Erro fica até fechar.
   ========================================================================= */

export function Janela({ titulo, aoFechar, children, rodape, larga = false, rotulo }: {
  titulo: ReactNode;
  aoFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
  larga?: boolean;
  rotulo?: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef(aoFechar);
  fechar.current = aoFechar;
  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null;
    const el = caixa.current;
    const foco = el?.querySelector<HTMLElement>('[data-foco], input, textarea, select, button:not([data-fechar])');
    foco?.focus();
    const rolagem = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); fechar.current(); return; }
      if (e.key !== 'Tab' || !el) return;
      const f = [...el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      const [p, u] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); }
      else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); }
    };
    document.addEventListener('keydown', tecla, true);
    return () => {
      document.removeEventListener('keydown', tecla, true);
      document.documentElement.style.overflow = rolagem;
      antes?.focus?.();
    };
  }, []);
  return (
    <div className="adm-janela-fundo" onPointerDown={(e) => { if (e.target === e.currentTarget) aoFechar(); }}>
      <div className={`adm-janela${larga ? ' larga' : ''}`} ref={caixa} role="dialog" aria-modal="true" aria-labelledby="adm-janela-t">
        <header className="adm-janela-topo">
          <div>
            {rotulo ? <p className="adm-rotulo">{rotulo}</p> : null}
            <h2 id="adm-janela-t">{titulo}</h2>
          </div>
          <button type="button" className="adm-bt-ic" data-fechar onClick={aoFechar} aria-label="Fechar"><Icone nome="fechar" /></button>
        </header>
        <div className="adm-janela-corpo">{children}</div>
        {rodape ? <footer className="adm-janela-pe">{rodape}</footer> : null}
      </div>
    </div>
  );
}

export function Confirmar({ titulo, texto, acao = 'Excluir', aoConfirmar, aoFechar }: {
  titulo: string;
  texto: ReactNode;
  acao?: string;
  /** Devolve a mensagem de erro, ou null quando deu certo. Sem ele, a
   *  janela só avisa (o que não se pode fazer) e tem um botão, Entendi. */
  aoConfirmar?: () => Promise<string | null>;
  aoFechar: () => void;
}) {
  const [indo, setIndo] = useState(false);
  const [erro, setErro] = useState('');
  async function ir() {
    if (!aoConfirmar) return;
    setIndo(true); setErro('');
    const e = await aoConfirmar();
    setIndo(false);
    if (e) setErro(e); else aoFechar();
  }
  return (
    <div className="adm-janela-fundo" onPointerDown={(e) => { if (e.target === e.currentTarget && !indo) aoFechar(); }}>
      <div className="adm-alerta" role="alertdialog" aria-modal="true" aria-labelledby="adm-alerta-t" aria-describedby="adm-alerta-x"
        onKeyDown={(e) => { if (e.key === 'Escape' && !indo) aoFechar(); }}>
        <span className="adm-alerta-ic" data-so-aviso={aoConfirmar ? undefined : ''}><Icone nome={aoConfirmar ? 'excluir' : 'aviso'} tamanho={22} /></span>
        <h2 id="adm-alerta-t">{titulo}</h2>
        <p id="adm-alerta-x">{texto}</p>
        {erro ? <p className="adm-erro" role="alert">{erro}</p> : null}
        {!aoConfirmar ? (
          <div className="adm-alerta-bts" data-um>
            <button type="button" className="adm-bt claro" onClick={aoFechar} autoFocus>Entendi</button>
          </div>
        ) : <div className="adm-alerta-bts">
          <button type="button" className="adm-bt" onClick={aoFechar} disabled={indo} autoFocus>Cancelar</button>
          <button type="button" className="adm-bt perigo" onClick={ir} disabled={indo} aria-busy={indo}>
            {indo ? <><span className="adm-giro" aria-hidden="true" />Excluindo</> : acao}
          </button>
        </div>}
      </div>
    </div>
  );
}

/* ---------- O AVISO ---------- */
type Aviso = { id: number; texto: string; erro: boolean };
const EVENTO = 'adm-aviso';

export function avisar(texto: string, erro = false) {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { texto, erro } }));
}

export function Avisos() {
  const [lista, setLista] = useState<Aviso[]>([]);
  useEffect(() => {
    let n = 0;
    const ouvir = (e: Event) => {
      const { texto, erro } = (e as CustomEvent<{ texto: string; erro: boolean }>).detail;
      const id = ++n;
      setLista((l) => [...l.slice(-2), { id, texto, erro }]);
      if (!erro) setTimeout(() => setLista((l) => l.filter((a) => a.id !== id)), 3200);
    };
    window.addEventListener(EVENTO, ouvir);
    return () => window.removeEventListener(EVENTO, ouvir);
  }, []);
  return (
    <div className="adm-avisos" aria-live="polite">
      {lista.map((a) => (
        <div key={a.id} className="adm-aviso" data-erro={a.erro ? '' : undefined} role={a.erro ? 'alert' : 'status'}>
          <Icone nome={a.erro ? 'aviso' : 'check'} tamanho={18} />
          <span>{a.texto}</span>
          {a.erro ? (
            <button type="button" className="adm-bt-ic mini" onClick={() => setLista((l) => l.filter((x) => x.id !== a.id))} aria-label="Fechar aviso">
              <Icone nome="fechar" tamanho={16} />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
