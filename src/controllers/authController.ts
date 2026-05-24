import { Request, Response } from 'express'
import { supabase } from '../config/supabase.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET!

// Registro de usuário comum
export const registrarUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body

  const senhaHash = await bcrypt.hash(senha, 10)

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: senha
  })

  if (authError) return res.status(400).json({ error: authError.message })

  const { error: perfilError } = await supabase
    .from('perfis')
    .insert({ id: authData.user!.id, nome, tipo: 'usuario' })

  if (perfilError) return res.status(400).json({ error: perfilError.message })

  res.json({ message: 'Usuário registrado com sucesso!' })
}

// Registro de admin (exige chave secreta)
export const registrarAdmin = async (req: Request, res: Response) => {
  const { nome, email, senha, chave_secreta } = req.body

  if (chave_secreta !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Chave secreta inválida!' })
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: senha
  })

  if (authError) return res.status(400).json({ error: authError.message })

  const { error: perfilError } = await supabase
    .from('perfis')
    .insert({ id: authData.user!.id, nome, tipo: 'admin', chave_secreta })

  if (perfilError) return res.status(400).json({ error: perfilError.message })

  res.json({ message: 'Admin registrado com sucesso!' })
}

// Login (usuário e admin)
export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  })

  if (error) return res.status(400).json({ error: 'Email ou senha inválidos!' })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', data.user.id)
    .single()

  const token = jwt.sign(
    { id: data.user.id, tipo: perfil?.tipo },
    JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({ token, tipo: perfil?.tipo, nome: perfil?.nome })
}