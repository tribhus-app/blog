import cron from 'node-cron'
import { prisma } from '../../utils/prisma'

const TIMEZONE = process.env.CRON_TIMEZONE || 'America/Sao_Paulo'

let job: cron.ScheduledTask | null = null
let isPublishing = false

export async function publishDueScheduledPosts(): Promise<number> {
  if (isPublishing) return 0

  isPublishing = true
  try {
    const now = new Date()
    const result = await prisma.blogPost.updateMany({
      where: {
        status: 'scheduled',
        scheduledAt: { lte: now },
      },
      data: {
        status: 'published',
        publishedAt: now,
      },
    })

    if (result.count > 0) {
      console.log(`Posts agendados publicados: ${result.count}`)
    }

    return result.count
  } catch (error) {
    console.error('Erro ao publicar posts agendados:', error)
    return 0
  } finally {
    isPublishing = false
  }
}

export function startScheduledPostsPublisher(): void {
  if (job) return

  void publishDueScheduledPosts()

  job = cron.schedule(
    '* * * * *',
    () => {
      void publishDueScheduledPosts()
    },
    {
      scheduled: true,
      timezone: TIMEZONE,
    }
  )

  console.log(`Publicador de posts agendados ativo (${TIMEZONE})`)
}
