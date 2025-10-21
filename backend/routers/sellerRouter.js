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
    return res
      .status(500)
      .json({ error: "Server error during authorization." });
  }
};

sellerRouter.use(authMiddleware);
sellerRouter.use(isSeller);

sellerRouter.post("/products", async (req, res) => {
  try {
    const { userId, name, description, price, availableQuantity, categoryId } =
      req.body;
    if (name.length > 20)
      return res
        .status(403)
        .json({ error: "Product Name should not be more than 20 characters" });
    if (description.length > 50)
      return res
        .status(403)
        .json({ error: "Description should not be more than 50 characters" });
    const seller = await prisma.seller.findUnique({
      where: { seller_id: userId },
    });
    if (!seller)
      return res.status(403).json({ error: "Not authorized as seller" });

    const status = availableQuantity > 0 ? "In Stock" : "Out of Stock";

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        availableQuantity,
        status,
        seller_id: seller.seller_id,
        categoryId: categoryId,
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

// update products
sellerRouter.put("/products/:id", async (req, res) => {
  try {
    const { userId, name, description, price, availableQuantity } = req.body;
    const product = await prisma.product.findUnique({
      where: { productId: req.params.id },
    });

    console.log(product);
    if (!product || product.seller_id !== userId)
      return res.status(404).json({ error: "Product not found" });

    const status = availableQuantity > 0 ? "In Stock" : "Out of Stock";

    const updated = await prisma.product.update({
      where: { productId: req.params.id },
      data: { name, description, price, availableQuantity, status },
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
      return res
        .status(403)
        .json({ error: "Access denied: You do not own this product" });

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
