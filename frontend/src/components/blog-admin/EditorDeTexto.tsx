'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BarraDoEditor, type Comando } from './BarraDoEditor';
import { JanelaDeImagem, JanelaDeLink, JanelaDeVideo, idDoVideo } from './JanelasDoEditor';

/* =========================================================================
   O EDITOR DE TEXTO, NO EXEMPLO

   SÓ DO EXEMPLO. No ar o editor é o TipTap que já está lá: fica o TipTap,
   com a BarraDoEditor por cima e o EditorContent dentro de `.adm-texto`
   (o que a barra pede está no comentário dela). Aqui, para dar para
   escrever e ver a barra funcionando sem instalar nada, uma área
   editável do navegador faz o papel dele.
   ========================================================================= */

const BLOCO: Partial<Record<Comando, string>> = { h2: 'H2', h3: 'H3', h4: 'H4', blockquote: 'BLOCKQUOTE', codeBlock: 'PRE' };

export function EditorDeTexto({ inicial, aoMudar }: { inicial: string; aoMudar: (html: string) => void }) {
  const area = useRef<HTMLDivElement>(null);
  const guardada = useRef<Range | null>(null);
  const [, tique] = useState(0);
  const [janela, setJanela] = useState<null | 'image' | 'video' | 'link'>(null);
  const [linkAtual, setLinkAtual] = useState('');

  useEffect(() => { if (area.current) area.current.innerHTML = inicial; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const mexeu = () => { if (area.current?.contains(document.getSelection()?.anchorNode ?? null)) tique((n) => n + 1); };
    document.addEventListener('selectionchange', mexeu);
    return () => document.removeEventListener('selectionchange', mexeu);
  }, []);

  const mudou = useCallback(() => { aoMudar(area.current?.innerHTML ?? ''); tique((n) => n + 1); }, [aoMudar]);

  function blocoAtual() {
    let n = document.getSelection()?.anchorNode as Node | null;
    while (n && n !== area.current) {
      if (n instanceof HTMLElement && /^(H2|H3|H4|BLOCKQUOTE|PRE|UL|OL)$/.test(n.tagName)) return n.tagName;
      n = n.parentNode;
    }
    return '';
  }
  function ativo(c: Comando) {
    if (typeof document === 'undefined' || !area.current?.contains(document.getSelection()?.anchorNode ?? null)) return false;
    if (c === 'bold' || c === 'italic' || c === 'underline') return document.queryCommandState(c);
    if (c === 'strike') return document.queryCommandState('strikeThrough');
    if (c === 'bulletList') return document.queryCommandState('insertUnorderedList');
    if (c === 'orderedList') return document.queryCommandState('insertOrderedList');
    if (BLOCO[c]) return blocoAtual() === BLOCO[c];
    return false;
  }
  function guardar() {
    const s = document.getSelection();
    guardada.current = s && s.rangeCount && area.current?.contains(s.anchorNode) ? s.getRangeAt(0).cloneRange() : null;
  }
  function voltar() {
    area.current?.focus();
    const s = document.getSelection();
    if (guardada.current && s) { s.removeAllRanges(); s.addRange(guardada.current); }
  }
  function executar(c: Comando) {
    area.current?.focus();
    if (c === 'image' || c === 'video' || c === 'link') {
      guardar();
      if (c === 'link') {
        let n = document.getSelection()?.anchorNode as Node | null;
        while (n && n !== area.current && !(n instanceof HTMLAnchorElement)) n = n.parentNode;
        setLinkAtual(n instanceof HTMLAnchorElement ? n.getAttribute('href') ?? '' : '');
      }
      setJanela(c);
      return;
    }
    const mapa: Partial<Record<Comando, [string, string?]>> = {
      bold: ['bold'], italic: ['italic'], underline: ['underline'], strike: ['strikeThrough'],
      bulletList: ['insertUnorderedList'], orderedList: ['insertOrderedList'], undo: ['undo'], redo: ['redo'],
    };
    if (mapa[c]) document.execCommand(mapa[c]![0], false, mapa[c]![1]);
    else if (BLOCO[c]) document.execCommand('formatBlock', false, blocoAtual() === BLOCO[c] ? 'P' : BLOCO[c]);
    mudou();
  }

  return (
    <div className="adm-editor">
      <BarraDoEditor ativo={ativo} executar={executar} />
      <div className="adm-texto">
        <div ref={area} className="adm-texto-area" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true"
          aria-label="Conteúdo" data-placeholder="Comece a escrever seu post..." onInput={mudou}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); executar('link'); }
          }} />
      </div>

      {janela === 'image' ? (
        <JanelaDeImagem aoFechar={() => setJanela(null)} aoInserir={(url) => { voltar(); document.execCommand('insertHTML', false, `<img src="${url}" alt="">`); mudou(); }} />
      ) : null}
      {janela === 'video' ? (
        <JanelaDeVideo aoFechar={() => setJanela(null)} aoInserir={(url) => {
          const v = idDoVideo(url);
          if (!v) return;
          const src = v.tipo === 'youtube' ? `https://www.youtube.com/embed/${v.id}` : `https://player.vimeo.com/video/${v.id}`;
          voltar(); document.execCommand('insertHTML', false, `<div data-youtube-video><iframe src="${src}" allowfullscreen></iframe></div><p><br></p>`); mudou();
        }} />
      ) : null}
      {janela === 'link' ? (
        <JanelaDeLink inicial={linkAtual} aoFechar={() => setJanela(null)}
          aoInserir={(url) => { voltar(); document.execCommand('createLink', false, url); mudou(); }}
          aoRemover={() => { voltar(); document.execCommand('unlink'); mudou(); }} />
      ) : null}
    </div>
  );
}
