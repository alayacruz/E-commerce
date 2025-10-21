import express from "express";
import { PrismaClient } from "@prisma/client";
//import { authMiddleware } from "../middleware/auth.js";

const sellerRouter = express.Router();
const prisma = new PrismaClient();

// add product
sellerRouter.post("/products", async (req, res) => {
  try {
    const { userId, name, description, price, availableQuantity } = req.body;

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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        availableQuantity,
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

// get all products
sellerRouter.get("/products", async (req, res) => {
  try {
    const { userId } = req.body;
    const products = await prisma.product.findMany({
      where: { seller_id: userId },
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

    res.json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// delete product
sellerRouter.delete("/products/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const product = await prisma.product.findUnique({
      where: { product_id: req.params.id },
    });

    if (!product || product.seller_id !== userId)
      return res.status(404).json({ error: "Product not found" });

    await prisma.product.delete({ where: { product_id: req.params.id } });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default sellerRouter;
