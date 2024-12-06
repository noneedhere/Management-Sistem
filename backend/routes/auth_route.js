import express from 'express'
import { authenticate, authorize, refreshToken } from '../controllers/auth_controller.js'

const app = express.Router()


app.post('/login', authenticate)
app.post("/refresh", refreshToken)

export default app
