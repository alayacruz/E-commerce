import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Grid2x2 as Grid, List, Star, ChevronDown, Loader2, Package } from 'lucide-react';

// Define type for fetched products
interface Product {
  id: string; 
  name: string;
  price: number;
  originalPrice?: number;
  image: string; // This will be the full Cloudinary URL
  rating: number;
  reviews: number; // This is the review *count*
  category: string;
  description: string;
}

// Define type for fetched categories
interface Category {
  categoryId: number;
  categoryName: string;
}

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'newest', label: 'Newest First' },
];

const ProductListings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // State for fetched data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryUrlParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  // Effect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use the route you already have
        const response = await fetch('http://localhost:3000/category'); 
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Effect to set initial category filter from URL
  useEffect(() => {
    if (categoryUrlParam) {
      const foundCategory = categories.find(c => c.categoryName.toLowerCase() === categoryUrlParam.toLowerCase());
      if (foundCategory) {
        setSelectedCategories([foundCategory.categoryName]);
      }
    } else {
      setSelectedCategories([]);
    }
  }, [categoryUrlParam, categories]);

  // Effect to fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategories.length > 0) params.append('categories', selectedCategories.join(','));
        params.append('sortBy', sortBy);
        params.append('priceMin', String(priceRange[0]));
        params.append('priceMax', String(priceRange[1]));

        // Use the new public product router
        const response = await fetch(`http://localhost:3000/products?${params.toString()}`); 
        if (!response.ok) {
          throw new Error('Failed to fetch products. Check the backend API.');
        }
        
        const data = await response.json();
        setProducts(data);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchQuery, selectedCategories, sortBy, priceRange]);
  

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryUrlParam ? `${categoryUrlParam.charAt(0).toUpperCase() + categoryUrlParam.slice(1)} Products` :
             searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${products.length} products found`}
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
              <ChevronDown className={`w-4 h-4 ml-auto transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className={`space-y-6 ${showFilters || 'hidden lg:block'}`}>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.length === 0 && <p className="text-sm text-gray-500">Loading...</p>}
                  {categories.map((cat) => (
                    <label key={cat.categoryId} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.categoryName)}
                        onChange={() => handleCategoryChange(cat.categoryName)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{cat.categoryName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="1000" // You can make this dynamic
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query.</p>
              </div>
            )}

            {/* Products */}
            {!loading && !error && products.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
              }>
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-square'}>
                      <img
                        src={product.image || 'https://via.placeholder.com/400?text=No+Image'} // Use Cloudinary URL
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      {viewMode === 'list' && (
                        <p className="text-gray-600 mb-4">{product.description}</p>
                      )}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-400 ml-2">({product.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                            <span className="text-sm font-semibold text-green-600">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination (Hardcoded, as backend doesn't support it yet) */}
            <div className="flex justify-center items-center space-x-2 mt-12">
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700">Previous</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">2</button>
              <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">3</button>
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListings;
