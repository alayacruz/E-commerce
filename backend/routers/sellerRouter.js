import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";
import { Client } from "@elastic/elasticsearch";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();
const sellerRouter = express.Router();
const prisma = new PrismaClient();

const elasticClient = new Client({
  node: process.env.ELASTIC_ENDPOINT,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//multer configs
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "shophub_products",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

const upload = multer({ storage: storage }).array("images", 5);

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

// CREATE PRODUCT
sellerRouter.post("/products", upload, async (req, res) => {
  try {
    const { name, description, price, availableQuantity, categoryId } =
      req.body;
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return res
        .status(401)
        .json({ error: "Authentication token is missing." });
    }

    if (!name || !price || !availableQuantity || !categoryId) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (name.length > 50)
      return res
        .status(403)
        .json({ error: "Product Name should not be more than 50 characters" });
    if (description && description.length > 200)
      return res
        .status(403)
        .json({ error: "Description should not be more than 200 characters" });

    const numPrice = parseFloat(price);
    const numAvailableQuantity = parseInt(availableQuantity, 10);
    const numCategoryId = parseInt(categoryId, 10);

    if (
      isNaN(numPrice) ||
      isNaN(numAvailableQuantity) ||
      isNaN(numCategoryId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid data types for price, stock, or category." });
    }

    const status =
      numAvailableQuantity === 0
        ? "Out of Stock"
        : numAvailableQuantity < 5
        ? "A Few Left"
        : "In Stock";

    // get urls from cloudinary
    const imageUrls = req.files.map((file) => file.path);

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: numPrice,
        availableQuantity: numAvailableQuantity,
        status,
        seller_id: sellerId,
        categoryId: numCategoryId,
        imageUrls: imageUrls, //save cloudinary urls
      },
    });
    await elasticClient.index({
      index: "product_index",
      id: newProduct.productId,
      document: {
        productName: newProduct.name,
        productDesc: newProduct.description,
        availableQuantity: newProduct.availableQuantity,
        price: newProduct.price,
      },
    });
    res.status(201).json(newProduct);
  } catch (e) {
    console.error("Failed to create product:", e);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// GET SELLER'S PRODUCTS
sellerRouter.get("/products", async (req, res) => {
  const sellerId = req.user?.userId;

  try {
    const products = await prisma.product.findMany({
      where: { seller_id: sellerId, isArchived: false },
      orderBy: { name: "asc" },
      include: {
        category: {
          select: {
            categoryName: true,
          },
        },
      },
    });
    res.json(products);
  } catch (e) {
    console.error("Failed to fetch products:", e);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// UPDATE PRODUCTS
sellerRouter.put("/products/:id", upload, async (req, res) => {
  try {
    const { name, description, price, availableQuantity } = req.body;
    const sellerId = req.user?.userId;
    const { id: productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { productId: productId },
    });

    if (!product || product.seller_id !== sellerId)
      return res.status(404).json({ error: "Product not found" });

    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);

    if (availableQuantity) {
      const numAvailableQuantity = parseInt(availableQuantity, 10);
      updateData.availableQuantity = numAvailableQuantity;
      updateData.status =
        numAvailableQuantity === 0
          ? "Out of Stock"
          : numAvailableQuantity < 5
          ? "A Few Left"
          : "In Stock";
    }

    if (req.files && req.files.length > 0) {
      updateData.imageUrls = req.files.map((file) => file.path);
    }

    const updatedProduct = await prisma.product.update({
      where: { productId: productId },
      data: updateData,
    });

    await elasticClient.update({
      index: "product_index",
      id: e.productId,
      document: {
        productName: updatedProduct.name,
        productDesc: updatedProduct.description,
        availableQuantity: updatedProduct.availableQuantity,
        price: updatedProduct.price,
      },
    });

    res.json(updatedProduct);
  } catch (e) {
    console.error("Failed to update product:", e);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE PRODUCT
sellerRouter.delete("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const sellerId = req.user?.userId;

  try {
    const product = await prisma.product.findUnique({
      where: { productId: productId },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.seller_id !== sellerId)
      return res
        .status(403)
        .json({ error: "Access denied: You do not own this product" });

    // delete image corresponding to the product from cloudinary
    const imageUrls = product.imageUrls || [];
    await Promise.all(imageUrls.map((url) => cloudinary.uploader.destroy(url)));

    await prisma.product.update({
      where: { productId: productId },
      data: {
        isArchived: true,
        availableQuantity: 0,
        status: "Out of Stock",
      },
    });
    await elasticClient.delete({
      index: "product_index",
      id: productId,
    });
    res.status(200).json({ message: "Product archived successfully" });
  } catch (e) {
    console.error("Failed to delete product:", e);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default sellerRouter;
