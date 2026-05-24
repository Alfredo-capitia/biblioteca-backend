import { Request, Response } from 'express'
import { supabase } from '../config/supabase.js'

// Listar todos os empréstimos (admin vê todos, usuário vê só os seus)
export const listarEmprestimos = async (req: any, res: Response) => {
  const { id, tipo } = req.usuario

  let query = supabase
    .from('emprestimos')
    .select(`
      *,
      livros(titulo, autor),
      perfis(nome, email)
    `)

  if (tipo !== 'admin') {
    query = query.eq('usuario_id', id)
  }

  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

//  Criar empréstimo (só admin)
export const criarEmprestimo = async (req: any, res: Response) => {
  const { usuario_id, livro_id, dias_prazo } = req.body

  // Verifica se livro tem quantidade disponível
  const { data: livro, error: livroError } = await supabase
    .from('livros')
    .select('quantidade_disponivel')
    .eq('id', livro_id)
    .single()

  if (livroError || !livro) {
    return res.status(404).json({ error: 'Livro não encontrado!' })
  }

  if (livro.quantidade_disponivel <= 0) {
    return res.status(400).json({ error: 'Livro sem exemplares disponíveis!' })
  }

  // Calcula data de devolução prevista
  const data_devolucao_prevista = new Date()
  data_devolucao_prevista.setDate(data_devolucao_prevista.getDate() + (dias_prazo || 7))

  // Cria o empréstimo
  const { data, error } = await supabase
    .from('emprestimos')
    .insert({ usuario_id, livro_id, data_devolucao_prevista })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  // Diminui quantidade disponível
  await supabase
    .from('livros')
    .update({ quantidade_disponivel: livro.quantidade_disponivel - 1 })
    .eq('id', livro_id)

  res.status(201).json(data)
}

// Devolver livro (só admin) — calcula multa automaticamente
export const devolverLivro = async (req: any, res: Response) => {
  const { id } = req.params

  const { data: emprestimo, error } = await supabase
    .from('emprestimos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !emprestimo) {
    return res.status(404).json({ error: 'Empréstimo não encontrado!' })
  }

  const hoje = new Date()
  const prevista = new Date(emprestimo.data_devolucao_prevista)
  const diasAtraso = Math.floor(
    (hoje.getTime() - prevista.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Atualiza empréstimo como devolvido
  await supabase
    .from('emprestimos')
    .update({ status: 'devolvido', data_devolucao_real: hoje })
    .eq('id', id)

  // Devolve quantidade ao livro
  const { data: livro } = await supabase
    .from('livros')
    .select('quantidade_disponivel')
    .eq('id', emprestimo.livro_id)
    .single()

  await supabase
    .from('livros')
    .update({ quantidade_disponivel: (livro?.quantidade_disponivel || 0) + 1 })
    .eq('id', emprestimo.livro_id)

  // Gera multa se houver atraso (2$ por dia)
  if (diasAtraso > 0) {
    const valor = diasAtraso * 2

    await supabase
      .from('multas')
      .insert({
        emprestimo_id: id,
        usuario_id: emprestimo.usuario_id,
        valor,
        dias_atraso: diasAtraso
      })

    return res.json({
      message: 'Livro devolvido com atraso!',
      dias_atraso: diasAtraso,
      multa_gerada: `$${valor}`
    })
  }

  res.json({ message: 'Livro devolvido no prazo! Sem multa.' })
}