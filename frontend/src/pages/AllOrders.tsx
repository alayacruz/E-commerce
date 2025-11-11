import React, { useState, useEffect } from 'react'; // ✅ Need to import useEffect
import { Package, Clock, Truck, XCircle, MoreVertical, User, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';
import Footer_seller from '../components/Footer_seller';
import BottomNav from '../components/BottomNav';
import Header_seller from '../components/Header_seller';

interface AllOrdersProps {
  onNavigate: (page: string) => void;
}

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'cancelled' | 'delivered';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Clock },
  SHIPPED: { label: 'Shipped', color: 'bg-blue-100 text-blue-800', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AllOrders({ onNavigate }: AllOrdersProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]); // State for real orders
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      const userString = localStorage.getItem("user");
      if (!userString) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userString);
      const currentSellerId = user.userId;
      if (!currentSellerId) {
        setLoading(false);
        return;
      }
      
      setSellerId(currentSellerId); 

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/orders/bySeller?sellerId=${currentSellerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerOrders();
  }, []);

  const updateLocalOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleConfirmOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to confirm this order? This will notify the buyer.")) return;

    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}/confirm`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to confirm order');
      }
      // Update state locally
      updateLocalOrderStatus(orderId, 'PROCESSING');
    } catch (error) {
      console.error(error);
      alert('Failed to confirm order.');
    }
    setOpenMenu(null);
  };

  const handleShipOrder = async (orderId: string) => {
    const carrier = prompt("Please enter the shipping carrier (e.g., FedEx, UPS):");
    if (!carrier) return;
    const trackingNumber = prompt("Please enter the tracking number:");
    if (!trackingNumber) return;

    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}/ship`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier, trackingNumber, sellerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to ship order');
      }
      // Update state locally
      updateLocalOrderStatus(orderId, 'SHIPPED');
    } catch (error) {
      console.error(error);
      alert('Failed to ship order.');
    }
    setOpenMenu(null);
  };

  const handleDeliverOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to mark this order as delivered? This will notify the buyer.")) return;

    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}/deliver`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to update order to delivered');
      }
      // Update state locally
      updateLocalOrderStatus(orderId, 'DELIVERED');
    } catch (error) {
      console.error(error);
      alert('Failed to update order to delivered.');
    }
    setOpenMenu(null);
  };
  
  // ✅ FIX: Use 'orders' state and uppercase statuses
  const filterTabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'PENDING', label: 'Pending', count: orders.filter(o => o.status === 'PENDING').length },
    { id: 'PROCESSING', label: 'Processing', count: orders.filter(o => o.status === 'PROCESSING').length },
    { id: 'SHIPPED', label: 'Shipped', count: orders.filter(o => o.status === 'SHIPPED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length },
  ];

  // ✅ FIX: Use 'orders' state, not dummyOrders
  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(order => order.status === activeFilter);

  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header_seller onNavigate={onNavigate} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <p className="text-center text-gray-600">Loading orders...</p>
        </main>
        <Footer_seller />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header_seller onNavigate={onNavigate} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 w-full">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">All Orders</h2>
          <p className="text-gray-600 mt-2">Manage and track your orders</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeFilter === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeFilter === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => {
            // Your backend filters items, so we can safely show the first
            const firstItem = order.items[0]; 
            const config = statusConfig[order.status] || { label: order.status, icon: Package, color: 'bg-gray-100' };
            const StatusIcon = config.icon;

            return (
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={firstItem.product.imageUrls[0]}
                      alt={firstItem.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {firstItem.product.name}
                          {order.items.length > 1 && ` (+ ${order.items.length - 1} more)`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Order ID: {order.order_id.substring(0, 8)}...</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-900">${parseFloat(order.amount).toFixed(2)}</span>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === order.order_id ? null : order.order_id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          {openMenu === order.order_id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                                View Details
                              </button>
                              
                              {/* ✅ Add OnClick Handlers */}
                              {order.status === 'PENDING' && (
                                <button 
                                  onClick={() => handleConfirmOrder(order.order_id)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-green-600 font-medium">
                                  Confirm Order
                                </button>
                              )}
                              {order.status === 'PROCESSING' && (
                                <button 
                                  onClick={() => handleShipOrder(order.order_id)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-blue-600 font-medium">
                                  Ship Order
                                </button>
                              )}
                              {order.status === 'SHIPPED' && (
                                <button 
                                  onClick={() => handleDeliverOrder(order.order_id)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-blue-600 font-medium">
                                  Delivered
                                </button>
                              )}
                              
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                                Contact Buyer
                              </button>
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">
                                Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(order.order_date).toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.buyer.user.first_name} {order.buyer.user.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{order.buyer.user.email_id}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          {/* Note: Address info is not in the /bySeller route. 
                              You would need to add it to the backend query if needed. */}
                          <p className="text-sm text-gray-600">Shipping info not loaded</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">There are no {activeFilter !== 'all' ? activeFilter : ''} orders at the moment.</p>
          </div>
        )}
      </main>

      <Footer_seller />
      <BottomNav onNavigate={onNavigate} currentPage="orders" />
    </div>
  );
}
