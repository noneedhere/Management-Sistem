import express from 'express'
import {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
} from '../controllers/user_controller.js'
import { authorize } from '../controllers/auth_controller.js'
import { IsAdmin } from '../middleware/role_validation.js'

const app = express.Router()

app.get('/getAll', getAllUsers)
app.get('/getBy/:id', getUserById)
app.post('/add', addUser)
app.put('/update/:id', authorize, [IsAdmin], updateUser)
app.delete('/delete/:id', authorize, [IsAdmin], deleteUser)
app.post('/login', authorize)

export default app
