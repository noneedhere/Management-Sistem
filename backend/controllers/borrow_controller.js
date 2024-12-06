import { PrismaClient } from "@prisma/client"
import { request } from "express"

const prisma = new PrismaClient()

/**
 * Get all borrow records, including user and inventory details
 */
export const getAllBorrowRecords = async (req, res) => {
  try {
    const borrowRecords = await prisma.borrowRecord.findMany({
      include: {
        user: { select: { username: true, role: true } },
        inventory: { select: { name: true, category: true, location: true } },
      },
    })

    res.status(200).json({
      status: "success",
      message: "Borrow records retrieved successfully",
      data: borrowRecords,
    })
  } catch (error) {
    console.error("Error fetching borrow records:", error)
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve borrow records",
      error: error.message,
    })
  }
}

/**
 * Get a specific borrow record by ID
 */
export const getBorrowRecordById = async (req, res) => {
  try {
    const { id } = req.params

    const borrowRecord = await prisma.borrowRecord.findUnique({
      where: { borrowId: parseInt(id, 10) },
      include: {
        user: { select: { username: true, role: true } },
        inventory: { select: { name: true, category: true, location: true } },
      },
    })

    if (!borrowRecord) {
      return res.status(404).json({
        status: "error",
        message: "Borrow record not found",
      })
    }

    res.status(200).json({
      status: "success",
      message: "Borrow record retrieved successfully",
      data: borrowRecord,
    })
  } catch (error) {
    console.error("Error fetching borrow record:", error)
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve borrow record",
      error: error.message,
    })
  }
}

/**
 * Create a new borrow record
 */
export const createBorrowRecord = async (req, res) => {
  try {
    const { userId, inventoryId, borrowDate, returnDate } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(userId, 10) },
    })
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found",
      })
    }

    // Check if inventory exists and is available
    const inventory = await prisma.inventory.findUnique({
      where: { inventoryId: parseInt(inventoryId, 10) },
    })
    if (!inventory || inventory.quantity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Inventory item not available",
      })
    }

    // Create borrow record
    const borrowRecord = await prisma.borrowRecord.create({
      data: {
        userId: parseInt(userId, 10),
        inventoryId: parseInt(inventoryId, 10),
        borrowDate: new Date(borrowDate),
        returnDate: new Date(returnDate),
      },
    })

    // Update inventory quantity
    await prisma.inventory.update({
      where: { inventoryId: parseInt(inventoryId, 10) },
      data: { quantity: inventory.quantity - 1 },
    })

    res.status(201).json({
      status: "success",
      message: "Borrow record created successfully",
      data: borrowRecord,
    })
  } catch (error) {
    console.error("Error creating borrow record:", error)
    res.status(500).json({
      status: "error",
      message: "Failed to create borrow record",
      error: error.message,
    })
  }
}

/**
 * Update an existing borrow record
 */
export const updateBorrowRecord = async (req, res) => {
  try {
    const { id } = req.params
    const { userId, inventoryId, borrowDate, returnDate } = req.body

    const borrowRecord = await prisma.borrowRecord.findUnique({
      where: { borrowId: parseInt(id, 10) },
    })

    if (!borrowRecord) {
      return res.status(404).json({
        status: "error",
        message: "Borrow record not found",
      })
    }

    const updatedBorrowRecord = await prisma.borrowRecord.update({
      where: { borrowId: parseInt(id, 10) },
      data: {
        userId: userId ? parseInt(userId, 10) : undefined,
        inventoryId: inventoryId ? parseInt(inventoryId, 10) : undefined,
        borrowDate: borrowDate ? new Date(borrowDate) : undefined,
        returnDate: returnDate ? new Date(returnDate) : undefined,
      },
    })

    res.status(200).json({
      status: "success",
      message: "Borrow record updated successfully",
      data: updatedBorrowRecord,
    })
  } catch (error) {
    console.error("Error updating borrow record:", error)
    res.status(500).json({
      status: "error",
      message: "Failed to update borrow record",
      error: error.message,
    })
  }
}

/**
 * Delete a borrow record
 */
