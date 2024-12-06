import express from 'express'
import {
  getAllInventory,
  getInventoryById,
  addInventory,
  updateInventory,
  deleteInventory,
} from '../controllers/inventory_controller.js'
import { authorize } from '../controllers/auth_controller.js'
import { IsAdmin } from '../middleware/role_validation.js'

const app = express.Router()

app.get('/getAll', getAllInventory);
app.get('/getBy/:inventoryId', getInventoryById);
app.post('/add', authorize, [IsAdmin], addInventory);
app.put('/update/:inventoryId', authorize, [IsAdmin], updateInventory);
app.delete('/delete/:inventoryId', authorize, [IsAdmin], deleteInventory);

export default app
