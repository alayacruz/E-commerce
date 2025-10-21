import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const categoryRouter = express.Router();

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
    console.error(err);
    res.status(500).json({ error: "Failed to create category" });
  }
});
export default categoryRouter;
