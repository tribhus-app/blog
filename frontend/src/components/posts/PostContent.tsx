import Image from 'next/image'
import Link from 'next/link'
import { imagePresets } from '@/lib/imagePresets'
import { Fragment } from 'react'

interface PostContentProps {
  content: string
}

// Inline parser for bold, italic, link (returns HTML string for dangerouslySetInnerHTML inside safe tags)
const parseInline = (text: string) => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\*\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
}

export default function PostContent({ content }: PostContentProps) {
  if (!content) return null

  // 1. Extract Images (Split content into Text chunks and Image objects)
  const mainRegex = /(?:[![\\]\(]([^)\\]*)[\)\]]\(([^)]+)\)\]\(([^)]+)\))|(?:!\[([^\]]*)\]\(([^)]+)\))|(<a\s+[^>]*>\s*<img\s+[^>]+>\s*<\/a>)|(<img\s+[^>]+>)/gi
  const parts = []
  let lastIndex = 0
  let match

  while ((match = mainRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) })
    }

    // Helper to get attribute from HTML string
    const getAttr = (tag: string, name: string) => {
      const r = new RegExp(`${name}=["']([^"']+)["']`, 'i')
      const m = tag.match(r)
      return m ? m[1] : undefined
    }

    if (match[1] !== undefined) { // MD Linked
      const rawSrc = match[2] || ''
      const src = rawSrc.trim().split(/\s+/)[0]
      parts.push({ type: 'image-link', alt: match[1], src, href: match[3] })
    } else if (match[4] !== undefined) { // MD Image
      const rawSrc = match[5] || ''
      const src = rawSrc.trim().split(/\s+/)[0]
      parts.push({ type: 'image', alt: match[4], src })
    } else if (match[6] !== undefined) { // HTML Linked
      const fullTag = match[6]
      const imgTagMatch = fullTag.match(/<img\s+[^>]+>/i)
      const imgTag = imgTagMatch ? imgTagMatch[0] : ''
      const aTagMatch = fullTag.match(/<a\s+[^>]+>/i)
      const aTag = aTagMatch ? aTagMatch[0] : ''
      parts.push({
        type: 'image-link',
        src: getAttr(imgTag, 'src') || '',
        alt: getAttr(imgTag, 'alt') || '',
        href: getAttr(aTag, 'href') || '#',
        width: getAttr(imgTag, 'width'),
        height: getAttr(imgTag, 'height')
      })
    } else if (match[7] !== undefined) { // HTML Image
      const imgTag = match[7]
      parts.push({
        type: 'image',
        src: getAttr(imgTag, 'src') || '',
        alt: getAttr(imgTag, 'alt') || '',
        width: getAttr(imgTag, 'width'),
        height: getAttr(imgTag, 'height')
      })
    }
    lastIndex = mainRegex.lastIndex
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) })
  }

  // 2. Render Loop
  return (
    <div className="prose max-w-none">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          // Structural Block Parsing to avoid hydration mismatch
          // Split by double newlines to find blocks (p, h, ul, blockquote)
          const blocks = part.content?.split(/\n\n+/) || []
          
          return (
            <Fragment key={`text-${index}`}>
              {blocks.map((block, bIndex) => {
                const cleanBlock = block.trim()
                if (!cleanBlock) return null
                const key = `block-${index}-${bIndex}`

                // Header
                const hMatch = cleanBlock.match(/^(#{1,4})\s+(.*)/)
                if (hMatch) {
                  const level = hMatch[1].length
                  const text = parseInline(hMatch[2])
                  const Tag = `h${level}` as keyof JSX.IntrinsicElements
                  return <Tag key={key} dangerouslySetInnerHTML={{ __html: text }} />
                }

                // Blockquote
                if (cleanBlock.startsWith('> ')) {
                  const text = parseInline(cleanBlock.replace(/^>\s+/gm, '').replace(/\n/g, '<br/>'))
                  return <blockquote key={key} dangerouslySetInnerHTML={{ __html: text }} />
                }

                // List (unordered) - crude detection if block starts with "- "
                if (cleanBlock.match(/^- /)) {
                  const items = cleanBlock.split('\n').filter(line => line.trim().startsWith('- '))
                  return (
                    <ul key={key} className="list-disc pl-6 my-4">
                      {items.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item.replace(/^- /, '')) }} />
                      ))}
                    </ul>
                  )
                }

                // YouTube / Video
                // Detect YouTube content: video-container div, embed URLs, or simple watch links
                // This handles both properly formatted embeds AND simple YouTube links from AI
                const hasVideoContainer = cleanBlock.includes('<div class="video-container">')
                const hasEmbedUrl = cleanBlock.includes('youtube.com/embed') || cleanBlock.includes('youtube-nocookie.com/embed')
                const hasWatchLink = /youtube\.com\/watch\?v=|youtu\.be\//.test(cleanBlock)

                if (hasVideoContainer || hasEmbedUrl || hasWatchLink) {
                   // Convert any YouTube watch links to embeds
                   let videoBlock = cleanBlock.replace(
                      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<]*)?/g,
                      '<div class="video-container my-6"><iframe class="w-full aspect-video rounded-lg" src="https://www.youtube-nocookie.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
                   )
                   // Also handle cases where the link is wrapped in an <a> tag
                   videoBlock = videoBlock.replace(
                      /<a[^>]*href=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})[^"']*["'][^>]*>[^<]*<\/a>/gi,
                      '<div class="video-container my-6"><iframe class="w-full aspect-video rounded-lg" src="https://www.youtube-nocookie.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
                   )
                   return <div key={key} dangerouslySetInnerHTML={{ __html: videoBlock }} />
                }

                // Standard Paragraph
                // Convert single newlines to <br/>
                const pText = parseInline(cleanBlock.replace(/\n/g, '<br/>'))
                return <p key={key} dangerouslySetInnerHTML={{ __html: pText }} />
              })}
            </Fragment>
          )
        }

        // Image Rendering
        const src = part.src || ''
        if (!src) return null

        const widthVal = part.width ? parseInt(part.width as string) : NaN
        const heightVal = part.height ? parseInt(part.height as string) : NaN
        const width = !isNaN(widthVal) && widthVal > 0 ? widthVal : 800
        const height = !isNaN(heightVal) && heightVal > 0 ? heightVal : 500

        const ImageComponent = (
          <div className="relative my-8 flex justify-center">
            <Image
              src={src}
              alt={part.alt || 'Imagem do post'}
              width={width}
              height={height}
              sizes={imagePresets.content.sizes}
              className="h-auto rounded-lg object-contain max-w-full"
              style={{
                maxWidth: '100%',
                height: 'auto',
                width: 'auto'
              }}
            />
          </div>
        )

        if (part.type === 'image-link' && part.href) {
          return (
            <Link key={`img-${index}`} href={part.href} className="block hover:opacity-90 transition-opacity" target="_blank" rel="noopener noreferrer">
              {ImageComponent}
            </Link>
          )
        }

        return <div key={`img-${index}`}>{ImageComponent}</div>
      })}
    </div>
  )
}
