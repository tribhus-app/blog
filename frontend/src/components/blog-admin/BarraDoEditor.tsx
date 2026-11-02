'use client';

import { Icone, type NomeDoIcone } from './icones';

/* =========================================================================
   A BARRA DO EDITOR

   Os mesmos botões do ar, na mesma ordem e nos mesmos grupos: Negrito,
   Itálico, Sublinhado, Tachado | Título 2, 3, 4 | as duas listas,
   Citação, Bloco de código | Imagem, Vídeo, Link | Desfazer, Refazer.
   O botão ligado fica claro (no ar, laranja queimado), e a barra fica
   presa no alto enquanto o texto rola, para não ter de subir até ela.

   NO AR o editor é TipTap. A barra não sabe disso: ela pergunta `ativo` e
   chama `executar`. Ligando no TipTap:
     bold        editor.chain().focus().toggleBold().run()
     italic      ...toggleItalic()      underline  ...toggleUnderline()
     strike      ...toggleStrike()
     h2 h3 h4    ...toggleHeading({ level: 2 | 3 | 4 })
     bulletList  ...toggleBulletList()  orderedList ...toggleOrderedList()
     blockquote  ...toggleBlockquote()  codeBlock   ...toggleCodeBlock()
     image video link   abrem as janelas (JanelaDeImagem, JanelaDeVideo,
                        JanelaDeLink); o que elas devolvem entra com
                        setImage, o nó de vídeo que o ar já tem, setLink
     undo redo   ...undo()  ...redo()
     ativo(c)    editor.isActive('bold'), isActive('heading', { level: 2 })...
   E a área de texto é o `EditorContent` dentro de `.adm-texto`.
   ========================================================================= */

export type Comando =
  | 'bold' | 'italic' | 'underline' | 'strike'
  | 'h2' | 'h3' | 'h4'
  | 'bulletList' | 'orderedList' | 'blockquote' | 'codeBlock'
  | 'image' | 'video' | 'link'
  | 'undo' | 'redo';

type Botao = { c: Comando; rotulo: string; icone?: NomeDoIcone; letra?: string };

const GRUPOS: Botao[][] = [
  [
    { c: 'bold', rotulo: 'Negrito (Ctrl+B)', letra: 'B' },
    { c: 'italic', rotulo: 'Itálico (Ctrl+I)', letra: 'I' },
    { c: 'underline', rotulo: 'Sublinhado (Ctrl+U)', letra: 'U' },
    { c: 'strike', rotulo: 'Tachado', letra: 'S' },
  ],
  [
    { c: 'h2', rotulo: 'Título 2', letra: 'H2' },
    { c: 'h3', rotulo: 'Título 3', letra: 'H3' },
    { c: 'h4', rotulo: 'Título 4', letra: 'H4' },
  ],
  [
    { c: 'bulletList', rotulo: 'Lista com marcadores', icone: 'lista' },
    { c: 'orderedList', rotulo: 'Lista numerada', icone: 'listaNum' },
    { c: 'blockquote', rotulo: 'Citação', icone: 'citacao' },
    { c: 'codeBlock', rotulo: 'Bloco de código', icone: 'codigo' },
  ],
  [
    { c: 'image', rotulo: 'Inserir imagem', icone: 'imagem' },
    { c: 'video', rotulo: 'Inserir vídeo', icone: 'video' },
    { c: 'link', rotulo: 'Inserir/remover link', icone: 'link' },
  ],
  [
    { c: 'undo', rotulo: 'Desfazer (Ctrl+Z)', icone: 'desfazer' },
    { c: 'redo', rotulo: 'Refazer (Ctrl+Y)', icone: 'refazer' },
  ],
];

export function BarraDoEditor({ ativo, executar }: { ativo: (c: Comando) => boolean; executar: (c: Comando) => void }) {
  return (
    <div className="adm-barra" role="toolbar" aria-label="Formatação">
      {GRUPOS.map((g, i) => (
        <div key={i} className="adm-barra-g">
          {g.map((b) => (
            <button key={b.c} type="button" className="adm-barra-bt" data-letra={b.letra ? b.letra.toLowerCase() : undefined}
              aria-label={b.rotulo} title={b.rotulo} aria-pressed={ativo(b.c) || undefined}
              onMouseDown={(e) => e.preventDefault()} onClick={() => executar(b.c)}>
              {b.icone ? <Icone nome={b.icone} tamanho={18} /> : <span>{b.letra}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
