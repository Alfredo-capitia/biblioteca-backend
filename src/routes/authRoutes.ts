import { Router } from 'express'
import { registrarUsuario, registrarAdmin, login } from '../controllers/authController.js'

const router = Router()

router.post('/registro', registrarUsuario)
router.post('/registro-admin', registrarAdmin)
router.post('/login', login)

export default router