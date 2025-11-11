import { useState, useEffect } from 'react'; 
import {ArrowLeft, Package, Eye, ShoppingCart, Star, CreditCard as Edit, Trash2, AlertCircle, Loader2, MessageSquare} from 'lucide-react';

interface Product {
  id: string; 
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  imageUrls: string[]; 
  views: number;
  sales: number;
  description: string; 
  rating?: number;
  reviews?: number;
}

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface Review {
  id: string;
  user: {
    first_name: string; 
    last_name: string | null;
  };
  rating: number;
  createdAt: string;
  title: string;
  comment: string;
}

export default function ProductDetail({ product, onBack, onEdit, onDelete }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product.id) return; 

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3000/reviews/product/${product.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch reviews for this product');
        }
        const data = await res.json();
        setReviews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [product.id]);

  const defaultDescription = `${product.name} is a premium quality product designed to meet your needs. This product features excellent build quality and reliable performance. Perfect for both personal and professional use.`;
  const description = product.description || defaultDescription;
  const rating = product.rating || 4.5;
  const reviewsCount = product.reviews || Math.floor(product.sales * 0.6);
  const originalPrice = product.originalPrice || product.price * 1.2;
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 17;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* img gallery */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.imageUrls[selectedImage] || 'https://via.placeholder.com/800?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.imageUrls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImage === index 
                        ? 'ring-2 ring-blue-500 opacity-100' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full font-medium mb-3">
                      {product.category}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{rating}</span>
                        <span>({reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <span className="text-gray-500 line-through text-xl">${originalPrice.toFixed(2)}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">{discount}% OFF</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Package className="w-5 h-5" />
                      <span className="text-sm">Stock</span>
                    </div>
                    <p className={`text-xl font-bold ${product.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm">Views</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{product.views}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="text-sm">Sold</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{product.sales}</p>
                  </div>
                </div>
                {product.stock < 20 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium">Low Stock Alert</p>
                      <p className="text-red-600 text-sm">Only {product.stock} items remaining. Consider restocking soon.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">${(product.price * product.sales).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{((product.sales / (product.views || 1)) * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Conversion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{Math.floor(product.views / 30)}</p>
                    <p className="text-sm text-gray-600">Daily Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{rating}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Product
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
            
            {loading && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="ml-3 text-gray-600">Loading reviews...</p>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-10">
                <MessageSquare className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-red-700">Error</h4>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && reviews.length === 0 && (
              <div className="text-center py-10">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800">No Reviews Yet</h4>
                <p className="text-gray-500">When a customer reviews this product, it will appear here.</p>
              </div>
            )}

            {/* Reviews List */}
            {!loading && !error && reviews.length > 0 && (
              <div className="space-y-6">
                {reviews.map((review) => {
                  // Compute the username just like in your auth routes
                  const username = review.user.last_name
                    ? `${review.user.first_name} ${review.user.last_name}`
                    : review.user.first_name;

                  return (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          {/* Use the computed username variable */}
                          <span className="font-medium text-gray-900">{username}</span> 
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
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 text-lg mb-1">{review.title}</h4>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
      </div>
    </div>
  );
}