export const deleteBorrowRecord = async (req, res) => {
  try {
    const { id } = req.params

    const borrowRecord = await prisma.borrowRecord.findUnique({
      where: { borrowId: parseInt(id, 10) },
    })

    if (!borrowRecord) {
      return res.status(404).json({
        status: "error",
        message: "Borrow record not found",
      })
    }

    await prisma.borrowRecord.delete({
      where: { borrowId: parseInt(id, 10) },
    })

    res.status(200).json({
      status: "success",
      message: "Borrow record deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting borrow record:", error)
    res.status(500).json({
      status: "error",
      message: "Failed to delete borrow record",
      error: error.message,
    })
  }
}

export const borrowItem = async (req, res) => {
  const { userId, inventoryId, borrowDate, returnDate } = req.body

  try {
    if (!userId || !inventoryId || !borrowDate || !returnDate) {
      return res.status(400).json({
        status: "error",
        message: "Semua data (userId, inventoryId, borrowDate, returnDate) harus diisi",
      })
    }

    const user = await prisma.user.findUnique({
      where: { userId: parseInt(userId, 10) },
    })

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      })
    }

    const inventory = await prisma.inventory.findUnique({
      where: { inventoryId: parseInt(inventoryId, 10) },
    })

    if (!inventory || inventory.quantity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "inventory tidak tersedia untuk dipinjam",
      })
    }

    const borrowRecord = await prisma.borrowRecord.create({
      data: {
        userId: parseInt(userId, 10),
        inventoryId: parseInt(inventoryId, 10),
        borrowDate: new Date(borrowDate),
        returnDate: new Date(returnDate),
      },
    })

    await prisma.inventory.update({
      where: { inventoryId: parseInt(inventoryId, 10) },
      data: { quantity: inventory.quantity - 1 },
    })

    res.status(201).json({
      status: "success",
      message: "borrowRecord berhasil dicatat",
      data: {
        borrowId: borrowRecord.borrowId,
        userId,
        inventoryId,
        borrowDate,
        returnDate,
      },
    })
  } catch (error) {
    console.error("Error saat mencatat borrowRecord:", error.message)
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    })
  }
}

