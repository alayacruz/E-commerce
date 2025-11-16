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

    const buyer = await prisma.buyer.findUnique({
      where: { buyer_id: userId }
    });

    if (!buyer) {
      return res.status(400).json({ error: "Buyer not found" });
    }

    const review = await prisma.review.create({
      data: {
        text: comment,
        rating: parseInt(rating, 10),
        date: new Date(),
        buyer: {
          connect: { buyer_id: userId }
        },
        product: {
          connect: { productId: productId }
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
    const reviews = await prisma.review.findMany({
      include: {
        buyer: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    const formattedReviews = reviews.map(review => ({
      id: review.reviewId,
      reviewId: review.reviewId,
      text: review.text,
      comment: review.text,
      title: review.text.substring(0, 50),
      rating: review.rating,
      date: review.date,
      createdAt: review.date,
      productId: review.productId,
      buyerId: review.buyerId,
      first_name: review.buyer.user.first_name,
      last_name: review.buyer.user.last_name,
      user: {
        first_name: review.buyer.user.first_name,
        last_name: review.buyer.user.last_name
      }
    }));

    res.status(200).json(formattedReviews);
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
        buyer: { 
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        } 
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    const formattedReviews = reviews.map(review => ({
      id: review.reviewId,
      reviewId: review.reviewId,
      text: review.text,
      comment: review.text,
      title: review.text.substring(0, 50),
      rating: review.rating,
      date: review.date,
      createdAt: review.date,
      productId: review.productId,
      buyerId: review.buyerId,
      first_name: review.buyer.user.first_name,
      last_name: review.buyer.user.last_name,
      user: {
        first_name: review.buyer.user.first_name,
        last_name: review.buyer.user.last_name
      }
    }));
    
    res.status(200).json(formattedReviews);
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
      where: { reviewId: id },
      data: { 
        rating: parseInt(rating, 10), 
        text: comment,
        date: new Date()
      },
    });

    res.status(200).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Get reviews for seller's products
reviewRouter.get("/seller", authMiddleware, async (req, res) => {
  try {
    const sellerId = req.user.userId;

    const sellerProducts = await prisma.product.findMany({
      where: { seller_id: sellerId },
      select: { productId: true }
    });

    const productIds = sellerProducts.map(p => p.productId);

    if (productIds.length === 0) {
      return res.json([]);
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: {
          in: productIds
        }
      },
      include: {
        buyer: {
          include: {
            user: {
              select: { 
                first_name: true,  
                last_name: true 
              }
            }
          }
        },
        product: {
          select: { name: true, imageUrls: true }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    const formattedReviews = reviews.map(review => ({
      id: review.reviewId,
      reviewId: review.reviewId,
      text: review.text,
      comment: review.text,
      title: review.text.substring(0, 50),
      rating: review.rating,
      date: review.date,
      createdAt: review.date,
      productId: review.productId,
      buyerId: review.buyerId,
      first_name: review.buyer.user.first_name,
      last_name: review.buyer.user.last_name,
      user: {
        first_name: review.buyer.user.first_name,
        last_name: review.buyer.user.last_name
      },
      product: review.product
    }));

    res.status(200).json(formattedReviews);
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
      where: { reviewId: id },
    });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default reviewRouter;