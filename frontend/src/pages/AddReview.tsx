import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';

// Interface for product (adjust if needed)
interface Product {
  productId: string;
  name: string;
  price: number;
  imageUrls: string[];
}

export function AddReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    comment: '',
  });

  const [errors, setErrors] = useState({
    title: '',
    comment: '',
  });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) {
      navigate('/profile'); // Go back to profile if no ID
      return;
    }

    try {
      // Fetch product details from YOUR backend
      const response = await fetch(`http://localhost:3000/products/${productId}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/profile'); // Go back if product fails to load
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Simplified validation (removed userName and email)
    const newErrors = { title: '', comment: '' };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Review title is required';
      isValid = false;
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
      isValid = false;
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Review text is required';
      isValid = false;
    } else if (formData.comment.length < 20) {
      newErrors.comment = 'Review must be at least 20 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get userId from localStorage
    const userString = localStorage.getItem('user');
    if (!userString) {
      alert('You must be logged in to leave a review.');
      return;
    }
    const user = JSON.parse(userString);
    const userId = user.userId;
    if (!userId) {
       alert('Invalid user session. Please log in again.');
       return;
    }

    if (!validateForm() || !productId) {
      return;
    }

    setSubmitting(true);

    try {
      // Submit review to YOUR backend
      const response = await fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          userId: userId,
          rating: rating,
          title: formData.title,
          comment: formData.comment,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Success! Go back to the orders page.
      navigate('/profile', { state: { defaultTab: 'orders' } });

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review-page...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Product not found...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/profile', { state: { defaultTab: 'orders' } })}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-12">
            <h1 className="text-3xl font-bold text-white mb-2">Write a Review</h1>
            <p className="text-gray-300">Share your experience with this product</p>
          </div>

          <div className="p-8">
            <div className="mb-8 pb-8 border-b border-gray-200 flex items-start gap-6">
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h2>
                <p className="text-gray-600">${product.price.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  How would you rate this product?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={
                          star <= (hoveredRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 1 && 'Poor - Would not recommend'}
                  {rating === 2 && 'Fair - Has some issues'}
                  {rating === 3 && 'Good - Meets expectations'}
                  {rating === 4 && 'Very Good - Recommended'}
                  {rating === 5 && 'Excellent - Satisfieed, Highly recommended'}
                </p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  Review Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Summarize your experience in a few words"
                  maxLength={100}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                    errors.title
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                <div className="flex justify-between items-start mt-1">
                  {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
                  <p className="text-gray-500 text-sm ml-auto">{formData.title.length}/100</p>
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Review *
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Tell us about your experience with this product..."
                  rows={6}
                  maxLength={2000}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none resize-none ${
                    errors.comment
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                <div className="flex justify-between items-start mt-1">
                  {errors.comment && <p className="text-red-600 text-sm">{errors.comment}</p>}
                  <p className="text-gray-500 text-sm ml-auto">{formData.comment.length}/2000</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile', { state: { defaultTab: 'orders' } })}
                  className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}