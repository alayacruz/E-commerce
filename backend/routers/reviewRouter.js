import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";
import prisma from "./db.js";

dotenv.config();
const reviewRouter = express.Router();

// Create a review
reviewRouter.post("/", async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;
    if (!userId || !productId || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const review = await prisma.review.create({
      data: { userId, productId, rating, comment },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Get all reviews
reviewRouter.get("/", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany();
    res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Get reviews for a specific product
reviewRouter.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: true }, // if you want user info with each review
    });
    res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product reviews" });
  }
});

// Update a review
reviewRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });

    res.status(200).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Delete a review
reviewRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default reviewRouter;
