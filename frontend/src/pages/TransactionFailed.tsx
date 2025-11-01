import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';

function TransactionFailed() {
  const errorMessage = new URLSearchParams(window.location.search).get('error') ||
    'Your payment could not be processed at this time.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>

        <p className="text-gray-600 mb-6">
          We couldn't process your payment. Please try again.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-red-800">{errorMessage}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-gray-900 mb-2">Common issues:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Insufficient funds</li>
            <li>• Incorrect card details</li>
            <li>• Card expired or blocked</li>
            <li>• Network connection issues</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Shop
          </button>

          <button
            onClick={() => window.location.href = '/support'}
            className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionFailed;
