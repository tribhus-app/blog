import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()
const EXTRACT_PATH = '/tmp/wp-extract-all/wp-content/cache/all'

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8216;': "'",
    '&#8217;': "'",
    '&#8211;': '–',
    '&#8212;': '—',
    '&#038;': '&',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  }
  let result = text
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char)
  }
  return result
}

function extractYoutubeVideos(html: string): string[] {
  const videos: string[] = []

  // Match YouTube iframes
  const iframeRegex = /<iframe[^>]*src="[^"]*(?:youtube\.com\/embed|youtu\.be)\/([^"?]+)[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi
  let match
  while ((match = iframeRegex.exec(html)) !== null) {
    videos.push(match[1]) // Video ID
  }

  return videos
}

function cleanContentWithVideos(html: string): string {
  // First, preserve YouTube iframes by converting to a special markdown-like format
  let content = html

  // Convert YouTube iframes to markdown format before removing other HTML
  content = content.replace(
    /<iframe[^>]*src="https?:\/\/(?:www\.)?youtube\.com\/embed\/([^"?]+)[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi,
    '\n\n[youtube:$1]\n\n'
  )

  // Also handle youtu.be format
  content = content.replace(
    /<iframe[^>]*src="https?:\/\/(?:www\.)?youtu\.be\/([^"?]+)[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi,
    '\n\n[youtube:$1]\n\n'
  )

  // Now clean the rest
  content = content
    .replace(/<div[^>]*class="wp-caption[^"]*"[^>]*>/g, '')
    .replace(/<p[^>]*class="wp-caption-text"[^>]*>.*?<\/p>/g, '')
    .replace(/srcset="[^"]*"/g, '')
    .replace(/sizes="[^"]*"/g, '')
    .replace(/loading="[^"]*"/g, '')
    .replace(/width="\d+"/g, '')
    .replace(/height="\d+"/g, '')
    .replace(/class="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, '')
    .replace(/style="[^"]*"/g, '')
    .replace(/aria-describedby="[^"]*"/g, '')
    .replace(/<div[^>]*>\s*<\/div>/g, '')
    .replace(/\s+>/g, '>')
    .replace(/>\s+</g, '><')

  // Convert headers
  content = content
    .replace(/<h2>/g, '\n## ')
    .replace(/<\/h2>/g, '\n')
    .replace(/<h3>/g, '\n### ')
    .replace(/<\/h3>/g, '\n')
    .replace(/<h4>/g, '\n#### ')
    .replace(/<\/h4>/g, '\n')

  // Convert paragraphs
  content = content
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '\n')

  // Convert lists
  content = content
    .replace(/<ul>/g, '\n')
    .replace(/<\/ul>/g, '\n')
    .replace(/<ol>/g, '\n')
    .replace(/<\/ol>/g, '\n')
    .replace(/<li>/g, '- ')
    .replace(/<\/li>/g, '\n')

  // Convert bold and italic
  content = content
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<b>/g, '**')
    .replace(/<\/b>/g, '**')
    .replace(/<em>/g, '*')
    .replace(/<\/em>/g, '*')
    .replace(/<i>/g, '*')
    .replace(/<\/i>/g, '*')

  // Convert blockquotes
  content = content
    .replace(/<blockquote>/g, '\n> ')
    .replace(/<\/blockquote>/g, '\n')

  // Convert line breaks
  content = content
    .replace(/<br\s*\/?>/g, '\n')

  // Keep images but clean them up
  content = content.replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g, '![$2]($1)')
  content = content.replace(/<img[^>]*src="([^"]+)"[^>]*>/g, '![]($1)')

  // Remove remaining HTML tags (except our youtube markers)
  content = content.replace(/<(?!\/?(youtube))[^>]+>/g, '')

  // Convert youtube markers back to proper HTML embeds for the frontend
  content = content.replace(
    /\[youtube:([^\]]+)\]/g,
    '<div class="video-container"><iframe width="100%" height="400" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>'
  )

  // Clean up whitespace
  content = content
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return content
}

async function findWpContent(slug: string): Promise<{ html: string; category: string } | null> {
  const categories = ['bandas', 'noticias', 'cultura', 'aprenda-com-a-tribhus']

  for (const category of categories) {
    const indexPath = path.join(EXTRACT_PATH, category, slug, 'index.html')
    if (fs.existsSync(indexPath)) {
      return {
        html: fs.readFileSync(indexPath, 'utf-8'),
        category
      }
    }
  }

  return null
}

async function fixVideosInPosts() {
  console.log('='.repeat(60))
  console.log('Fixing YouTube Videos in Posts')
  console.log('='.repeat(60))

  // Get all posts from database
  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, title: true, content: true }
  })

  console.log(`Found ${posts.length} posts in database`)

  let updated = 0
  let withVideos = 0

  for (const post of posts) {
    // Find original WordPress content
    const wpData = await findWpContent(post.slug)
    if (!wpData) {
      console.log(`  [SKIP] No WP content found for: ${post.slug}`)
      continue
    }

    // Check if original has videos
    const videos = extractYoutubeVideos(wpData.html)
    if (videos.length === 0) {
      continue // No videos in original
    }

    withVideos++
    console.log(`  [VIDEO] ${post.title.substring(0, 40)}... has ${videos.length} video(s)`)

    // Extract content from entry-content div
    const contentMatch = wpData.html.match(/<div class="entry-content">([\s\S]*?)<\/div>\s*<div class="clear">/)
    if (!contentMatch) {
      console.log(`    [ERROR] Could not extract content`)
      continue
    }

    // Re-process content preserving videos
    let newContent = cleanContentWithVideos(contentMatch[1])
    newContent = decodeHtmlEntities(newContent)

    // Update post in database
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: newContent }
    })

    console.log(`    [OK] Updated with videos`)
    updated++
  }

  console.log('\n' + '='.repeat(60))
  console.log(`Posts with videos found: ${withVideos}`)
  console.log(`Posts updated: ${updated}`)
  console.log('='.repeat(60))
}

fixVideosInPosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
