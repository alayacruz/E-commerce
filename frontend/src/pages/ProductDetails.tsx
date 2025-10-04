import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingCart, Minus, Plus, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const { addToCart } = useCart();

  // Mock product data
  const product = {
    id: parseInt(id || '1'),
    name: 'Wireless Bluetooth Headphones',
    price: 199,
    originalPrice: 299,
    images: [
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3394651/pexels-photo-3394651.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3394652/pexels-photo-3394652.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    rating: 4.5,
    reviews: 1234,
    description: 'Experience premium sound quality with our wireless Bluetooth headphones. Featuring advanced noise cancellation technology, 30-hour battery life, and comfortable over-ear design perfect for long listening sessions.',
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Quick charge: 10 minutes = 3 hours playback',
      'Bluetooth 5.0 connectivity',
      'Comfortable over-ear design',
      'Built-in microphone for calls',
      'Foldable design for portability'
    ],
    specifications: {
      'Driver Size': '40mm',
      'Frequency Response': '20Hz - 20kHz',
      'Impedance': '32 Ohm',
      'Weight': '250g',
      'Connectivity': 'Bluetooth 5.0, 3.5mm jack',
      'Battery': 'Li-ion 800mAh',
      'Charging': 'USB-C'
    },
    inStock: true,
    category: 'Electronics'
  };

  const reviews = [
    {
      id: 1,
      author: 'John D.',
      rating: 5,
      date: '2024-01-15',
      comment: 'Amazing sound quality and comfort. The noise cancellation works perfectly for my daily commute.',
      helpful: 24
    },
    {
      id: 2,
      author: 'Sarah M.',
      rating: 4,
      date: '2024-01-10',
      comment: 'Great headphones overall. Battery life is excellent. Only minor issue is they can feel a bit heavy after extended use.',
      helpful: 18
    },
    {
      id: 3,
      author: 'Mike R.',
      rating: 5,
      date: '2024-01-05',
      comment: 'Best purchase I\'ve made this year. Sound is crystal clear and the build quality is premium.',
      helpful: 31
    }
  ];

  const similarProducts = [
    {
      id: 2,
      name: 'Gaming Headset Pro',
      price: 149,
      image: 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.3
    },
    {
      id: 3,
      name: 'Wireless Earbuds',
      price: 99,
      image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Studio Monitor Headphones',
      price: 299,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8
    }
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]
      });
    }
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">{product.rating}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{product.reviews} reviews</span>
                <span className="text-gray-400">|</span>
                <span className="text-green-600 font-medium">In Stock</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                  <span className="text-lg font-semibold text-green-600">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isWishlisted 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {showAddedFeedback && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">Added to cart successfully!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button className="px-6 py-4 text-blue-600 border-b-2 border-blue-600 font-medium">
                  Specifications
                </button>
              
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{key}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-900">{review.author}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    Helpful ({review.helpful})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProducts.map((similarProduct) => (
              <Link
                key={similarProduct.id}
                to={`/product/${similarProduct.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={similarProduct.image}
                    alt={similarProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {similarProduct.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${similarProduct.price}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{similarProduct.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;