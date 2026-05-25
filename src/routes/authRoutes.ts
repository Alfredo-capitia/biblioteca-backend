import { Router } from 'express'
import { registrarUsuario, registrarAdmin, login,listarUsuarios } from '../controllers/authController.js'
import { verificarAdmin } from '../middlewares/adiminMiddleware.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/registro', registrarUsuario)
router.post('/registro-admin', registrarAdmin)
router.post('/login', login)
router.get('/usuarios', verificarToken, verificarAdmin, listarUsuarios)

export default router