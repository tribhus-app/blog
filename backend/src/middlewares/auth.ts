import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'

interface JwtPayload {
  userId: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        isAdmin: boolean
      }
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token nao fornecido' })
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET || 'tribhus-blog-secret'

    const decoded = jwt.verify(token, secret) as JwtPayload

    const user = await prisma.blogAuthor.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, isAdmin: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Usuario nao encontrado' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin ?? false,
    }
    next()
  } catch (error) {
    console.error('Erro de autenticacao:', error)
    return res.status(401).json({ error: 'Token invalido' })
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
  }
  next()
}

// Alias para compatibilidade
export const adminOnly = adminMiddleware
