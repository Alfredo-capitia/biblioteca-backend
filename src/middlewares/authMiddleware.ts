import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const verificarToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Token não fornecido!' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req.usuario = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido!' })
  }
}