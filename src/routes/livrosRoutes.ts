import { Router } from 'express'
import {
  listarLivros,
  buscarLivro,
  criarLivro,
  atualizarLivro,
  deletarLivro
} from '../controllers/livrosController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'
import { verificarAdmin } from '../middlewares/adiminMiddleware.js'

const router = Router()

// Qualquer usuário logado pode ver
router.get('/', verificarToken, listarLivros)
router.get('/:id', verificarToken, buscarLivro)

// Só admin pode criar, editar e deletar
router.post('/', verificarToken, verificarAdmin, criarLivro)
router.put('/:id', verificarToken, verificarAdmin, atualizarLivro)
router.delete('/:id', verificarToken, verificarAdmin, deletarLivro)

export default router