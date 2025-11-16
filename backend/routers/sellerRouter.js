import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";
import { Client } from "@elastic/elasticsearch";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import prisma from "./db.js";

dotenv.config();
const sellerRouter = express.Router();

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

const upload = multer({ storage: storage }).array("images", 10);

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
    const {
      name,
      description,
      price,
      availableQuantity,
      categoryId,
      originalPrice,
      features,
      specifications,
    } = req.body;
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return res
        .status(401)
        .json({ error: "Authentication token is missing." });
    }

    if (!name || !price || !availableQuantity) {
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

    const numOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;

    const featuresArray = Array.isArray(features)
      ? features
      : features
      ? [features]
      : [];

    let specsObject = {};
    try {
      if (specifications) {
        specsObject = JSON.parse(specifications);
      }
    } catch (parseError) {
      console.error("Failed to parse specifications JSON:", parseError);
      return res.status(400).json({ error: "Invalid specifications format." });
    }

    if (isNaN(numPrice) || isNaN(numAvailableQuantity)) {
      return res
        .status(400)
        .json({ error: "Invalid data types for price, stock, or category." });
    }
    if (originalPrice && isNaN(numOriginalPrice)) {
      return res
        .status(400)
        .json({ error: "Invalid data type for originalPrice." });
    }

    const status =
      numAvailableQuantity === 0
        ? "Out of Stock"
        : numAvailableQuantity < 5
        ? "A Few Left"
        : "In Stock";

    const imageUrls = req.files.map((file) => file.path);

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: numPrice,
        originalPrice: numOriginalPrice,
        availableQuantity: numAvailableQuantity,
        status,
        seller_id: sellerId,
        categoryId: numCategoryId ? numCategoryId : null,
        imageUrls: imageUrls,
        features: featuresArray,
        specifications: specsObject,
      },
    });

    try {
      await elasticClient.index({
        index: "product_index",
        id: newProduct.productId,
        document: {
          productName: newProduct.name,
          productDesc: newProduct.description,
          availableQuantity: newProduct.availableQuantity,
          price: newProduct.price,
          features: newProduct.features,
          specs: newProduct.specifications,
        },
      });
    } catch (elasticError) {
      console.error(
        "Failed to index new product, but product was created:",
        elasticError
      );
    }

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

// GET A SINGLE PRODUCT (FOR EDITING)
sellerRouter.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const sellerId = req.user?.userId;

  if (!sellerId) {
    return res.status(401).json({ error: "Authentication token is missing." });
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        productId: id,
        seller_id: sellerId,
      },
      // Include category and up to 2 levels of parents to support the 3-dropdown UI
      include: {
        category: {
          include: {
            parentCategory: {
              include: {
                parentCategory: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: "Product not found or you do not own this product." });
    }

    const productData = {
      name: product.name,
      categoryId: product.categoryId,
      category: product.category, // Pass the full hierarchy
      price: product.price,
      originalPrice: product.originalPrice,
      availableQuantity: product.availableQuantity,
      description: product.description,
      features: product.features,
      specifications: product.specifications,
      imageUrls: product.imageUrls,
    };

    res.json(productData);
  } catch (e) {
    console.error("Failed to fetch single product:", e);
    res.status(500).json({ error: "Failed to fetch product data." });
  }
});

// seller stats displayed on dashboard
sellerRouter.get("/stats", async (req, res) => {
  const sellerId = req.user?.userId;
  if (!sellerId) {
    return res.status(401).json({ error: "Authentication token is missing." });
  }

  try {
    const incomeResult = await prisma.order.aggregate({
      _sum: { amount: true },
      where: {
        items: { some: { product: { seller_id: sellerId } } },
        status: "Completed",
      },
    });

    const soldResult = await prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        product: { seller_id: sellerId },
        order: { status: "Completed" },
      },
    });

    const reviewsResult = await prisma.review.count({
      where: { product: { seller_id: sellerId } },
    });

    const cancelledResult = await prisma.order.count({
      where: {
        items: { some: { product: { seller_id: sellerId } } },
        status: "Cancelled",
      },
    });

    res.json({
      income: incomeResult._sum.amount || 0,
      sold: soldResult._sum.quantity || 0,
      reviews: reviewsResult || 0,
      cancelled: cancelledResult || 0,
    });
  } catch (e) {
    console.error("Failed to fetch seller stats:", e);
    res.status(500).json({ error: "Failed to fetch seller stats" });
  }
});

// UPDATE PRODUCTS
sellerRouter.put("/products/:id", upload, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      availableQuantity,
      categoryId,
      originalPrice,
      features,
      specifications,
      existingImageUrls,
    } = req.body;

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

    if (originalPrice !== undefined) {
      updateData.originalPrice = originalPrice
        ? parseFloat(originalPrice)
        : null;
    }

    if (categoryId) updateData.categoryId = parseInt(categoryId, 10);

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

    if (features) {
      updateData.features = Array.isArray(features) ? features : [features];
    }

    if (specifications) {
      try {
        updateData.specifications = JSON.parse(specifications);
      } catch (parseError) {
        return res
          .status(400)
          .json({ error: "Invalid specifications format." });
      }
    }

    const newImageFiles = req.files ? req.files.map((file) => file.path) : [];
    const existingImages = Array.isArray(existingImageUrls)
      ? existingImageUrls
      : existingImageUrls
      ? [existingImageUrls]
      : [];

    updateData.imageUrls = [...existingImages, ...newImageFiles];

    const updatedProduct = await prisma.product.update({
      where: { productId: productId },
      data: updateData,
    });

    try {
      await elasticClient.update({
        index: "product_index",
        id: productId,
        doc: {
          productName: updatedProduct.name,
          productDesc: updatedProduct.description,
          availableQuantity: updatedProduct.availableQuantity,
          price: updatedProduct.price,
          features: updatedProduct.features,
          specs: updatedProduct.specifications,
        },
      });
    } catch (elasticError) {
      console.error("Failed to update Elasticsearch index:", elasticError);
    }

    res.json(updatedProduct);
  } catch (e) {
    console.error("Failed to update product in database:", e);
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

    const imageUrls = product.imageUrls || [];
    const getPublicIdFromUrl = (url) => {
      const parts = url.split("/");
      const publicIdWithExtension = parts.slice(-2).join("/");
      return publicIdWithExtension.split(".")[0];
    };

    try {
      await Promise.all(
        imageUrls.map((url) => {
          const publicId = getPublicIdFromUrl(url);
          if (publicId) {
            return cloudinary.uploader.destroy(publicId);
          }
          return Promise.resolve();
        })
      );
    } catch (cloudinaryError) {
      console.error("Cloudinary delete error:", cloudinaryError);
    }

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