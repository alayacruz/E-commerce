import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ShoppingCart: React.FC = () => {
  // Add `loading` from the context
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, loading } = useCart();
  const navigate = useNavigate();

  const deliveryFee = cartItems.length > 0 ? 15 : 0;
  const discount = getTotalPrice() > 200 ? 20 : 0;
  const finalTotal = getTotalPrice() + deliveryFee - discount;

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  // Add a loading state for better user experience
  if (loading) {
      return <div>Loading your cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
        // --- NO CHANGES NEEDED IN EMPTY CART VIEW ---
        <div className="min-h-screen bg-gray-50 py-16">
            ...
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - NO CHANGES NEEDED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              // --- CHANGE 1: Use a unique key from the database ---
              <div key={item.cartItemId} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {/* --- CHANGE 2: Access nested product data --- */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-gray-900">${item.product.price}</span>
                          {/* `originalPrice` would need to be on your Prisma `Product` model */}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end space-y-0 sm:space-y-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          {/* --- CHANGE 3: Pass the correct ID and new quantity --- */}
                          <button
                            onClick={() => updateQuantity(item.product.productId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.productId, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.productId)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-lg font-semibold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Order Summary - NO CHANGES NEEDED */}
          <div className="lg:col-span-1">
            ...
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;