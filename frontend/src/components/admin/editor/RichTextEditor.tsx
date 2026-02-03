'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { useState, useEffect } from 'react'
import EditorToolbar from './EditorToolbar'
import VideoEmbed from './VideoEmbed'
import ImageUpload from './ImageUpload'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder = 'Comece a escrever...' }: RichTextEditorProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'text-primary underline hover:text-primary-hover',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
        HTMLAttributes: {
          class: 'rounded-lg my-4 aspect-video w-full',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  function handleInsertVideo(url: string) {
    if (!editor) return

    // Check if it's YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    if (youtubeRegex.test(url)) {
      editor.commands.setYoutubeVideo({ src: url })
    } else {
      // For Vimeo, insert as iframe HTML
      const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
      const match = url.match(vimeoRegex)
      if (match) {
        const vimeoId = match[1]
        editor.commands.insertContent(
          `<div class="aspect-video my-4"><iframe src="https://player.vimeo.com/video/${vimeoId}" class="w-full h-full rounded-lg" allowfullscreen></iframe></div>`
        )
      }
    }
  }

  function handleInsertImage(url: string) {
    if (!editor) return
    editor.commands.setImage({ src: url })
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-dark-input">
      <EditorToolbar
        editor={editor}
        onInsertImage={() => setIsImageModalOpen(true)}
        onInsertVideo={() => setIsVideoModalOpen(true)}
      />

      <EditorContent editor={editor} />

      <VideoEmbed
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onInsert={handleInsertVideo}
      />

      <ImageUpload
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImage}
      />

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #888888;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .ProseMirror {
          color: #ffffff;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #ffffff;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .ProseMirror h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .ProseMirror p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          margin-bottom: 0.25rem;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #914100;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #cccccc;
          font-style: italic;
        }

        .ProseMirror pre {
          background: #151922;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .ProseMirror code {
          background: #151922;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .ProseMirror iframe {
          max-width: 100%;
          border-radius: 0.5rem;
        }

        .ProseMirror hr {
          border-color: #333333;
          margin: 2rem 0;
        }
      `}</style>
    </div>
  )
}
