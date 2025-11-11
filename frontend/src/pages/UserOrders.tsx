import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';

// Define types for our data
interface Product {
  name: string;
  imageUrls: string[];
}
interface OrderItem {
  product: Product;
  quantity: number;
}
interface Order {
  order_id: string;
  order_date: string;
  status: string;
  amount: number;
  items: OrderItem[];
}

// Map DB status to a display config
const getStatusConfig = (status: string) => {
  if (status === 'PENDING') {
    return { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' };
  }
  if (status === 'PROCESSING') {
    return { label: 'Processing', icon: Clock, color: 'bg-blue-100 text-blue-800' };
  }
  if (status === 'SHIPPED') {
    return { label: 'Shipped', icon: Truck, color: 'bg-blue-100 text-blue-800' };
  }
  if (status === 'DELIVERED') {
    return { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' };
  }
  return { label: status, icon: Package, color: 'bg-gray-100 text-gray-800' };
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
      const user = JSON.parse(userString);
      if (!user.userId) {
        setLoading(false);
        return;
      }
      
      try {
        // This route already exists in your orderRouter.js
        const response = await fetch(`http://localhost:3000/orders/byBuyer?buyerId=${user.userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
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
    return <div className="p-6 text-center text-gray-600">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="p-6 text-center text-gray-600">You haven't placed any orders yet.</div>;
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const status = getStatusConfig(order.status);
        const StatusIcon = status.icon;
        
        return (
          <div key={order.order_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Order #{order.order_id.substring(0, 8)}...</h3>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.order_date).toLocaleDateString()}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
            
            <div className="space-y-4 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img 
                    src={item.product.imageUrls[0]} 
                    alt={item.product.name} 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="text-xl font-bold text-gray-900">${parseFloat(order.amount.toString()).toFixed(2)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserOrders;