import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.middleware.js";

dotenv.config();
const sellerRouter = express.Router();
const prisma = new PrismaClient();

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

        next();
    } catch (error) {
        return res.status(500).json({ error: "Server error during authorization." });
    }
};

sellerRouter.use(authMiddleware);
sellerRouter.use(isSeller);

sellerRouter.post("/products", async (req, res) => {
  const { name, description, price, stock } = req.body;
  const sellerId = req.user?.userId;

  if (!sellerId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!name || !price || stock === undefined) {
    return res.status(400).json({ error: "Name, price, and stock are required" });
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

sellerRouter.get("/products", async (req, res) => {
  const sellerId = req.user?.userId;

  try {
    const products = await prisma.product.findMany({
      where: { seller_id: sellerId, isArchived: false },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (e) {
    console.error("Failed to fetch products:", e);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

sellerRouter.put("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, stock } = req.body;
  const sellerId = req.user?.userId;

  try {
    const product = await prisma.product.findUnique({
      where: { product_id: productId },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.seller_id !== sellerId)
      return res.status(403).json({ error: "Access denied: You do not own this product" });

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0)
        return res.status(400).json({ error: "Price must be a positive number" });
      updateData.price = numPrice;
    }
    if (stock !== undefined) {
      const numStock = parseInt(stock);
      if (isNaN(numStock) || numStock < 0)
        return res.status(400).json({ error: "Stock must be a non-negative number" });
      updateData.stock = numStock;
    }

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

sellerRouter.delete("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const sellerId = req.user?.userId;

  try {
    const product = await prisma.product.findUnique({
      where: { product_id: productId },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.seller_id !== sellerId)
      return res.status(403).json({ error: "Access denied: You do not own this product" });

    await prisma.product.update({
      where: { product_id: productId },
      data: {
        isArchived: true,
        stock: 0,
      },
    });

    res.status(200).json({ message: "Product archived successfully" });
  } catch (e) {
    console.error("Failed to delete product:", e);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default sellerRouter;
