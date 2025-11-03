import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';

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
      navigate('/');
      return;
    }

    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (data) {
        setProduct(data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = { userName: '', title: '', comment: '', email: '' };
    let isValid = true;

    if (!formData.userName.trim()) {
      newErrors.userName = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

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

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert([
        {
          product_id: productId,
          user_name: formData.userName,
          user_avatar: `https://i.pravatar.cc/150?u=${formData.email}`,
          rating: rating,
          title: formData.title,
          comment: formData.comment,
          helpful_count: 0,
          verified_purchase: false,
        },
      ]);

      if (error) throw error;

      navigate(`/?tab=reviews`);
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Reviews
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-12">
            <h1 className="text-3xl font-bold text-white mb-2">Write a Review</h1>
            <p className="text-gray-300">Share your experience with this product</p>
          </div>

          <div className="p-8">
            <div className="mb-8 pb-8 border-b border-gray-200 flex items-start gap-6">
              <img
                src={product.image_url}
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
                  {rating === 5 && 'Excellent - Highly recommended'}
                </p>
              </div>

              <div>
                <label htmlFor="userName" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                    errors.userName
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.userName && <p className="text-red-600 text-sm mt-1">{errors.userName}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                    errors.email
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
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
                  onClick={() => navigate('/')}
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
