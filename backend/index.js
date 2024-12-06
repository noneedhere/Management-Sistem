import express from 'express'
import dotenv from 'dotenv'
import bodyParser from "body-parser"
import userRoute from './routes/user_route.js'
import authRoute from "./routes/auth_route.js"
import inventoryRoute from './routes/inventory_route.js'
import borrowRoute from './routes/borrow_route.js'

const app = express()
dotenv.config()
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use('/api/user', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/inventory', inventoryRoute)
app.use('/api/borrowRecord', borrowRoute)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
