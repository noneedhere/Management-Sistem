import md5 from "md5"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

dotenv.config() // Load environment variables

const prisma = new PrismaClient()
const SECRET_KEY = process.env.JWT_SECRET // Ambil SECRET_KEY dari .env

// Fungsi untuk membuat token JWT
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.userId,
      username: user.username,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "1h" } // Token berlaku selama 1 jam
  )
}

// Login user dan menghasilkan token
export const authenticate = async (req, res) => {
  const { username, password } = req.body

  try {
    // Cari user berdasarkan username
    const user = await prisma.user.findFirst({
      where: { username },
    })

    // Validasi user dan password
    if (!user || user.password !== md5(password)) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password.",
      })
    }

    // Buat token JWT
    const token = generateToken(user)

    // Kirim respons
    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Login failed",
      error: error.message,
    })
  }
}

// Middleware otorisasi
export const authorize = async (req, res, next) => {
  const authHeader = req.headers["authorization"]

  if (!authHeader) {
    return res.status(403).json({
      success: false,
      auth: false,
      message: "Access denied. No token provided.",
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    const verifiedUser = jwt.verify(token, SECRET_KEY) // Verifikasi token
    req.user = verifiedUser // Simpan data user dari token ke req
    next() // Lanjutkan ke handler berikutnya
  } catch (error) {
    return res.status(401).json({
      success: false,
      auth: false,
      message: "Invalid or expired token.",
    })
  }
}

// Fungsi untuk refresh token
export const refreshToken = async (req, res) => {
  try {
    const oldToken = req.body.token

    if (!oldToken) {
      return res.status(400).json({
        success: false,
        message: "No token provided.",
      })
    }

    try {
      const payload = jwt.verify(oldToken, SECRET_KEY) // Verifikasi token lama
      const user = {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
      }

      // Buat token baru
      const newToken = generateToken(user)

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully.",
        token: newToken,
      })
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to refresh token.",
    })
  }
}
