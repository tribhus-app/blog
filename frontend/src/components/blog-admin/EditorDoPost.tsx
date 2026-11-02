'use client';

import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useRef, useState } from 'react';
import { BarraDoEditor, type Comando } from './BarraDoEditor';
import { JanelaDeImagem, JanelaDeLink, JanelaDeVideo, idDoVideo } from './JanelasDoEditor';

/* =========================================================================
   O EDITOR DO POST NO AR: o TipTap de sempre com a barra do pacote

   As extensões e as classes que elas gravam no HTML são as MESMAS do
   editor antigo (components/admin/editor/RichTextEditor.tsx, apagado em
   31/10/2026 e guardado no git), de
   propósito: o HTML salvo nos posts não muda. O que muda é a barra
   (BarraDoEditor), as janelas da casa no lugar do prompt() e dos modais
   antigos, e a área de texto dentro de `.adm-texto`, com a tipografia do
   artigo. Ctrl+K abre a janela de link (atalho da extensão de link).

   No lugar do EditorDeTexto.tsx do pacote, que é só do exemplo.
   ========================================================================= */

const NIVEL: Partial<Record<Comando, 2 | 3 | 4>> = { h2: 2, h3: 3, h4: 4 };

function ativoNo(editor: Editor | null, c: Comando) {
  if (!editor) return false;
  if (NIVEL[c]) return editor.isActive('heading', { level: NIVEL[c] });
  if (c === 'link') return editor.isActive('link');
  if (c === 'image' || c === 'video' || c === 'undo' || c === 'redo') return false;
  return editor.isActive(c);
}

export function EditorDoPost({ inicial, aoMudar }: { inicial: string; aoMudar: (html: string) => void }) {
  const [janela, setJanela] = useState<null | 'image' | 'video' | 'link'>(null);
  const [linkAtual, setLinkAtual] = useState('');
  const abrirLink = useRef<() => void>(() => {});

  const editor = useEditor({
    immediatelyRender: false,
    // a barra pergunta isActive a cada mudança de seleção
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Image.configure({ allowBase64: false, HTMLAttributes: { class: 'max-w-full rounded-lg my-4' } }),
      Link.extend({
        addKeyboardShortcuts() {
          return { 'Mod-k': () => { abrirLink.current(); return true; } };
        },
      }).configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', class: 'text-primary underline hover:text-primary-hover' },
      }),
      Youtube.configure({ width: 640, height: 360, nocookie: true, HTMLAttributes: { class: 'rounded-lg my-4 aspect-video w-full' } }),
      Placeholder.configure({ placeholder: 'Comece a escrever seu post...' }),
      Underline,
    ],
    content: inicial,
    editorProps: { attributes: { class: 'adm-texto-area', 'aria-label': 'Conteúdo', role: 'textbox', 'aria-multiline': 'true' } },
    onUpdate: ({ editor: e }) => aoMudar(e.getHTML()),
  });

  abrirLink.current = () => {
    if (!editor) return;
    setLinkAtual((editor.getAttributes('link').href as string | undefined) ?? '');
    setJanela('link');
  };

  function executar(c: Comando) {
    if (!editor) return;
    if (c === 'link') { abrirLink.current(); return; }
    if (c === 'image' || c === 'video') { setJanela(c); return; }
    const ir = editor.chain().focus();
    const nivel = NIVEL[c];
    if (nivel) { ir.toggleHeading({ level: nivel }).run(); return; }
    switch (c) {
      case 'bold': ir.toggleBold().run(); break;
      case 'italic': ir.toggleItalic().run(); break;
      case 'underline': ir.toggleUnderline().run(); break;
      case 'strike': ir.toggleStrike().run(); break;
      case 'bulletList': ir.toggleBulletList().run(); break;
      case 'orderedList': ir.toggleOrderedList().run(); break;
      case 'blockquote': ir.toggleBlockquote().run(); break;
      case 'codeBlock': ir.toggleCodeBlock().run(); break;
      case 'undo': ir.undo().run(); break;
      case 'redo': ir.redo().run(); break;
    }
  }

  /* o vídeo entra como no editor antigo: YouTube pelo nó do TipTap, Vimeo
     como HTML inserido */
  function inserirVideo(url: string) {
    if (!editor) return;
    const v = idDoVideo(url);
    if (!v) return;
    if (v.tipo === 'youtube') editor.chain().focus().setYoutubeVideo({ src: url }).run();
    else editor.chain().focus().insertContent(`<div class="aspect-video my-4"><iframe src="https://player.vimeo.com/video/${v.id}" class="w-full h-full rounded-lg" allowfullscreen></iframe></div>`).run();
  }

  return (
    <div className="adm-editor">
      <BarraDoEditor ativo={(c) => ativoNo(editor, c)} executar={executar} />
      <div className="adm-texto">
        <EditorContent editor={editor} />
      </div>

      {janela === 'image' ? (
        <JanelaDeImagem aoFechar={() => setJanela(null)} aoInserir={(url) => editor?.chain().focus().setImage({ src: url }).run()} />
      ) : null}
      {janela === 'video' ? <JanelaDeVideo aoFechar={() => setJanela(null)} aoInserir={inserirVideo} /> : null}
      {janela === 'link' ? (
        <JanelaDeLink inicial={linkAtual} aoFechar={() => setJanela(null)}
          aoInserir={(url) => editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()}
          aoRemover={() => editor?.chain().focus().extendMarkRange('link').unsetLink().run()} />
      ) : null}

      {/* O aviso "Comece a escrever" do TipTap mora no primeiro parágrafo
          vazio (.is-editor-empty), não na área vazia como no exemplo. */}
      <style jsx global>{`
        .adm-texto-area p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          color: var(--cor-texto-4);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
