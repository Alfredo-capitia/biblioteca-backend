import { Response, NextFunction } from 'express'

export const verificarAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.usuario?.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores!' })
  }
  next()
}