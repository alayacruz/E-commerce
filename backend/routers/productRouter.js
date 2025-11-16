import express from "express";
// --- CHANGE 1: Import 'Prisma' for our recursive query ---
import { PrismaClient, Prisma } from "@prisma/client";
import prisma from "./db.js";

const productRouter = express.Router();

// In your productRouter.js file:

productRouter.get("/", async (req, res) => {
  // 1. Get pagination params from query, with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9; // e.g., 9 products per page
  const skip = (page - 1) * limit;

  const { search, categories, sortBy, priceMin, priceMax } = req.query;

  try {
    let where = {
      isArchived: false,
    };
    let orderBy = {};

    // --- Build Where Clause ---
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }
    
    // --- ✅ START: RECURSIVE CATEGORY LOGIC ---
    if (categories) {
      // 1. Get the category names from the query string (e.g., "Electronics,Phones")
      const categoryNames = categories.split(',');

      // 2. Use a recursive query to find all matching category IDs AND all their descendants
      // This is the "magic" that finds all sub-categories automatically.
      const categoryIds = await prisma.$queryRaw(
        Prisma.sql`
          WITH RECURSIVE "CategoryTree" AS (
            -- Base case: Find the categories that match the names
            SELECT "categoryId"
            FROM "Category"
            WHERE "categoryName" IN (${Prisma.join(categoryNames)})
          
            UNION ALL
          
            -- Recursive step: Find all children of the categories found above
            SELECT c."categoryId"
            FROM "Category" c
            INNER JOIN "CategoryTree" ct ON c."parentCategoryId" = ct."categoryId"
          )
          SELECT "categoryId" FROM "CategoryTree";
        `
      );
      
      // 3. Extract the IDs from the query result
      const idList = categoryIds.map(c => c.categoryId);

      // 4. Add them to the main 'where' filter
      if (idList.length > 0) {
        where.categoryId = { in: idList };
      } else {
        // If categories were requested but none were found (e.g., a typo), return 0 products.
        where.categoryId = { in: [] }; 
      }
    }
    // --- ✅ END: RECURSIVE CATEGORY LOGIC ---

    // --- Build OrderBy Clause (Same as your old file) ---
    switch (sortBy) {
      case "price-low": orderBy = { price: "asc" }; break;
      case "price-high": orderBy = { price: "desc" }; break;
      // ... other sort options
      default: orderBy = { name: "asc" };
    }

    // 2. Run two queries at the same time: one to get the products for the page
    // and one to get the total count of matching products
    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: { select: { categoryName: true } },
          reviews: { select: { rating: true } },
        },
        take: limit, // Get only 'limit' number of items
        skip: skip, // Skip the items from previous pages
      }),
      prisma.product.count({
        where,
      }),
    ]);

    // 3. Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // --- Calculate ratings and transform data (Same as your old file) ---
    const productsWithRatings = products.map((p) => {
      const totalRating = p.reviews.reduce((acc, review) => acc + review.rating, 0);
      const rating = p.reviews.length > 0 ? totalRating / p.reviews.length : 0;
      return {
        id: p.productId,
        name: p.name,
        price: parseFloat(p.price), // Make sure this is a number
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        image: p.imageUrls[0] || null,
        rating: parseFloat(rating.toFixed(1)),
        reviews: p.reviews.length,
        category: p.category?.categoryName || "Uncategorized",
        description: p.description,
      };
    });

    // Sort by rating if needed
    if (sortBy === "rating") {
      productsWithRatings.sort((a, b) => b.rating - a.rating);
    }

    // 4. Return the new response object
    res.json({
      products: productsWithRatings,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts
    });

  } catch (e) {
    console.error("Failed to fetch products:", e);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 2. GET /products/:id (For ProductDetails page)
productRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { productId: id, isArchived: false },
      include: {
        // Include category and its parentage
        category: {
          include: {
            parentCategory: {
              include: {
                parentCategory: true // Include parent's parent
              }
            }
          }
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
      
    // --- (Optional) Build Breadcrumb Array ---
    // This is a helper function to create the breadcrumb path
    const getBreadcrumbs = (category) => {
      const crumbs = [];
      let current = category;
      while (current) {
        crumbs.push({ name: current.categoryName, id: current.categoryId });
        current = current.parentCategory;
      }
      return crumbs.reverse(); // [Parent, Child, Grandchild]
    };

    // Transform data for the details page
    const productDetails = {
      id: product.productId,
      name: product.name,
      price: parseFloat(product.price), 
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
      imageUrls: product.imageUrls, // Send all Cloudinary URLs
      rating: parseFloat(product.avgRating.toFixed(1)), // Use pre-calculated avgRating-- triggers
      reviews: product._count.reviews, // Use pre-calculated count-- triggers 
      description: product.description,
      features: product.features || [],
      specifications: product.specifications || {}, 
      inStock: product.availableQuantity > 0,
      category: product.category?.categoryName || "Uncategorized",
      breadcrumbs: product.category ? getBreadcrumbs(product.category) : [],
    };

    res.json(productDetails);
  } catch (e) {
    console.error("Failed to fetch product details:", e);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

// 3. GET /products/:id/reviews (For ProductDetails page)
productRouter.get("/:id/reviews", async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { date: "desc" },
      include: {
        buyer: {
          // Get the buyer's name
          select: {
            user: {
              select: { first_name: true, last_name: true },
            },
          },
        },
      },
    });

    // Transform data for the frontend
    const formattedReviews = reviews.map((r) => ({
      id: r.reviewId,
      author: `${r.buyer.user.first_name} ${
        r.buyer.user.last_name || ""
      }`.trim(),
      rating: r.rating,
      date: r.date.toISOString().split("T")[0],
      comment: r.text,
      helpful: 0, // You don't have a 'helpful' count in your schema
    }));

    res.json(formattedReviews);
  } catch (e) {
    console.error("Failed to fetch reviews:", e);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// 4. GET /products/:id/similar (For ProductDetails page)
productRouter.get("/:id/similar", async (req, res) => {
  const { id } = req.params;
  try {
    // First, find the current product to get its category
    const product = await prisma.product.findUnique({
      where: { productId: id },
      select: { categoryId: true },
    });

    if (!product || !product.categoryId) {
      return res.json([]); // Return empty if no category
    }

    // Now, find other products in the same category
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isArchived: false,
        NOT: {
          productId: id, // Exclude the product itself
        },
      },
      take: 3, // Limit to 3 similar products
      include: {
        reviews: { select: { rating: true } },
      },
    });

    // Transform data
    const formattedSimilar = similarProducts.map((p) => {
      const totalRating = p.reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const rating = p.reviews.length > 0 ? totalRating / p.reviews.length : 0;
      return {
        id: p.productId,
        name: p.name,
        price: parseFloat(p.price),
        image: p.imageUrls[0] || null, // Send first Cloudinary URL
        rating: parseFloat(rating.toFixed(1)),
      };
    });

    res.json(formattedSimilar);
  } catch (e) {
    console.error("Failed to fetch similar products:", e);
    res.status(500).json({ error: "Failed to fetch similar products" });
  }
});

export default productRouter;