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

/* Le o token do painel sem barrar quem nao tem: para as rotas publicas que
   mostram um pouco mais ao administrador (o e-mail dos autores, os rascunhos
   na lista). Token ausente, invalido ou de quem nao e admin: false. */
export async function pedidoDeAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  try {
    const secret = process.env.JWT_SECRET || 'tribhus-blog-secret'
    const decoded = jwt.verify(authHeader.split(' ')[1], secret) as JwtPayload
    const user = await prisma.blogAuthor.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true },
    })
    return user?.isAdmin ?? false
  } catch {
    return false
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
