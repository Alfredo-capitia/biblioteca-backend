import { Request, Response } from 'express'
import { supabase } from '../config/supabase.js'

// Listar todos os livros
export const listarLivros = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('livros')
    .select('*')

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

// Buscar livro por ID
export const buscarLivro = async (req: Request, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('livros')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ error: 'Livro não encontrado!' })
  res.json(data)
}

// Criar livro (só admin)
export const criarLivro = async (req: Request, res: Response) => {
  const { titulo, autor, quantidade_disponivel } = req.body

  const { data, error } = await supabase
    .from('livros')
    .insert({ titulo, autor, quantidade_disponivel })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
}

//  Atualizar livro (só admin)
export const atualizarLivro = async (req: Request, res: Response) => {
  const { id } = req.params
  const { titulo, autor, quantidade_disponivel } = req.body

  const { data, error } = await supabase
    .from('livros')
    .update({ titulo, autor, quantidade_disponivel })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

// Deletar livro (só admin)
export const deletarLivro = async (req: Request, res: Response) => {
  const { id } = req.params

  const { error } = await supabase
    .from('livros')
    .delete()
    .eq('id', id)

  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Livro deletado com sucesso!' })
}