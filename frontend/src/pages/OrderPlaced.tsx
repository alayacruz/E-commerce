import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, Package, Home } from 'lucide-react';

const OrderPlaced: React.FC = () => {
  const orderNumber = 'SH' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center animate-bounce">
                <Package className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Thank you for shopping with us. Your order has been confirmed 
              and is being prepared for shipment.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium text-gray-900">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium text-green-600">Confirmed</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Information</h3>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-gray-600 text-sm">Expected Delivery</p>
                    <p className="font-semibold text-gray-900">
                      {deliveryDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Tracking</h3>
              <p className="text-gray-600 text-sm">
                Track your order in real-time from our warehouse to your doorstep
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">
                All products are quality checked before shipping to ensure satisfaction
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe Delivery</h3>
              <p className="text-gray-600 text-sm">
                Contactless delivery available with real-time updates
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
            >
              <Package className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
            <div className="text-left space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-600">You'll receive an email confirmation with your order details</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-600">We'll send you tracking information once your order ships</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-600">Your order will be delivered within 3-5 business days</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Need help? Contact our customer support at support@shophub.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;