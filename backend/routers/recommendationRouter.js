import express from "express";
import axios from "axios";
import prisma from "./db.js";
import authMiddleware from "../middleware/auth.middleware.js";

const recommendationRouter = express.Router();

recommendationRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const buyerId = req.user.userId;

    //  Get all products this buyer has ordered
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { buyer_id: buyerId }
      },
      select: { product_id: true },
      distinct: ["product_id"]
    });

    const boughtProductIds = orderItems.map(item => item.product_id);

    //  buyer has no orders yet, return top-rated products
    if (!boughtProductIds.length) {
      const popular = await prisma.product.findMany({
        where:   { isArchived: false },
        orderBy: { avgRating: "desc" },
        take:    10,
        include: { category: true }
      });
      return res.json(popular);
    }

    //  Send bought product IDs to the ML model
    const { data } = await axios.post("http://localhost:8000/recommendations", {
      bought_product_ids: boughtProductIds,
      limit: 10
    });

    // fallback if ML returns nothing
    if (!data.product_ids || !data.product_ids.length) {
      const popular = await prisma.product.findMany({
        where:   { isArchived: false },
        orderBy: { avgRating: "desc" },
        take:    10,
        include: { category: true }
      });
      return res.json(popular);
    }

    //  product IDs into full product objects
    const products = await prisma.product.findMany({
      where: {
        productId:  { in: data.product_ids },
        isArchived: false
      },
      include: { category: true }
    });

    // Preserve the ML ranking order
    const ordered = data.product_ids
      .map(id => products.find(p => p.productId === id))
      .filter(Boolean);

    res.json(ordered);

  } catch (err) {
    console.error("Recommendation error:", err.message);
    res.status(500).json({ error: "Could not fetch recommendations" });
  }
});

export default recommendationRouter;