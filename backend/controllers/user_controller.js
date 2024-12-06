import { PrismaClient } from '@prisma/client'
import md5 from 'md5'

const prisma = new PrismaClient()

/**
 * Get all users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        role: true, // Exclude password for security reasons
      },
    })
    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message,
    })
  }
}

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required.',
    })
  }
  try {
    const user = await prisma.user.findUnique({
      where: { userId: Number(id) },
      select: {
        userId: true,
        username: true,
        role: true, // Exclude password for security reasons
      },
    })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user.',
      error: error.message,
    })
  }
}

/**
 * Add a new user
 */
export const addUser = async (req, res) => {
  const { username, password, role } = req.body

  try {
    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { username }, // Karena username sudah unique
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      })
    }

    // Hash password sebelum disimpan
    const hashedPassword = md5(password)

    // Tambah user baru
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
      select: {
        userId: true, // Tambahkan ID pengguna
        username: true,
        role: true,
      },
    })

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    })
  }
}

/**
 * Update user by ID
 */
export const updateUser = async (req, res) => {
  const { id } = req.params
  const { username, password, role } = req.body

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required.',
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId: Number(id) },
    })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const updatedUser = await prisma.user.update({
      where: { userId: Number(id) },
      data: {
        username: username || user.username,
        password: password ? md5(password) : user.password, // Hash new password if provided
        role: role || user.role,
      },
      select: {
        userId: true,
        username: true,
        role: true,
      },
    })

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updatedUser,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Failed to update user.',
      error: error.message,
    })
  }
}

/**
 * Delete user by ID
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = Number(id);

  if (!id || isNaN(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid User ID.',
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    await prisma.user.delete({ where: { userId } });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
      error: error.message,
    });
  }
};

