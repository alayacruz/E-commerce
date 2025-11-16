import { PrismaClient } from "@prisma/client";
import express from "express";
import prisma from "./db.js";

const categoryRouter = express.Router();

// CREATE
categoryRouter.post("/", async (req, res) => {
  try {
    const { categoryName, parentCategoryId } = req.body;
    const category = await prisma.category.create({
      data: {
        categoryName,
        parentCategoryId: parentCategoryId || null,
      },
    });
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

// READ ALL 
categoryRouter.get("/", async (req, res) => {
  try {
    const { parentId } = req.query;
    let whereClause = {};

    // If parentId is "null", fetch root categories
    if (parentId === "null") {
      whereClause = { parentCategoryId: null };
    } else if (parentId) {
      whereClause = { parentCategoryId: parseInt(parentId) };
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: { subcategories: true, parentCategory: true },
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// READ ONE
categoryRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { categoryId: parseInt(id) },
      include: { subcategories: true, parentCategory: true, products: true },
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// GET PRODUCTS IN ONE CATEGORY
categoryRouter.get("/:id/products", async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res
        .status(400)
        .json({ error: "Invalid category ID provided. ID must be a number." });
    }

    const category = await prisma.category.findUnique({
      where: { categoryId: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
      },
      include: {
        seller: { select: { seller_id: true, gst_no: true } },
        reviews: true,
      },
    });

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products for category" });
  }
});

// UPDATE
categoryRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, parentCategoryId } = req.body;
    const updated = await prisma.category.update({
      where: { categoryId: parseInt(id) },
      data: {
        categoryName,
        parentCategoryId: parentCategoryId || null,
      },
    });
    res.status(200).json({ message: "Category updated", updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE
categoryRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { categoryId: parseInt(id) },
    });
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default categoryRouter;