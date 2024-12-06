import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all inventory
export const getAllInventory = async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany();
    res.status(200).json({
      success: true,
      data: inventories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory data.",
    });
  }
};

// Get inventory by ID
export const getInventoryById = async (req, res) => {
  const { inventoryId } = req.params;

  try {
    if (!inventoryId || isNaN(Number(inventoryId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID.",
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { inventoryId: Number(inventoryId) },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory.",
    });
  }
};

// Add new inventory
export const addInventory = async (req, res) => {
  const { name, category, location, quantity } = req.body;

  try {
    // Validasi input
    if (!name || !category || !location || !quantity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Tambahkan data ke database
    const inventory = await prisma.inventory.create({
      data: {
        name,
        category,
        location,
        quantity: Number(quantity),
      },
    });

    // Berikan respons berhasil
    res.status(201).json({
      success: true,
      message: "Inventory added successfully.",
      data: inventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add inventory.",
    });
  }
};

// Update inventory
export const updateInventory = async (req, res) => {
  const { inventoryId } = req.params;
  const { name, category, location, quantity } = req.body;

  try {
    if (!inventoryId || isNaN(Number(inventoryId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID.",
      });
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: { inventoryId: Number(inventoryId) },
    });

    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    const updatedInventory = await prisma.inventory.update({
      where: { inventoryId: Number(inventoryId) },
      data: {
        name: name || existingInventory.name,
        category: category || existingInventory.category,
        location: location || existingInventory.location,
        quantity: quantity !== undefined ? Number(quantity) : existingInventory.quantity,
      },
    });

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully.",
      data: updatedInventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update inventory.",
    });
  }
};

// Delete inventory
export const deleteInventory = async (req, res) => {
  const { inventoryId } = req.params;

  try {
    if (!inventoryId || isNaN(Number(inventoryId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID.",
      });
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: { inventoryId: Number(inventoryId) },
    });

    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    await prisma.inventory.delete({
      where: { inventoryId: Number(inventoryId) },
    });

    res.status(200).json({
      success: true,
      message: "Inventory deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inventory.",
    });
  }
};
