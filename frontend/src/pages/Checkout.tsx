import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
// import {clearCart} from '../contexts/CartContext';

// Helper function to get shipping info from localStorage
const getInitialShippingInfo = () => {
  const storedUser = localStorage.getItem('user');
  const defaults = {
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  };

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      const firstAddress = (parsedUser.addresses && parsedUser.addresses.length > 0)
        ? parsedUser.addresses[0]
        : {};
      const firstPhone = (parsedUser.phoneNumbers && parsedUser.phoneNumbers.length > 0)
        ? parsedUser.phoneNumbers[0]
        : '';

      return {
        fullName: parsedUser.username || '',
        address: firstAddress.street || '',
        city: firstAddress.city || '',
        zipCode: firstAddress.pin || '',
        phone: firstPhone || ''
      };
    } catch (e) {
      console.error("Failed to parse user data for shipping", e);
      return defaults;
    }
  }
  return defaults;
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(getInitialShippingInfo);
  
  const deliveryFee = 15;
  const discount = getTotalPrice() > 200 ? 15 : 0;
  const finalTotal = getTotalPrice() + deliveryFee - discount;

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      // 1. Get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert("You must be logged in to place an order.");
        setIsLoading(false);
        return;
      }

      // 2. Safely get the buyerId
      let buyerId: string | undefined;
      let userType: string | undefined;
      try {
        const parsedUser = JSON.parse(storedUser);
        buyerId = parsedUser.userId; 
        userType = parsedUser.userType;
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }

      if (userType === 'seller') {
        alert("Seller accounts cannot place orders. Please log in as a Buyer.");
        setIsLoading(false);
        return;
      }

      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!buyerId || !uuidRegex.test(buyerId) || userType !== 'buyer') {
        alert("Your user session is invalid or expired. Please log out and log back in as a Buyer.");
        setIsLoading(false);
        return;
      }
      // --- END OF NEW CHECK ---

      // 4. Define URLs for PayPal
      const returnUrl = `${window.location.origin}/order-confirmed`;
      const cancelUrl = `${window.location.origin}/order-failed`;

      // 5. Create the order payload
      const orderPayload = {
        buyerId: buyerId, 
        paymentMethod: paymentMethod === 'cod' ? 'CoD' : 'PayPal',
        amount: finalTotal,
        shippingInfo: shippingInfo,
        returnUrl: returnUrl,
        cancelUrl: cancelUrl,
      };

      // 6. Call the backend
      const response = await fetch('http://localhost:3000/orders/createFromCart', { // Corrected to /orders
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const newOrderData = await response.json();

      if (!response.ok) {
        throw new Error(newOrderData.error || "Failed to place order.");
      }

      // 7. Handle success
      if (response.status === 201) { // CoD
        console.log("CoD Order placed:", newOrderData.order);
        clearCart();
        navigate('/order-confirmed', {
          state: {
            order: newOrderData.order,
            items: cartItems,
            shippingInfo: shippingInfo,
          } 
        });
      
      } else if (response.status === 202) { // PayPal
        console.log("PayPal order created, redirecting...");
        clearCart();
        window.location.href = newOrderData.approval_url;
      }

    } catch (error: any) {
      console.error("Failed to place order:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="mt-6 flex items-center">
            {[
              { step: 1, title: 'Shipping' },
              { step: 2, title: 'Payment' },
              { step: 3, title: 'Review' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= item.step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {item.step}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{item.title}</span>
                {index < 2 && (
                  <div
                    className={`ml-4 mr-4 flex-1 h-0.5 ${
                      currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Shipping Information */}
            {currentStep >= 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  )}
                </div>

                {currentStep === 1 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.fullName}
                          onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{shippingInfo.fullName}</p>
                    <p className="text-gray-600">{shippingInfo.address}</p>
                    <p className="text-gray-600">{shippingInfo.city}, {shippingInfo.zipCode}</p>
                    <p className="text-gray-600">{shippingInfo.phone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep >= 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  {currentStep > 2 && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  )}
                </div>

                {currentStep === 2 ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <Truck className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Cash on Delivery</div>
                          <div className="text-sm text-gray-600">Pay when your order arrives</div>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="Paypal"
                          checked={paymentMethod === 'Paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Paypal</div>
                          <div className="text-sm text-gray-600">Pay with your Paypal account</div>
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={() => setCurrentStep(3)}
                      className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Review Order
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paypal'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {paymentMethod === 'cod' 
                        ? 'Pay when your order arrives' 
                        : 'Pay with your Paypal account'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                      <img
                        src={item.product.imageUrls[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  {isLoading ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">🚚 Expected delivery: 3-5 business days</p>
                <p>📦 Free returns within 10 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


