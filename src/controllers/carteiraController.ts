import { Request, Response } from 'express'
import { supabase } from '../config/supabase.js'

const SALDO_MINIMO = 10.00 // saldo mínimo para emprestar

//  Ver saldo da carteira
export const verSaldo = async (req: any, res: Response) => {
  const { id } = req.usuario

  const { data, error } = await supabase
    .from('carteiras')
    .select('*')
    .eq('usuario_id', id)
    .single()

  if (error) return res.status(404).json({ error: 'Carteira não encontrada!' })
  res.json(data)
}

// Depositar saldo (só admin)
export const depositar = async (req: Request, res: Response) => {
  const { usuario_id, valor, descricao } = req.body

  if (valor <= 0) {
    return res.status(400).json({ error: 'Valor inválido!' })
  }

  // Busca carteira atual
  const { data: carteira } = await supabase
    .from('carteiras')
    .select('*')
    .eq('usuario_id', usuario_id)
    .single()

  if (!carteira) {
    return res.status(404).json({ error: 'Carteira não encontrada!' })
  }

  // Atualiza saldo
  const novoSaldo = carteira.saldo + valor

  await supabase
    .from('carteiras')
    .update({ saldo: novoSaldo, updated_at: new Date() })
    .eq('usuario_id', usuario_id)

  // Registra transação
  await supabase
    .from('transacoes')
    .insert({
      usuario_id,
      tipo: 'deposito',
      valor,
      descricao: descricao || 'Depósito realizado pelo admin'
    })

  res.json({
    message: 'Depósito realizado com sucesso!',
    saldo_anterior: `$${carteira.saldo.toFixed(2)}`,
    saldo_atual: `$${novoSaldo.toFixed(2)}`
  })
}

// Ver histórico de transações
export const verHistorico = async (req: any, res: Response) => {
  const { id, tipo } = req.usuario
  const { usuario_id } = req.params

  // Admin pode ver de qualquer usuário
  const targetId = tipo === 'admin' && usuario_id ? usuario_id : id

  const { data, error } = await supabase
    .from('transacoes')
    .select('*')
    .eq('usuario_id', targetId)
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}