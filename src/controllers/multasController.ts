import { Request, Response } from 'express'
import { supabase } from '../config/supabase.js'

//  Listar multas (admin vê todas, usuário vê só as suas)
export const listarMultas = async (req: any, res: Response) => {
  const { id, tipo } = req.usuario

  let query = supabase
    .from('multas')
    .select(`
      *,
      perfis(nome, email),
      emprestimos(
        data_emprestimo,
        data_devolucao_prevista,
        data_devolucao_real,
        livros(titulo, autor)
      )
    `)

  if (tipo !== 'admin') {
    query = query.eq('usuario_id', id)
  }

  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

//  Buscar multas de um usuário específico (só admin)
export const multasPorUsuario = async (req: Request, res: Response) => {
  const { usuario_id } = req.params

  const { data, error } = await supabase
    .from('multas')
    .select(`
      *,
      emprestimos(
        data_emprestimo,
        data_devolucao_prevista,
        livros(titulo, autor)
      )
    `)
    .eq('usuario_id', usuario_id)

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

// Pagar multa (só admin)
export const pagarMulta = async (req: Request, res: Response) => {
  const { id } = req.params

  const { data: multa } = await supabase
    .from('multas')
    .select('*')
    .eq('id', id)
    .single()

  if (!multa) return res.status(404).json({ error: 'Multa não encontrada!' })
  if (multa.pago) return res.status(400).json({ error: 'Multa já foi paga!' })

  const { data, error } = await supabase
    .from('multas')
    .update({ pago: true })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Multa paga com sucesso!', multa: data })
}

// Resumo de multas do usuário logado
export const resumoMultas = async (req: any, res: Response) => {
  const { id } = req.usuario

  const { data, error } = await supabase
    .from('multas')
    .select('*')
    .eq('usuario_id', id)

  if (error) return res.status(400).json({ error: error.message })

  const totalDevido = data
    .filter(m => !m.pago)
    .reduce((acc, m) => acc + m.valor, 0)

  const totalPago = data
    .filter(m => m.pago)
    .reduce((acc, m) => acc + m.valor, 0)

  res.json({
    total_multas: data.length,
    multas_pendentes: data.filter(m => !m.pago).length,
    total_devido: `$${totalDevido.toFixed(2)}`,
    total_pago: `$${totalPago.toFixed(2)}`
  })
}