import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import slugify from 'slugify'
import { uploadImage } from '../services/minio'

const prisma = new PrismaClient()

// Category mapping from old WordPress to new blog
const CATEGORY_MAP: Record<string, string> = {
  'bandas': '1110ba3a-3605-445e-9f76-9914a0e4fefe',
  'noticias': '43c4f9bd-9012-4f5c-9874-12e86916369c',
  'cultura': '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a', // Curiosidades
  'aprenda-com-a-tribhus': '1aef0f7e-20ec-44a0-b2f2-3c1e645d232a', // Curiosidades
}

const AUTHOR_ID = 'f0951ac2-8f21-433e-98ba-d4a14a832fc3' // Tribhus
const UPLOADS_PATH = '/opt/tribhus_blog/blog tribhus/uploads'
const EXTRACT_PATH = '/tmp/wp-extract-all/wp-content/cache/all'

interface ParsedPost {
  title: string
  slug: string
  content: string
  excerpt: string
  date: Date
  category: string
  tags: string[]
  featuredImage: string | null
  images: string[]
}

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

function extractFromHtml(html: string, category: string): ParsedPost | null {
  try {
    // Extract title
    const titleMatch = html.match(/<h1[^>]*class="post-title[^"]*"[^>]*>([^<]+)<\/h1>/)
    if (!titleMatch) return null
    const title = decodeHtmlEntities(titleMatch[1].trim())

    // Extract date
    const dateMatch = html.match(/<time[^>]*datetime="([^"]+)"/)
    const date = dateMatch ? new Date(dateMatch[1]) : new Date()

    // Extract featured image
    const featuredMatch = html.match(/data-style="background-image:\s*url\(([^)]+)\)/)
    let featuredImage = featuredMatch ? featuredMatch[1] : null

    // Extract content from entry-content div
    const contentMatch = html.match(/<div class="entry-content">([\s\S]*?)<\/div>\s*<div class="clear">/)
    if (!contentMatch) return null

    let content = contentMatch[1]

    // Find all images in content
    const imageMatches = content.match(/src="(https:\/\/blog\.tribhus\.com[^"]+)"/g) || []
    const images = imageMatches.map(m => m.replace('src="', '').replace('"', ''))

    // Extract tags from article classes
    const tagsMatch = html.match(/class="[^"]*post-\d+[^"]*tag-([^"]+)"/)
    let tags: string[] = []
    if (tagsMatch) {
      const tagClasses = html.match(/tag-([a-z0-9-]+)/g) || []
      tags = tagClasses.map(t => t.replace('tag-', '').replace(/-/g, ' '))
    }

    // Clean content - convert to markdown-like format
    content = cleanContent(content)
    content = decodeHtmlEntities(content)

    // Generate excerpt
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const excerpt = plainText.substring(0, 250) + (plainText.length > 250 ? '...' : '')

    // Generate slug
    const slug = slugify(title, { lower: true, strict: true })

    return {
      title,
      slug,
      content,
      excerpt,
      date,
      category,
      tags,
      featuredImage,
      images,
    }
  } catch (error) {
    console.error('Error parsing HTML:', error)
    return null
  }
}

function cleanContent(html: string): string {
  // Remove WordPress specific elements
  let content = html
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

  // Remove remaining HTML tags
  content = content.replace(/<[^>]+>/g, '')

  // Clean up whitespace
  content = content
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return content
}

async function findLocalImage(wpUrl: string): Promise<string | null> {
  // Convert WordPress URL to local path
  // Example: https://blog.tribhus.com/wp-content/uploads/2022/10/Liferika.jpg
  // -> /opt/tribhus_blog/blog tribhus/uploads/2022/10/Liferika.jpg

  const match = wpUrl.match(/\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^"?\s]+)/)
  if (!match) return null

  const [, year, month, filename] = match

  // Try to find the original image (without size suffix)
  const baseName = filename.replace(/-\d+x\d+(\.[^.]+)$/, '$1')
  const localPath = path.join(UPLOADS_PATH, year, month, baseName)

  if (fs.existsSync(localPath)) {
    return localPath
  }

  // Try the exact filename
  const exactPath = path.join(UPLOADS_PATH, year, month, filename)
  if (fs.existsSync(exactPath)) {
    return exactPath
  }

  return null
}

async function uploadLocalImage(localPath: string): Promise<string | null> {
  try {
    const buffer = fs.readFileSync(localPath)
    const filename = path.basename(localPath)
    const ext = path.extname(localPath).toLowerCase()

    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }

    const contentType = contentTypeMap[ext] || 'image/jpeg'
    const result = await uploadImage(buffer, filename, contentType)
    return result.url
  } catch (error) {
    console.error(`Failed to upload image ${localPath}:`, error)
    return null
  }
}

