import React, { useState } from 'react';
import { MoreVertical, Package, Clock, Truck, X, Eye, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';

const AllOrders: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: 156 },
    { id: 'pending', label: 'Pending', count: 23 },
    { id: 'shipped', label: 'Shipped', count: 89 },
    { id: 'cancelled', label: 'Cancelled', count: 12 }
  ];

  const orders = [
    {
      id: 'ORD-001',
      productImage: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100',
      productTitle: 'Wireless Bluetooth Headphones',
      price: 199,
      orderId: 'SH12345678',
      time: '2 hours ago',
      status: 'pending',
      buyerName: 'John Doe',
      buyerEmail: 'john@example.com',
      buyerPhone: '+1 (555) 123-4567'
    },
    {
      id: 'ORD-002',
      productImage: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=100',
      productTitle: 'Smart Fitness Watch',
      price: 249,
      orderId: 'SH12345679',
      time: '5 hours ago',
      status: 'shipped',
      buyerName: 'Sarah Smith',
      buyerEmail: 'sarah@example.com',
      buyerPhone: '+1 (555) 987-6543'
    },
    {
      id: 'ORD-003',
      productImage: 'https://images.pexels.com/photos/7543663/pexels-photo-7543663.jpeg?auto=compress&cs=tinysrgb&w=100',
      productTitle: 'Premium Coffee Maker',
      price: 159,
      orderId: 'SH12345680',
      time: '1 day ago',
      status: 'shipped',
      buyerName: 'Mike Johnson',
      buyerEmail: 'mike@example.com',
      buyerPhone: '+1 (555) 456-7890'
    },
    {
      id: 'ORD-004',
      productImage: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100',
      productTitle: 'Designer Running Shoes',
      price: 129,
      orderId: 'SH12345681',
      time: '2 days ago',
      status: 'cancelled',
      buyerName: 'Emily Davis',
      buyerEmail: 'emily@example.com',
      buyerPhone: '+1 (555) 321-0987'
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: Clock, 
          label: 'Pending' 
        };
      case 'shipped':
        return { 
          color: 'bg-blue-100 text-blue-800', 
          icon: Truck, 
          label: 'Shipped' 
        };
      case 'cancelled':
        return { 
          color: 'bg-red-100 text-red-800', 
          icon: X, 
          label: 'Cancelled' 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800', 
          icon: Package, 
          label: 'Unknown' 
        };
    }
  };

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Orders</h1>
          <p className="text-gray-600">Manage and track all your customer orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeFilter === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeFilter === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  {/* Product Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{order.productTitle}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Order ID: {order.orderId}</span>
                        <span>•</span>
                        <span>{order.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-lg font-bold text-gray-900">${order.price}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="lg:w-64 lg:ml-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Buyer Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{order.buyerName}</p>
                        <p>{order.buyerEmail}</p>
                        <p>{order.buyerPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 lg:ml-4">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders match the selected filter.</p>
          </div>
        )}
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default AllOrders;