export const returnItem = async (req, res) => {
  const { borrowId, returnDate } = req.body;

  try {
    if (!borrowId || !returnDate) {
      return res.status(400).json({
        status: "error",
        message: "Data (borrowId, returnDate) harus diisi",
      });
    }

    const borrowRecord = await prisma.borrowRecord.findUnique({
      where: { borrowId: parseInt(borrowId, 10) },
    });

    if (!borrowRecord) {
      return res.status(404).json({
        status: "error",
        message: "Borrow record tidak ditemukan",
      });
    }

    // Update borrow record
    await prisma.borrowRecord.update({
      where: { borrowId: parseInt(borrowId, 10) },
      data: {
        returnDate: new Date(returnDate),
      },
    });

    // Kembalikan stok inventory
    const inventory = await prisma.inventory.findUnique({
      where: { inventoryId: borrowRecord.inventoryId },
    });

    if (inventory) {
      await prisma.inventory.update({
        where: { inventoryId: borrowRecord.inventoryId },
        data: { quantity: inventory.quantity + 1 },
      });
    }

    res.status(200).json({
      status: "success",
      message: "inventory berhasil dikembalikan",
      data: {
        borrowId,
        inventoryId: borrowRecord.inventoryId,
        returnDate,
      },
    });
  } catch (error) {
    console.error("Error saat pengembalian inventory:", error.message);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
export const getUsageReport = async (req, res) => {
  const { borrowDate, returnDate, group_by } = req.body;

  // Validasi input
  if (!borrowDate || !returnDate || !group_by) {
    return res.status(400).json({
      status: "error",
      message: "borrowDate, returnDate, and group_by are required",
    });
  }

  const validGroups = ["user", "item", "category", "location"];
  if (!validGroups.includes(group_by)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid group_by value. Allowed values: ${validGroups.join(", ")}`,
    });
  }

  try {
    // Ambil data peminjaman dengan status 'dipinjam' atau 'dikembalikan'
    const borrowData = await prisma.borrowRecord.findMany({
      where: {
        AND: [
          { borrowDate: { gte: new Date(borrowDate) } },
          { returnDate: { lte: new Date(returnDate) } },
        ],
      },
      include: {
        inventory: true,
        user: true,
      },
    });

    // Debug log untuk memeriksa data
    console.log("Borrow Data:", borrowData);

    if (borrowData.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          analysis_periode: { borrowDate, returnDate },
          usage_analysis: [],
        },
      });
    }

    // Kelompokkan data berdasarkan parameter group_by
    const groupedData = borrowData.reduce((acc, borrowRecord) => {
      let groupKey;
      if (group_by === "user") {
        groupKey = borrowRecord.user ? borrowRecord.user.username : "Unknown User";
      } else if (group_by === "item") {
        groupKey = borrowRecord.inventory ? borrowRecord.inventory.name : "Unknown Item";
      } else if (group_by === "category") {
        groupKey = borrowRecord.inventory ? borrowRecord.inventory.category : "Unknown Category";
      } else if (group_by === "location") {
        groupKey = borrowRecord.inventory ? borrowRecord.inventory.location : "Unknown Location";
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          group: groupKey,
          total_borrowed: 0,
          total_returned: 0,
          items_in_use: 0,
        };
      }

      // Pastikan quantity tidak null
      const quantity = borrowRecord.quantity || 1; // Default ke 1 jika null
      acc[groupKey].total_borrowed += quantity;
      acc[groupKey].total_returned += borrowRecord.status === "kembali" ? quantity : 0;
      acc[groupKey].items_in_use += borrowRecord.status === "dipinjam" ? quantity : 0;

      return acc;
    }, {});

    // Format data untuk respons
    const usageAnalysis = Object.values(groupedData);

    res.status(200).json({
      status: "success",
      data: {
        analysis_periode: {
          borrowDate,
          returnDate,
        },
        usage_analysis: usageAnalysis,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const getBorrowAnalysis = async (req, res) => {
  const { start_date, end_date } = req.body;

  if (!start_date || !end_date) {
    return res.status(400).json({
      status: "error",
      message: "start_date and end_date are required",
    });
  }

  try {
    // Cari data peminjaman berdasarkan periode
    const borrowRecords = await prisma.borrowRecord.findMany({
      where: {
        borrowDate: {
          gte: new Date(start_date),
        },
        returnDate: {
          lte: new Date(end_date),
        },
      },
      include: {
        inventory: true,
      },
    });

    // Analisis barang yang sering dipinjam
    const frequentItems = borrowRecords.reduce((acc, record) => {
      const { inventory } = record;
      if (!acc[inventory.inventoryId]) {
        acc[inventory.inventoryId] = {
          item_id: inventory.inventoryId,
          name: inventory.name,
          category: inventory.category,
          total_borrowed: 0,
        };
      }
      acc[inventory.inventoryId].total_borrowed += 1;
      return acc;
    }, {});

    // Analisis barang dengan pengembalian terlambat
    const lateItems = borrowRecords.reduce((acc, record) => {
      if (new Date(record.returnDate) > new Date(record.borrowDate)) {
        const { inventory } = record;
        if (!acc[inventory.inventoryId]) {
          acc[inventory.inventoryId] = {
            item_id: inventory.inventoryId,
            name: inventory.name,
            category: inventory.category,
            total_borrowed: 0,
            total_late_returns: 0,
          };
        }
        acc[inventory.inventoryId].total_borrowed += 1;
        acc[inventory.inventoryId].total_late_returns += 1;
      }
      return acc;
    }, {});

    // Format hasil analisis
    const frequentBorrowedItems = Object.values(frequentItems);
    const inefficientItems = Object.values(lateItems);

    res.status(200).json({
      status: "success",
      data: {
        analysis_period: {
          start_date,
          end_date,
        },
        frequently_borrowed_items: frequentBorrowedItems,
        inefficient_items: inefficientItems,
      },
    });
  } catch (error) {
    console.error("Error fetching frequent and late items:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve frequent and late items",
      error: error.message,
    });
  }
};
