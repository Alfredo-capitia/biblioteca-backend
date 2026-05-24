      import { Router } from 'express'
import {
  verSaldo,
  depositar,
  verHistorico
} from '../controllers/carteiraController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'
import { verificarAdmin } from '../middlewares/adiminMiddleware.js'

const router = Router()

router.get('/saldo', verificarToken, verSaldo)
router.post('/depositar', verificarToken, verificarAdmin, depositar)
router.get('/historico', verificarToken, verHistorico)
router.get('/historico/:usuario_id', verificarToken, verificarAdmin, verHistorico)

export default router