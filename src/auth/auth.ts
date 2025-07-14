import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
const JWT_SECRET = 'tu_secreto'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: 'No autorizado' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    // @ts-ignore
    req.user = decoded
    next()
  } catch {
    res.status(403).json({ message: 'Token inválido' })
  }
}
