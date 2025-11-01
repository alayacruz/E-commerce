import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.middleware.js";
import multer from "multer"; 
import path from "path";

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();
const sellerRouter = express.Router();
const prisma = new PrismaClient();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

//multer configs 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shophub_products', 
    allowedFormats: ['jpeg', 'png', 'jpg'],
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
    const { name, description, price, availableQuantity, categoryId, originalPrice, features, specifications} =
      req.body;
    const sellerId = req.user?.userId; 

    if (!sellerId) {
      return res.status(401).json({ error: "Authentication token is missing." });
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
    
    // Handle optional fields
    const numOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
    const specsObject = specifications ? JSON.parse(specifications) : null;
    
    // Handle features (can be single or array)
    let featuresArray = [];
    if (features) {
      featuresArray = Array.isArray(features) ? features : [features];
    }

    if (isNaN(numPrice) || isNaN(numAvailableQuantity) || isNaN(numCategoryId)) {
      return res.status(400).json({ error: "Invalid data types for price, stock, or category." });
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
        originalPrice: numOriginalPrice,
        availableQuantity: numAvailableQuantity,
        status,
        seller_id: sellerId,
        categoryId: numCategoryId,
        imageUrls: imageUrls,
        features: featuresArray,
        specifications: specsObject,
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
        seller_id: sellerId, // Ensures a seller can only get their own product
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found or you do not own this product." });
    }

    // The frontend expects this exact data structure
    const productData = {
      name: product.name,
      categoryId: product.categoryId,
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
    // 1. Get total income from completed orders
    const incomeResult = await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        items: {
          some: {
            product: {
              seller_id: sellerId,
            },
          },
        },
        status: "Completed", 
      },
    });

    // 2. Get total products sold
    const soldResult = await prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        product: {
          seller_id: sellerId,
        },
        order: {
          status: "Completed",
        },
      },
    });

    // 3. Get total product reviews
    const reviewsResult = await prisma.review.count({
      where: {
        product: {
          seller_id: sellerId,
        },
      },
    });

    // 4. Get total cancelled orders
    const cancelledResult = await prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              seller_id: sellerId,
            },
          },
        },
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

const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const publicIdWithExtension = parts.slice(-2).join('/'); 
  return publicIdWithExtension.split('.')[0]; 
};

// UPDATE PRODUCTS (REPLACED)
sellerRouter.put("/products/:id", upload, async (req, res) => {
  try {
    // 1. Get ALL fields from the body
    const { 
      name, 
      description, 
      price, 
      availableQuantity, 
      categoryId,
      originalPrice,
      features,
      specifications,
      existingImageUrls // <-- This is the list of images to KEEP
    } = req.body;
      
    const sellerId = req.user?.userId; 
    const { id: productId } = req.params;

    // 2. Find the product first (to get old images)
    const product = await prisma.product.findUnique({
      where: { productId: productId },
    });

    if (!product || product.seller_id !== sellerId) 
      return res.status(404).json({ error: "Product not found" });

    // 3. Prepare all the data for update
    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (originalPrice) updateData.originalPrice = parseFloat(originalPrice);
    if (categoryId) updateData.categoryId = parseInt(categoryId, 10);
    
    // Parse features (can be single or array)
    if (features) {
      updateData.features = Array.isArray(features) ? features : [features];
    } else {
      updateData.features = []; // Clear features if empty
    }
    
    // Parse specifications
    if (specifications) {
      updateData.specifications = JSON.parse(specifications);
    } else {
      updateData.specifications = {}; // Clear specs if empty
    }
    
    if (availableQuantity) {
      const numAvailableQuantity = parseInt(availableQuantity, 10);
      updateData.availableQuantity = numAvailableQuantity;
      updateData.status = numAvailableQuantity === 0
        ? "Out of Stock"
        : numAvailableQuantity < 5
        ? "A Few Left"
        : "In Stock";
    }

    // --- 4. Smart Image Handling ---
    const newImageUrls = req.files.map((file) => file.path);
    
    // Get the list of images the user decided to keep
    let keptImageUrls = [];
    if (existingImageUrls) {
      keptImageUrls = Array.isArray(existingImageUrls) ? existingImageUrls : [existingImageUrls];
    }
    
    // The final list of images is the ones we kept + the new ones
    updateData.imageUrls = [...keptImageUrls, ...newImageUrls];

    // 5. Delete any old images from Cloudinary that were removed
    const oldImageUrls = product.imageUrls || [];
    const imagesToDelete = oldImageUrls.filter(url => !keptImageUrls.includes(url));

    if (imagesToDelete.length > 0) {
      try {
        await Promise.all(
          imagesToDelete.map((url) => {
            const publicId = getPublicIdFromUrl(url);
            if (publicId) return cloudinary.uploader.destroy(publicId);
            return Promise.resolve();
          })
        );
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error during update:", cloudinaryError);
        // Don't block the update, just log the error
      }
    }

    // 6. Update the product in the database
    const updatedProduct = await prisma.product.update({ 
      where: { productId: productId },
      data: updateData,
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
    const getPublicIdFromUrl = (url) => {
       const parts = url.split('/');
       const publicIdWithExtension = parts.slice(-2).join('/'); 
       return publicIdWithExtension.split('.')[0]; 
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

    res.status(200).json({ message: "Product archived successfully" });
  } catch (e) {
    console.error("Failed to delete product:", e);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default sellerRouter;