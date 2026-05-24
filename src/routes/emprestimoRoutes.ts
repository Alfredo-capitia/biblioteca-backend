import { Router } from 'express'
import {
  listarEmprestimos,
  criarEmprestimo,
  devolverLivro
} from '../controllers/emprestimoController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'
import { verificarAdmin } from '../middlewares/adiminMiddleware.js'

const router = Router()

router.get('/', verificarToken, listarEmprestimos)
router.post('/', verificarToken, verificarAdmin, criarEmprestimo)
router.put('/:id/devolver', verificarToken, verificarAdmin, devolverLivro)

export default router