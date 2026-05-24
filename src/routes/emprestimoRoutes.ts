import { Router } from 'express'
import {
  listarEmprestimos,
  criarEmprestimo,
  devolverLivro
} from '../controllers/emprestimoController.ts'
import { verificarToken } from '../middlewares/authMiddleware.ts'
import { verificarAdmin } from '../middlewares/adiminMiddleware.ts'

const router = Router()

router.get('/', verificarToken, listarEmprestimos)
router.post('/', verificarToken, verificarAdmin, criarEmprestimo)
router.put('/:id/devolver', verificarToken, verificarAdmin, devolverLivro)

export default router