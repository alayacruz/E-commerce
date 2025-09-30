import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Grid2x2 as Grid, List, Star, ChevronDown } from 'lucide-react';

const ProductListings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Beauty',
    'Automotive',
    'Toys'
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'newest', label: 'Newest First' },
  ];

  const allProducts = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 199,
      originalPrice: 299,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.5,
      reviews: 1234,
      category: 'Electronics',
      description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.'
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      price: 249,
      originalPrice: 349,
      image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 892,
      category: 'Electronics',
      description: 'Advanced fitness tracking with heart rate monitor and GPS.'
    },
    {
      id: 3,
      name: 'Adjustable Laptop Stand',
      price: 89,
      originalPrice: 129,
      image: 'https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.3,
      reviews: 567,
      category: 'Electronics',
      description: 'Ergonomic laptop stand with adjustable height and angle.'
    },
    {
      id: 4,
      name: 'Premium Coffee Maker',
      price: 159,
      originalPrice: 199,
      image: 'https://images.pexels.com/photos/7543663/pexels-photo-7543663.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      reviews: 345,
      category: 'Home & Garden',
      description: 'Programmable coffee maker with thermal carafe and auto shut-off.'
    },
    {
      id: 5,
      name: 'Designer Running Shoes',
      price: 129,
      originalPrice: 179,
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.4,
      reviews: 678,
      category: 'Fashion',
      description: 'Lightweight running shoes with superior cushioning and breathable design.'
    },
    {
      id: 6,
      name: 'Organic Face Moisturizer',
      price: 45,
      originalPrice: 65,
      image: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviews: 892,
      category: 'Beauty',
      description: 'Natural moisturizer with organic ingredients for all skin types.'
    },
    {
      id: 7,
      name: 'Wireless Gaming Mouse',
      price: 79,
      originalPrice: 99,
      image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.5,
      reviews: 445,
      category: 'Electronics',
      description: 'High-precision gaming mouse with RGB lighting and long battery life.'
    },
    {
      id: 8,
      name: 'Yoga Mat Pro',
      price: 59,
      originalPrice: 89,
      image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      reviews: 234,
      category: 'Sports',
      description: 'Premium yoga mat with superior grip and eco-friendly materials.'
    },
  ];

  // Filter products based on search and category
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase();
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSelectedCategories = selectedCategories.length === 0 || 
      selectedCategories.includes(product.category);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesSelectedCategories && matchesPrice;
  });

  useEffect(() => {
    if (category) {
      setSelectedCategories([category.charAt(0).toUpperCase() + category.slice(1)]);
    }
  }, [category]);

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
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 
             searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">{filteredProducts.length} products found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            {/* Mobile Filter Toggle */}
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
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{cat}</span>
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
                    max="1000"
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

            {/* Products */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
            }>
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-square'}>
                    <img
                      src={product.image}
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

            {/* Pagination */}
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