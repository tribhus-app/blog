import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha sao obrigatorios' })
    }

    const user = await prisma.blogAuthor.findUnique({ where: { email } })

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Credenciais invalidas' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais invalidas' })
    }

    const secret = process.env.JWT_SECRET || 'tribhus-blog-secret'
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro no login' })
  }
})

// Verificar token
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

// Alterar senha
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senhas sao obrigatorias' })
    }

    const user = await prisma.blogAuthor.findUnique({
      where: { id: req.user!.id },
    })

    if (!user || !user.password) {
      return res.status(400).json({ error: 'Usuario nao encontrado' })
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.blogAuthor.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    res.json({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    res.status(500).json({ error: 'Erro ao alterar senha' })
  }
})

export default router
