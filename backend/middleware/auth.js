import jwt from 'jsonwebtoken'

// Middleware untuk otorisasi
export const authorize = (req, res, next) => {
  try {
    // Ambil header Authorization
    const authHeader = req.headers.authorization

    // Cek apakah token ada dan valid
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized access. Token missing or malformed.',
      })
    }

    // Ambil token dari header
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized access. Token not provided.',
      })
    }

    // Verifikasi token dengan SECRET_KEY dari environment variables
    const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key' // Ganti sesuai konfigurasi
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        // Tangani error verifikasi token
        return res.status(401).json({
          status: 'error',
          message: err.name === 'TokenExpiredError'
            ? 'Token has expired. Please login again.'
            : 'Invalid or expired token.',
        })
      }

      // Simpan informasi pengguna ke dalam request untuk digunakan di endpoint berikutnya
      req.user = decoded

      // Lanjutkan ke handler berikutnya
      next()
    })
  } catch (error) {
    // Tangani error yang tidak terduga
    console.error('Authorization Middleware Error:', error.message)
    res.status(500).json({
      status: 'error',
      message: 'Internal server error.',
    })
  }
}
