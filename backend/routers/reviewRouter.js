import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";
import prisma from "./db.js";
import authMiddleware from "../middleware/auth.middleware.js";

dotenv.config();
const reviewRouter = express.Router();

// Create a review
reviewRouter.post("/", async (req, res) => {
  try {
    const { userId, productId, rating, comment, title } = req.body;
    
    if (!userId || !productId || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const review = await prisma.review.create({
      data: {
        title: title,
        comment: comment,
        rating: parseInt(rating, 10), 
        user: {
          connect: { user_id: userId } 
        },
        product: {
          connect: { id: productId } 
        }
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err); 
    res.status(500).json({ error: "Failed to create review", details: err.message });
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
      include: { 
        user: { 
          select: {
            first_name: true,
            last_name: true
          }
        } 
      },
      orderBy: {
        createdAt: 'desc'
      }
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

reviewRouter.get("/seller", authMiddleware , async (req, res) => {
  try {
    const sellerId = req.user.userId; // Get seller ID from token

    // 1. Find all product IDs belonging to this seller
    const sellerProducts = await prisma.product.findMany({
      where: { seller_id: sellerId },
      select: { productId: true }
    });

    const productIds = sellerProducts.map(p => p.id);

    if (productIds.length === 0) {
      return res.json([]); // No products, so no reviews
    }

    // 2. Find all reviews for those product IDs
    const reviews = await prisma.review.findMany({
      where: {
        productId: {
          in: productIds
        }
      },
      include: {
        user: { // User who wrote the review
          select: { first_name: true,  
          last_name: true }
        },
        product: { // Product the review is for
          select: { name: true, imageUrls: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching seller reviews:", err);
    res.status(500).json({ error: "Failed to fetch seller reviews" });
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
