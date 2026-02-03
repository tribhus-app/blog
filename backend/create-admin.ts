import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Tribhus@2024', 10)
  
  const admin = await prisma.blogAuthor.upsert({
    where: { email: 'admin@tribhus.com.br' },
    update: {
      password: hashedPassword,
      isAdmin: true,
    },
    create: {
      name: 'Admin Tribhus',
      slug: 'admin-tribhus',
      email: 'admin@tribhus.com.br',
      password: hashedPassword,
      bio: 'Administrador do Tribhus Blog',
      isAdmin: true,
      isAi: false,
    },
  })
  
  console.log('Admin criado/atualizado:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
