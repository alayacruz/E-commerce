import express from "express";
import { PrismaClient } from "@prisma/client";
//import { authMiddleware } from "../middleware/auth.js";

const sellerRouter = express.Router();
const prisma = new PrismaClient();

// add product
sellerRouter.post("/products", async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const seller = await prisma.seller.findUnique({
      where: { seller_id: req.userId },
    });
    if (!seller)
      return res.status(403).json({ error: "Not authorized as seller" });

    const status = stock > 0 ? "In Stock" : "Out of Stock";

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        status,
        seller_id: seller.seller_id,
      },
    });

    res.json({ message: "Product added successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

//kfkgj
// get all products
sellerRouter.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { seller_id: req.userId },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// update products
sellerRouter.put("/products/:id", async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await prisma.product.findUnique({
      where: { product_id: req.params.id },
    });

    if (!product || product.seller_id !== req.userId)
      return res.status(404).json({ error: "Product not found" });

    const status = stock > 0 ? "In Stock" : "Out of Stock";

    const updated = await prisma.product.update({
      where: { product_id: req.params.id },
      data: { name, description, price, stock, status },
    });

    res.json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// delete product
sellerRouter.delete("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { product_id: req.params.id },
    });

    if (!product || product.seller_id !== req.userId)
      return res.status(404).json({ error: "Product not found" });

    await prisma.product.delete({ where: { product_id: req.params.id } });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default sellerRouter;
