import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

function TransactionSuccess() {
  const orderNumber = new URLSearchParams(window.location.search).get('order') || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and is being prepared for the shipment. 
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Order Number</p>
          <p className="text-xl font-semibold text-gray-900">{orderNumber}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/orders'}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            View Order Details
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default TransactionSuccess;
