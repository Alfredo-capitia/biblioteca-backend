import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import livrosRoutes from './routes/livrosRoutes'
import emprestimosRoutes from './routes/emprestimoRoutes'
import multasRoutes from './routes/multasRoutes'
import carteiraRoutes from './routes/carteiraRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//  Rota raiz
app.get('/', (req, res) => {
  res.json({ message: ' API Biblioteca funcionando!', status: 'online' })
})

app.use('/auth', authRoutes)
app.use('/livros', livrosRoutes)
app.use('/emprestimos', emprestimosRoutes)
app.use('/multas', multasRoutes)
app.use('/carteira', carteiraRoutes)

app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`)
})