import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";

const HomePage: React.FC = () => {
  const categories = [
    {
      id: 1,
      name: "Electronics",
      image:
        "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 2,
      name: "Fashion",
      image:
        "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 3,
      name: "Home & Garden",
      image:
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 4,
      name: "Sports",
      image:
        "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 5,
      name: "Books",
      image:
        "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 6,
      name: "Beauty",
      image:
        "https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 199,
      originalPrice: 299,
      image:
        "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 4.5,
      reviews: 1234,
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 249,
      originalPrice: 349,
      image:
        "https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 4.8,
      reviews: 892,
    },
    {
      id: 3,
      name: "Laptop Stand",
      price: 89,
      originalPrice: 129,
      image:
        "https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 4.3,
      reviews: 567,
    },
    {
      id: 4,
      name: "Coffee Maker",
      price: 159,
      originalPrice: 199,
      image:
        "https://images.pexels.com/photos/7543663/pexels-photo-7543663.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 4.6,
      reviews: 345,
    },
  ];

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
            Get amazing offers on electronics, fashion, and more. Don’t miss out
            — limited time only!
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.name.toLowerCase()}`}
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
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Hand-picked deals just for you
              </p>
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
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
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
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="text-sm font-semibold text-green-600">
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
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
