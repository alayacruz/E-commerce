import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  MapPin,
  CreditCard,
  Download,
  Share2,
  Star,
} from "lucide-react";

const getTrackingSteps = (status: string) => {
  const steps = [
    {
      id: 1,
      title: "Order Confirmed",
      description: "Your order has been received.",
      completed: false,
      current: false,
    },
    {
      id: 2,
      title: "Processing",
      description: "Your order is being prepared by the seller.",
      completed: false,
      current: false,
    },
    {
      id: 3,
      title: "Shipped",
      description: "Your order is on its way.",
      completed: false,
      current: false,
    },
    {
      id: 4,
      title: "Delivered",
      description: "Your order has been delivered.",
      completed: false,
      current: false,
    },
  ];

  if (status === "PENDING" || status === "PAYMENT_INITIATED") {
    steps[0].current = true;
  } else if (status === "PROCESSING") {
    steps[0].completed = true;
    steps[1].current = true;
  } else if (status === "SHIPPED") {
    steps[0].completed = true;
    steps[1].completed = true;
    steps[2].current = true;
  } else if (status === "DELIVERED") {
    steps.forEach((step) => (step.completed = true));
  } else {
    //cncelled
    steps[0].current = true;
  }

  return steps;
};

const OrderConfirmed: React.FC = () => {
  const location = useLocation();
  const { order, items, shippingInfo } = location.state || {};
  const [orderDetails] = useState({
    orderNumber: order?.order_id || "N/A",
    orderDate: order?.order_date || new Date().toISOString(),
    estimatedDelivery: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    total: Number(order?.amount || 0),
    items: items || [],
    shippingAddress: {
      name: shippingInfo?.fullName || "N/A",
      address: shippingInfo?.address || "N/A",
      city: shippingInfo?.city || "N/A",
      zipCode: shippingInfo?.zipCode || "N/A",
      phone: shippingInfo?.phone || "N/A",
    },
    paymentMethod:
      order?.paymentMethod === "CoD" ? "Cash on Delivery" : "PayPal",
    status: order?.status || "PENDING",
  });

  const trackingSteps = getTrackingSteps(orderDetails.status);

  const handleTrackOrders = () => {
    navigate("/profile", { state: { defaultTab: "orders" } });
  };

  const handleDownloadInvoice = () => {
    alert("Invoice download functionality is not implemented yet.");
    // yet to be done 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center animate-bounce">
                <Package className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Order Confirmed! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for your purchase! Your order{" "}
            <span className="font-semibold text-blue-600">
              #{orderDetails.orderNumber}
            </span>{" "}
            has been confirmed and is being processed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Order #{orderDetails.orderNumber}
                </h2>
                <p className="text-blue-100">
                  Placed on{" "}
                  {new Date(orderDetails.orderDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-3xl font-bold">
                  ${orderDetails.total.toFixed(2)}
                </p>
                <p className="text-blue-100">
                  {orderDetails.items.length} items
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Items Ordered
              </h3>
              <div className="space-y-4">
                {orderDetails.items.map((item: any) => (
                  <div
                    key={item.cartItemId || item.product.productId}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.product.imageUrls[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.product.name}
                      </h4>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Delivery Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {orderDetails.shippingAddress.name}
                  </p>
                  <p className="text-gray-600">
                    {orderDetails.shippingAddress.address}
                  </p>
                  <p className="text-gray-600">
                    {orderDetails.shippingAddress.city},{" "}
                    {orderDetails.shippingAddress.zipCode}
                  </p>
                  <p className="text-gray-600">
                    {orderDetails.shippingAddress.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Method
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {orderDetails.paymentMethod}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Payment will be collected upon delivery
                  </p>
                </div>
              </div>
            </div>

            {/* Expected Delivery */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Expected Delivery
                    </h3>
                    <p className="text-blue-600 font-medium">
                      {new Date(
                        orderDetails.estimatedDelivery
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Order Tracking */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Order Tracking
          </h3>
          <div className="space-y-4">
            {/* This map will now work! */}
            {trackingSteps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-green-600"
                      : step.current
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {step.id}
                    </span>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h4
                    className={`font-medium ${
                      step.current ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {step.current && (
                  <div className="flex-shrink-0">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Invoice
          </button>
          <button className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105">
            <Share2 className="w-5 h-5 mr-2" />
            Share Order
          </button>
          <button
            onClick={handleTrackOrders}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
          >
            <Package className="w-5 h-5 mr-2" />
            Track All Orders
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            What happens next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Order Processing
              </h4>
              <p className="text-gray-600 text-sm">
                We'll prepare your items with care and quality check each
                product
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Shipping Updates
              </h4>
              <p className="text-gray-600 text-sm">
                You'll receive real-time tracking information via email and SMS
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Rate & Review</h4>
              <p className="text-gray-600 text-sm">
                Share your experience to help other customers make informed
                decisions
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help with your order? Contact our customer support at{" "}
            <a
              href="mailto:support@shophub.com"
              className="text-blue-600 hover:underline"
            >
              support@shophub.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:+15551234567"
              className="text-blue-600 hover:underline"
            >
              +1 (555) 123-4567
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;
