import express from "express";
// --- CHANGE 1: Import 'Prisma' for our recursive query ---
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const productRouter = express.Router();

// 1. GET /products (For ProductListings page with filtering)
productRouter.get("/", async (req, res) => {
  const { search, categories, sortBy, priceMin, priceMax } = req.query;

  try {
    let where = {
      isArchived: false, // Don't show archived products
    };
    let orderBy = {};

    // --- Build Where Clause ---
    // Search filter
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive", // Case-insensitive search
      };
    }

    // Price filter
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }

    // --- CHANGE 2: Updated Category Filter Logic ---
    // This now finds all descendant categories
    if (categories) {
      const categoryList = categories.split(",").map(c => c.trim());

      // 1. Find the initial category IDs from their names
      const initialCategories = await prisma.category.findMany({
        where: {
          categoryName: {
            in: categoryList,
            mode: "insensitive",
          },
        },
        select: { categoryId: true },
      });

      const initialCategoryIds = initialCategories.map(c => c.categoryId);

      // 2. Use a recursive query to find all descendant IDs
      const allCategoryIds = await prisma.$queryRaw`
        WITH RECURSIVE "CategoryDescendants" AS (
          -- Base case: Select the initial categories
          SELECT "categoryId"
          FROM "Category"
          WHERE "categoryId" IN (${Prisma.join(initialCategoryIds)})

          UNION

          -- Recursive step: Find all children of the categories already in the set
          SELECT c."categoryId"
          FROM "Category" c
          INNER JOIN "CategoryDescendants" cd ON c."parentCategoryId" = cd."categoryId"
        )
        SELECT "categoryId" FROM "CategoryDescendants";
      `;
      
      const idList = allCategoryIds.map(c => c.categoryId);

      // 3. Add the complete list of IDs to the 'where' clause
      // If idList is empty (no categories found), this will correctly return no products.
      where.categoryId = {
        in: idList,
      };
    }
    // --- End of Category Filter Logic ---

    // --- Build OrderBy Clause ---
    switch (sortBy) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "newest":
        // Assuming you add a 'createdAt' field to your Product model
        // orderBy = { createdAt: 'desc' };
        break;
      case "rating":
        // This requires a more complex query, so we'll sort later
        break;
      default:
        orderBy = { name: "asc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { categoryName: true },
        },
        reviews: {
          // Include reviews to calculate rating
          select: { rating: true },
        },
      },
    });

    // --- Calculate ratings and transform data ---
    const productsWithRatings = products.map((p) => {
      const totalRating = p.reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const rating = p.reviews.length > 0 ? totalRating / p.reviews.length : 0;

      return {
        id: p.productId,
        name: p.name,
        price: parseFloat(p.price), 
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        image: p.imageUrls[0] || null,
        rating: parseFloat(rating.toFixed(1)),
        reviews: p.reviews.length,
        category: p.category?.categoryName || "Uncategorized",
        description: p.description,
      };
    });

    // Sort by rating if requested
    if (sortBy === "rating") {
      productsWithRatings.sort((a, b) => b.rating - a.rating);
    }

    res.json(productsWithRatings);
  } catch (e) {
    console.error("Failed to fetch products:", e);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 2. GET /products/:id (For ProductDetails page)
// --- THIS ROUTE IS UNCHANGED, BUT INCLUDES THE FIXES WE DISCUSSED EARLIER ---
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
        reviews: {
          // Include reviews to calculate rating
          select: { rating: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate rating
    const totalRating = product.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    const rating =
      product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
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
      rating: parseFloat(rating.toFixed(1)),
      reviews: product.reviews.length,
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