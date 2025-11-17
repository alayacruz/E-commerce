import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter,
  Grid2x2 as Grid,
  List,
  Star,
  ChevronDown,
  Loader2,
  Package,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  description: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Newest First" },
];

const ProductListings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const PRODUCTS_PER_PAGE = 9;

  const categoryIdUrlParam = searchParams.get("categoryId");
  const searchQuery = searchParams.get("search");

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/category");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, sortBy, priceRange]);

// 3. Sync URL category param with state
useEffect(() => {
  // Check if we have the ID from the URL AND the category list has finished loading
  if (categoryIdUrlParam && categories.length > 0) {
    // Find the full category object that matches the ID from the URL
    const matchingCategory = categories.find(
      (cat) => cat.categoryId === parseInt(categoryIdUrlParam)
    );

    if (matchingCategory) {
      // Set the state using the NAME, because the rest of your
      // component (checkboxes, filters) is built to use names.
      setSelectedCategories([matchingCategory.categoryName]);
    }
  }
  // This effect must run when the URL param changes OR when the categories finish loading
}, [categoryIdUrlParam, categories]);

  // 4. Main Fetch Products Effect (UNIFIED)
  // ========== MAIN CHANGE: Modified fetch products effect ==========
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // CHANGE 1: If there's a search query, use the Elasticsearch search endpoint
        if (searchQuery && searchQuery.trim()) {
          const response = await fetch("http://localhost:3000/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ searchStr: searchQuery.trim() }),
          });

          if (!response.ok) {
            throw new Error("Failed to perform search. Check the backend API.");
          }

          let searchResults = await response.json();

          // CHANGE 2: Map backend response to frontend Product interface
          // Backend returns: productId, name, description, price, availableQuantity, imageUrls, etc.
          let mappedProducts = searchResults.map((p: any) => ({
            id: p.productId,
            name: p.name,
            price: parseFloat(p.price),
            originalPrice: p.originalPrice
              ? parseFloat(p.originalPrice)
              : undefined,
            image: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : "",
            rating: p.rating || 0,
            reviews: p.reviewCount || 0,
            category: p.category || "",
            description: p.description || "",
          }));

          // CHANGE 3: Apply client-side filtering for categories and price range
          if (selectedCategories.length > 0) {
            mappedProducts = mappedProducts.filter((p: Product) =>
              selectedCategories.includes(p.category)
            );
          }

          mappedProducts = mappedProducts.filter(
            (p: Product) => p.price >= priceRange[0] && p.price <= priceRange[1]
          );

          // CHANGE 4: Apply client-side sorting
          switch (sortBy) {
            case "price-low":
              mappedProducts.sort(
                (a: Product, b: Product) => a.price - b.price
              );
              break;
            case "price-high":
              mappedProducts.sort(
                (a: Product, b: Product) => b.price - a.price
              );
              break;
            case "rating":
              mappedProducts.sort(
                (a: Product, b: Product) => b.rating - a.rating
              );
              break;
            // 'featured' and 'newest' keep the default order from search
          }

          // CHANGE 5: Apply client-side pagination
          const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
          const endIndex = startIndex + PRODUCTS_PER_PAGE;
          const paginatedProducts = mappedProducts.slice(startIndex, endIndex);

          setProducts(paginatedProducts);
          setTotalProducts(mappedProducts.length);
          setTotalPages(Math.ceil(mappedProducts.length / PRODUCTS_PER_PAGE));
        } else {
          // CHANGE 6: If no search query, use the existing /products endpoint
          const params = new URLSearchParams();
          if (selectedCategories.length > 0)
            params.append("categories", selectedCategories.join(","));
          params.append("sortBy", sortBy);
          params.append("priceMin", String(priceRange[0]));
          params.append("priceMax", String(priceRange[1]));
          params.append("page", String(currentPage));
          params.append("limit", String(PRODUCTS_PER_PAGE));

          const response = await fetch(
            `http://localhost:3000/products?${params.toString()}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch products. Check the backend API.");
          }

          const data = await response.json();
          setProducts(data.products);
          setTotalPages(data.totalPages);
          setTotalProducts(data.totalProducts);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategories, sortBy, priceRange, currentPage]);
  // ========== END OF MAIN CHANGE ==========

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCategories.length === 1
              ? `${selectedCategories[0]} Products`
              : selectedCategories.length > 1
              ? "Filtered Products"
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : "All Products"}
          </h1>
          <p className="text-gray-600">
            {loading ? "Loading..." : `${totalProducts} products found`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-lg mb-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown
                className={`w-4 h-4 ml-auto transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className={`space-y-6 ${showFilters || "hidden lg:block"}`}>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Categories
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {categories.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Loading categories...
                    </p>
                  )}
                  {categories.map((cat) => (
                    <label
                      key={cat.categoryId}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.categoryName)}
                        onChange={() => handleCategoryChange(cat.categoryName)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700 text-sm">
                        {cat.categoryName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Loading and Error UI */}
            {loading && (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Error</h3>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}

            {/* Products */}
            {!loading && !error && products.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <div
                      className={
                        viewMode === "list"
                          ? "w-64 flex-shrink-0 h-48"
                          : "aspect-square"
                      }
                    >
                      <img
                        src={
                          product.image ||
                          "https://via.placeholder.com/400?text=No+Image"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      {viewMode === "list" && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-auto">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {product.rating}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400 ml-2">
                            ({product.reviews} reviews)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <>
                                <span className="text-sm text-gray-400 line-through">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  {Math.round(
                                    ((product.originalPrice - product.price) /
                                      product.originalPrice) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && products.length > 0 && (
              <div className="flex justify-between items-center space-x-2 mt-12 border-t pt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListings;
