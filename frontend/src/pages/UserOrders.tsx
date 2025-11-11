import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { Star, Eye, MessageSquare, Package } from "lucide-react";

interface Phone {
  phone_no: string;
}

interface SellerUser {
  email_id: string;
  phoneNumbers: Phone[];
}

interface Seller {
  user: SellerUser;
}

interface Product {
  productId: string;
  name: string;
  imageUrls: string[];
  seller: Seller;
}

interface OrderItem {
  quantity: number;
  product: Product;
}

interface Order {
  order_id: string;
  order_date: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PAYMENT_INITIATED' | 'PAYMENT_FAILED';
  amount: number;
  items: OrderItem[];
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return { label: 'Delivered', style: 'bg-green-100 text-green-700' };
    case 'SHIPPED':
      return { label: 'Shipped', style: 'bg-blue-100 text-blue-700' };
    case 'PROCESSING':
      return { label: 'Processing', style: 'bg-orange-100 text-orange-700' };
    case 'PENDING':
      return { label: 'Pending', style: 'bg-yellow-100 text-yellow-700' };
    case 'CANCELLED':
    case 'PAYMENT_FAILED':
      return { label: 'Cancelled', style: 'bg-red-100 text-red-700' };
    default:
      return { label: status, style: 'bg-gray-100 text-gray-700' };
  }
};

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const userString = localStorage.getItem("user");
      if (!userString) {
        setLoading(false);
        return;
      }
      
      try {
        const user = JSON.parse(userString);
        const buyerId = user.userId;
        if (!buyerId) {
          throw new Error("Buyer ID not found in session.");
        }

        const response = await fetch(`http://localhost:3000/orders/byBuyer?buyerId=${buyerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch orders.");
        }
        
        const data = await response.json();
        setOrders(data);
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading your orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <Package className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        // An order might have multiple items, but we'll display
        // info based on the first item, as in your screenshot.
        const firstItem = order.items[0];
        if (!firstItem) return null; // Skip if order has no items

        const sellerUser = firstItem.product.seller?.user;
        const config = getStatusConfig(order.status);

        return (
          <div key={order.order_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Order Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Order #{order.order_id.substring(0, 8)}...
                </h3>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.order_date).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.style}`}>
                {config.label}
              </span>
            </div>

            {/* Item Details */}
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={firstItem.product.imageUrls[0]}
                  alt={firstItem.product.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{firstItem.product.name}</h4>
                  <p className="text-sm text-gray-500">Quantity: {firstItem.quantity}</p>
                  {order.items.length > 1 && (
                    <p className="text-sm text-gray-500">+ {order.items.length - 1} more item(s)</p>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ${Number(order.amount).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
              
              {/* 1. Review Product Button (Delivered Only) */}
              {order.status === 'DELIVERED' && (
                <Link
                  to={`/add-review?productId=${firstItem.product.productId}`}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Star className="w-4 h-4 mr-1.5" />
                  Review Product
                </Link>
              )}

              {/* 2. View Product Button (All Orders) */}
              <Link
                to={`/product/${firstItem.product.productId}`}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                View Product
              </Link>
              
              {/* 3. Contact Seller Button (All Orders) */}
              <button
                data-tooltip-id={`seller-tip-${order.order_id}`}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Contact Seller
              </button>

              {/* Tooltip content for the "Contact Seller" button */}
              {sellerUser ? (
                <Tooltip id={`seller-tip-${order.order_id}`} className="z-50">
                  <div className="p-1">
                    <p className="font-semibold">Seller Info</p>
                    <p>Email: {sellerUser.email_id}</p>
                    
                    {sellerUser.phoneNumbers && sellerUser.phoneNumbers.length > 0 ? (
                      sellerUser.phoneNumbers.map((phone, index) => (
                        <p key={index}>Phone: {phone.phone_no}</p>
                      ))
                    ) : (
                      <p>Phone: N/A</p>
                    )}
                  </div>
                </Tooltip>
              ) : (
                 <Tooltip id={`seller-tip-${order.order_id}`} className="z-50">
                    <p>Seller contact info not available.</p>
                 </Tooltip>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserOrders;