import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';

// --- CHANGE 1: Define what the COMPONENT will use ---
// This is the formatted data, same as before.
interface FeaturedProduct {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  rating: number;
  reviews: number;
}

// --- CHANGE 2: Define what the API actually SENDS ---
// This matches your raw backend data
interface ApiProduct {
  productId: string;
  name: string;
  price: string | number; // Prisma.Decimal often comes as a string
  originalPrice?: string | number | null;
  imageUrls: string[]; // It sends an array
  avgRating: number; // Your schema has this pre-calculated
  // NOTE: Your specific backend route does not send 'reviews' count
  // We will have to default it to 0.
}
const HomePage: React.FC = () => {
  const categories = [
    { id: 1, name: 'Electronics', image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 2, name: 'Fashion', image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 3, name: 'Home & Garden', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 4, name: 'Sports', image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 5, name: 'Books', image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 6, name: 'Beauty', image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];

  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ADD: useEffect to fetch data on component mount ---
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/products/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }

        // 1. Get the RAW data from the API
        const rawData: ApiProduct[] = await response.json();

        // 2. TRANSFORM the raw data into the format our component needs
        const formattedData: FeaturedProduct[] = rawData.map((product) => ({
          id: product.productId,
          name: product.name,
          price: parseFloat(String(product.price)),
          originalPrice: product.originalPrice ? parseFloat(String(product.originalPrice)) : null,
          image: product.imageUrls[0] || null, // <-- HERE IS THE IMAGE FIX
          rating: product.avgRating || 0,
          reviews: 0, // Your backend route doesn't send this, so we default to 0
        }));

        // 3. Save the new, formatted data to state
        setFeaturedProducts(formattedData);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Banner */}
      <section className="relative bg-[#0f2f7b] overflow-hidden">
        {/* Decorative floating elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-pink-400 rounded-full shadow-lg animate-bounce" />
        <div className="absolute bottom-0 px-30 right-[300px] w-20 h-20 bg-purple-500 rounded-full shadow-xl animate-bounce delay-200" />
        <div className="absolute top-20 right-1/3 w-10 h-10 bg-blue-700 rounded-full shadow-md animate-pulse" />
        <div className="absolute top-20  right-10 w-20 h-20 bg-red-200 rounded-full shadow-xl animate-bounce delay-200" />

        <div className="max-w-6xl mx-auto px-5 py-19 text-center relative z-10">
          {/* Headline */}
          <h2 className="text-white text-lg uppercase tracking-widest mb-4">
            Great Discount
          </h2>

          <h1 className="text-[80px] md:text-[120px] font-extrabold text-white drop-shadow-lg">
            SALE
          </h1>

          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Get amazing offers on electronics, fashion, and more. Don’t miss out — limited time only!
          </p>

          <Link
            to="/products"
            className="inline-block px-10 py-4 my-2 bg-white text-[#FFC64C] font-semibold text-lg rounded-full shadow-lg hover:bg-yellow-100 transition-transform transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>

        {/* Floating shopping cart / gifts illustration */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/1011/1011337.png"
          alt="Shopping Cart"
          className="absolute bottom-0 right-10 w-44 md:w-50 lg:w-60 drop-shadow-2xl animate-float"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/6459/6459276.png"
          alt="Gift"
          className="absolute bottom-10 left-10 w-24 md:w-28 lg:w-32 drop-shadow-2xl animate-float-slow"
        />


      </section>


      {/* Categories Section */}
      {/* <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
  key={category.id}
  to={`/products?category=${category.name}`} // <-- FIXED
  className="group"
>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-4 text-center">
                  <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-lg text-gray-600">Hand-picked deals just for you</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All
              <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center text-gray-600">
                <p>Loading featured products...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-red-600">
                <p>Error: {error}</p>
              </div>
            ) : (
              // --- UPDATE: This .map now uses the state variable ---
              featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image || 'https://via.placeholder.com/400'} // Added a fallback image
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
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
                        <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                      )}
                      {product.originalPrice && (
                        <span className="text-sm font-semibold text-green-600">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Products
              <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;