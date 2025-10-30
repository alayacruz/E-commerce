import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
    const categories = await prisma.category.findMany({
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
      where: { categoryId: parseInt(id) }, // Using categoryId as per schema
      include: { subcategories: true, parentCategory: true, products: true }, // Include products here too
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

    // First, check if the category exists. If it doesn't, we return a 404.
    const category = await prisma.category.findUnique({
      where: { categoryId: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Then, fetch the products in that category.
    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
      },

      include: {
        seller: { select: { seller_id: true, gst_no: true } },
        reviews: true,
      },
    });

    // Return the list of products (may be an empty array if category exists but has no products)
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
      where: { categoryId: parseInt(id) }, // Using categoryId as per schema
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
      where: { categoryId: parseInt(id) }, // Using categoryId as per schema
    });
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default categoryRouter;
