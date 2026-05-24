import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import LivrosRoutes from './routes/livrosRoutes.js'
import emprestimoRoutes from './routes/emprestimoRoutes.js'
import multasRoutes from './routes/multasRoutes.js'
import carteiraRoutes from './routes/carteiraRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Rotas
app.use('/auth', authRoutes)
app.use('/livros', LivrosRoutes)
app.use('/emprestimos', emprestimoRoutes)
app.use('/multas', multasRoutes)
app.use('/carteira', carteiraRoutes)

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})