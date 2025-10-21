import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.middleware"; // Assuming the file is in a middleware folder

dotenv.config();
const sellerRouter = express.Router();
const prisma = new PrismaClient();

// Define a type for our JWT payload (matches what we sign in /login)
interface UserPayload {
  userId: string;
  email: string;
  username: string;
}

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

const isSeller = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication failed." });
    }

    try {
        const seller = await prisma.seller.findUnique({
            where: { seller_id: req.user.userId },
        });

        if (!seller) {
            return res.status(403).json({ error: "Access denied: Not a seller" });
        }

        // If the user is a seller, proceed to the route
        next();
    } catch (error) {
        return res.status(500).json({ error: "Server error during authorization." });
    }
};

sellerRouter.use(authMiddleware);
sellerRouter.use(isSeller);

//seller routes
/**
 * @route   POST /seller/products
 * @desc    Add a new product
 * @access  Private (Seller only)
 */
sellerRouter.post("/products", async (req, res) => {
  const { name, description, price, stock } = req.body;
  const sellerId = req.user!.userId; // We know user exists from the middlewares

  // Validation
  if (!name || !price || stock === undefined) {
    return res
      .status(400)
      .json({ error: "Name, price, and stock are required" });
  }

  if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    return res.status(400).json({ error: "Price must be a positive number" });
  }

  if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
    return res.status(400).json({ error: "Stock must be a non-negative number" });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        seller_id: sellerId,
      },
    });
    res.status(201).json(newProduct);
  } catch (e) {
    console.error("Failed to create product:", e);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * @route   GET /seller/products
 * @desc    Get all products for the logged-in seller
 * @access  Private (Seller only)
 */
sellerRouter.get("/products", async (req, res) => {
  const sellerId = req.user!.userId;

  try {
    const products = await prisma.product.findMany({
      where: {
        seller_id: sellerId,
        isArchived: false, // Only get non-archived products
      },
      orderBy: {
        name: "asc",
      },
    });
    res.json(products);
  } catch (e) {
    console.error("Failed to fetch products:", e);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * @route   PUT /seller/products/:productId
 * @desc    Update a product's details
 * @access  Private (Seller only)
 */
sellerRouter.put("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, stock } = req.body;
  const sellerId = req.user!.userId;

  try {
    // 1. Check if the product exists and belongs to the seller
    const product = await prisma.product.findUnique({
      where: { product_id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.seller_id !== sellerId) {
      return res
        .status(403)
        .json({ error: "Access denied: You do not own this product" });
    }

    // 2. Prepare update data
    const updateData: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    } = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: "Price must be a positive number" });
      }
      updateData.price = numPrice;
    }
    if (stock !== undefined) {
       const numStock = parseInt(stock);
       if (isNaN(numStock) || numStock < 0) {
         return res.status(400).json({ error: "Stock must be a non-negative number" });
       }
       updateData.stock = numStock;
    }

    // 3. Perform the update
    const updatedProduct = await prisma.product.update({
      where: { product_id: productId },
      data: updateData,
    });

    res.json(updatedProduct);
  } catch (e) {
    console.error("Failed to update product:", e);
    res.status(500).json({ error: "Failed to update product" });
  }
});


/**
 * @route   DELETE /seller/products/:productId
 * @desc    Delete (soft) a product
 * @access  Private (Seller only)
 */
sellerRouter.delete("/products/:productId", async (req, res) => {
    const { productId } = req.params;
    const sellerId = req.user!.userId;

    try {
        // 1. Check if the product exists and belongs to the seller
        const product = await prisma.product.findUnique({
            where: { product_id: productId },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (product.seller_id !== sellerId) {
            return res.status(403).json({ error: "Access denied: You do not own this product" });
        }

        // 2. Perform a "soft delete" by archiving the product
        await prisma.product.update({
            where: { product_id: productId },
            data: {
                isArchived: true,
                stock: 0, // Also set stock to 0
            },
        });

        res.status(200).json({ message: "Product archived successfully" });

    } catch (e) {
        console.error("Failed to delete product:", e);
        res.status(500).json({ error: "Failed to delete product" });
    }
});


export default sellerRouter;