async function createTags(tagNames: string[]): Promise<string[]> {
  const tagIds: string[] = []

  for (const name of tagNames) {
    if (!name || name.length < 2) continue

    const slug = slugify(name, { lower: true, strict: true })
    if (!slug) continue

    try {
      const tag = await prisma.blogTag.upsert({
        where: { slug },
        update: {},
        create: { name: name.charAt(0).toUpperCase() + name.slice(1), slug },
      })
      tagIds.push(tag.id)
    } catch (error) {
      // Ignore duplicate errors
    }
  }

  return tagIds
}

async function migratePost(post: ParsedPost, dryRun: boolean = false): Promise<boolean> {
  try {
    // Check if post already exists
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log(`  [SKIP] Already exists: ${post.title.substring(0, 50)}...`)
      return false
    }

    // Process featured image
    let coverImage: string | null = null
    if (post.featuredImage) {
      const localPath = await findLocalImage(post.featuredImage)
      if (localPath && !dryRun) {
        coverImage = await uploadLocalImage(localPath)
        if (coverImage) {
          console.log(`  [IMG] Uploaded cover: ${path.basename(localPath)}`)
        }
      }
    }

    // Process content images
    let content = post.content
    for (const imgUrl of post.images) {
      const localPath = await findLocalImage(imgUrl)
      if (localPath && !dryRun) {
        const newUrl = await uploadLocalImage(localPath)
        if (newUrl) {
          content = content.replace(imgUrl, newUrl)
          console.log(`  [IMG] Uploaded: ${path.basename(localPath)}`)
        }
      }
    }

    if (dryRun) {
      console.log(`  [DRY] Would create: ${post.title}`)
      console.log(`        Date: ${post.date.toISOString()}`)
      console.log(`        Category: ${post.category}`)
      console.log(`        Tags: ${post.tags.join(', ')}`)
      return true
    }

    // Get category ID
    const categoryId = CATEGORY_MAP[post.category]
    if (!categoryId) {
      console.log(`  [SKIP] Unknown category: ${post.category}`)
      return false
    }

    // Create tags
    const tagIds = await createTags(post.tags)

    // Create post
    const newPost = await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: content,
        coverImage,
        categoryId,
        authorId: AUTHOR_ID,
        status: 'published',
        featured: false,
        publishedAt: post.date,
        metaTitle: post.title.substring(0, 60),
        metaDescription: post.excerpt.substring(0, 160),
        views: Math.floor(Math.random() * 500) + 50, // Random views for variety
      },
    })

    // Connect tags
    for (const tagId of tagIds) {
      await prisma.blogPostTag.create({
        data: {
          postId: newPost.id,
          tagId,
        },
      })
    }

    console.log(`  [OK] Created: ${post.title.substring(0, 50)}... (${post.date.toLocaleDateString('pt-BR')})`)
    return true
  } catch (error) {
    console.error(`  [ERROR] ${post.title}:`, error)
    return false
  }
}

async function migrate(limit?: number, dryRun: boolean = false) {
  console.log('='.repeat(60))
  console.log('WordPress to Tribhus Blog Migration')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  if (limit) console.log(`Limit: ${limit} posts`)
  console.log('')

  const categories = ['bandas', 'noticias', 'cultura', 'aprenda-com-a-tribhus']
  let totalProcessed = 0
  let totalCreated = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const category of categories) {
    const categoryPath = path.join(EXTRACT_PATH, category)
    if (!fs.existsSync(categoryPath)) {
      console.log(`Category folder not found: ${category}`)
      continue
    }

    console.log(`\n[${ category.toUpperCase() }]`)
    console.log('-'.repeat(40))

    const slugs = fs.readdirSync(categoryPath)

    for (const slug of slugs) {
      if (limit && totalProcessed >= limit) break

      const indexPath = path.join(categoryPath, slug, 'index.html')
      if (!fs.existsSync(indexPath)) continue

      // Skip amp and feed folders
      if (slug === 'amp' || slug === 'feed' || slug === 'page') continue

      const html = fs.readFileSync(indexPath, 'utf-8')
      const post = extractFromHtml(html, category)

      if (!post) {
        console.log(`  [SKIP] Could not parse: ${slug}`)
        totalSkipped++
        continue
      }

      const success = await migratePost(post, dryRun)
      totalProcessed++

      if (success) {
        totalCreated++
      } else {
        totalSkipped++
      }
    }

    if (limit && totalProcessed >= limit) break
  }

  console.log('\n' + '='.repeat(60))
  console.log('Migration Complete')
  console.log('='.repeat(60))
  console.log(`Total Processed: ${totalProcessed}`)
  console.log(`Created: ${totalCreated}`)
  console.log(`Skipped: ${totalSkipped}`)
  console.log(`Errors: ${totalErrors}`)
}

// Parse command line arguments
const args = process.argv.slice(2)
const limit = args.find(a => a.startsWith('--limit='))?.split('=')[1]
const dryRun = args.includes('--dry-run')

migrate(limit ? parseInt(limit) : undefined, dryRun)
  .catch(console.error)
  .finally(() => prisma.$disconnect())
