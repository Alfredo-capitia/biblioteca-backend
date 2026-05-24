import { Request, Response } from 'express'
import { supabase } from '../config/supabase.js'

//  Listar todos os empréstimos (admin vê todos, usuário vê só os seus)
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

// Criar empréstimo (só admin)
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

  // Verifica saldo mínimo na carteira
  const { data: carteira } = await supabase
    .from('carteiras')
    .select('saldo')
    .eq('usuario_id', usuario_id)
    .single()

  if (!carteira || carteira.saldo < 10) {
    return res.status(400).json({
      error: 'Saldo insuficiente! Mínimo de $10 necessário para emprestar.',
      saldo_atual: `$${(carteira?.saldo || 0).toFixed(2)}`
    })
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

  res.status(201).json({
    message: 'Empréstimo criado com sucesso!',
    emprestimo: data,
    data_devolucao_prevista
  })
}

//  Devolver livro (só admin)
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

  if (emprestimo.status === 'devolvido') {
    return res.status(400).json({ error: 'Este livro já foi devolvido!' })
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

  // Se houver atraso: debita da carteira + registra transação + cria multa
  if (diasAtraso > 0) {
    const valor = diasAtraso * 2

    const { data: carteira } = await supabase
      .from('carteiras')
      .select('saldo')
      .eq('usuario_id', emprestimo.usuario_id)
      .single()

    const novoSaldo = Math.max(0, (carteira?.saldo || 0) - valor)

    await supabase
      .from('carteiras')
      .update({ saldo: novoSaldo, updated_at: new Date() })
      .eq('usuario_id', emprestimo.usuario_id)

    await supabase
      .from('transacoes')
      .insert({
        usuario_id: emprestimo.usuario_id,
        tipo: 'multa',
        valor,
        descricao: `Multa por ${diasAtraso} dia(s) de atraso`
      })

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
      multa_debitada: `$${valor.toFixed(2)}`,
      saldo_restante: `$${novoSaldo.toFixed(2)}`
    })
  }

  // Sem atraso
  res.json({ message: 'Livro devolvido no prazo! Sem multa.' })
}