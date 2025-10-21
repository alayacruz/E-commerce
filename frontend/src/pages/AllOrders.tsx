import { useState } from 'react';
import { Package, Clock, Truck, XCircle, MoreVertical, User, MapPin, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

interface AllOrdersProps {
  onNavigate: (page: string) => void;
}

type OrderStatus = 'all' | 'pending' | 'shipped' | 'cancelled';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-800', icon: Truck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: Package },
};

const dummyOrders = [
  {
    id: 'ORD-12345',
    product: 'Wireless Headphones',
    price: 89.99,
    status: 'pending' as const,
    buyer: 'John Smith',
    buyerEmail: 'john@example.com',
    address: '123 Main St, New York, NY 10001',
    time: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
  },
  {
    id: 'ORD-12346',
    product: 'Smart Watch Pro',
    price: 299.99,
    status: 'shipped' as const,
    buyer: 'Emma Wilson',
    buyerEmail: 'emma@example.com',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    time: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
  },
  {
    id: 'ORD-12347',
    product: 'Laptop Stand',
    price: 49.99,
    status: 'delivered' as const,
    buyer: 'Michael Brown',
    buyerEmail: 'michael@example.com',
    address: '789 Pine Rd, Chicago, IL 60601',
    time: '1 day ago',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
  },
  {
    id: 'ORD-12348',
    product: 'Mechanical Keyboard',
    price: 149.99,
    status: 'cancelled' as const,
    buyer: 'Sarah Davis',
    buyerEmail: 'sarah@example.com',
    address: '321 Elm St, Houston, TX 77001',
    time: '2 days ago',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200&h=200&fit=crop',
  },
  {
    id: 'ORD-12349',
    product: 'Wireless Mouse',
    price: 29.99,
    status: 'pending' as const,
    buyer: 'David Martinez',
    buyerEmail: 'david@example.com',
    address: '654 Maple Dr, Phoenix, AZ 85001',
    time: '3 hours ago',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&h=200&fit=crop',
  },
  {
    id: 'ORD-12350',
    product: 'USB-C Hub',
    price: 79.99,
    status: 'shipped' as const,
    buyer: 'Lisa Anderson',
    buyerEmail: 'lisa@example.com',
    address: '987 Cedar Ln, Seattle, WA 98101',
    time: '6 hours ago',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=200&h=200&fit=crop',
  },
];

export default function AllOrders({ onNavigate }: AllOrdersProps) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filterTabs = [
    { id: 'all' as const, label: 'All Orders', count: dummyOrders.length },
    { id: 'pending' as const, label: 'Pending', count: dummyOrders.filter(o => o.status === 'pending').length },
    { id: 'shipped' as const, label: 'Shipped', count: dummyOrders.filter(o => o.status === 'shipped').length },
    { id: 'cancelled' as const, label: 'Cancelled', count: dummyOrders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = activeFilter === 'all'
    ? dummyOrders
    : dummyOrders.filter(order => order.status === activeFilter);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} />

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
            const StatusIcon = statusConfig[order.status].icon;
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={order.image}
                      alt={order.product}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{order.product}</h3>
                        <p className="text-sm text-gray-600 mt-1">Order ID: {order.id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-900">${order.price}</span>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          {openMenu === order.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                                View Details
                              </button>
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                                Update Status
                              </button>
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
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig[order.status].label}
                      </span>
                      <span className="text-sm text-gray-500">{order.time}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.buyer}</p>
                          <p className="text-sm text-gray-600">{order.buyerEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">{order.address}</p>
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

      <Footer />
      <BottomNav onNavigate={onNavigate} currentPage="orders" />
    </div>
  );
}
