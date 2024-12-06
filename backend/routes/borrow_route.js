import express from "express"
import {
  getAllBorrowRecords,
  getBorrowRecordById,
  updateBorrowRecord,
  deleteBorrowRecord,
  borrowItem,
  returnItem,
  getUsageReport,
  getBorrowAnalysis,
} from "../controllers/borrow_controller.js"
import { authorize } from "../controllers/auth_controller.js"
import { IsAdmin } from "../middleware/role_validation.js"

const app = express.Router()

// Routes

app.get("/getAll", authorize, getAllBorrowRecords) 
app.get("/getBy:id", authorize, getBorrowRecordById)
app.post("/borrowItem", authorize, borrowItem)
app.post("/returnItem", authorize, returnItem)
app.put("/updateBorrow:id", authorize, IsAdmin, updateBorrowRecord)
app.delete("/deleteBorrow:id", authorize, IsAdmin, deleteBorrowRecord)

// untuk report no 4
app.post("/usageReport", getUsageReport),
app.post("/borrowAnalysis", getBorrowAnalysis)


export default app
