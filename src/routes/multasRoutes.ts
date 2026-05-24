import { Router } from 'express'
import {
  listarMultas,
  multasPorUsuario,
  pagarMulta,
  resumoMultas
} from '../controllers/multasController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'
import { verificarAdmin } from '../middlewares/adiminMiddleware.js'

const router = Router()

router.get('/', verificarToken, listarMultas)
router.get('/resumo', verificarToken, resumoMultas)
router.get('/usuario/:usuario_id', verificarToken, verificarAdmin, multasPorUsuario)
router.put('/:id/pagar', verificarToken, verificarAdmin, pagarMulta)

export default router