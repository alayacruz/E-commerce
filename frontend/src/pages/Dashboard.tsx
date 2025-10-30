import { Eye, ShoppingBag, DollarSign, Star, TrendingUp, Plus } from 'lucide-react';
import Footer_seller from '../components/Footer_seller';
import Sidebar from '../components/Sidebar';
import Header_seller from '../components/Header_seller';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const overviewCards = [
  {
    id: 'sold',
    title: 'Products Sold',
    value: '1,234',
    change: '+8.2%',
    icon: ShoppingBag,
    color: 'bg-green-500',
    clickable: true,
  },
  {
    id: 'income',
    title: 'Total Income',
    value: '$52,840',
    change: '+15.3%',
    icon: DollarSign,
    color: 'bg-emerald-500',
    clickable: true,
  },
  {
    id: 'reviews',
    title: 'Product Reviews',
    value: '856',
    change: '+5.7%',
    icon: Star,
    color: 'bg-amber-500',
    clickable: true,
  },
  {
    id: 'cancelled',
    title: 'Orders Cancelled',
    value: '67',
    change: '+12.5%',
    icon: Eye,
    color: 'bg-blue-500',
    clickable: false,
  },
];

const dummyProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 89.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    price: 299.99,
    stock: 23,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Laptop Stand',
    price: 49.99,
    stock: 67,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    price: 149.99,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop',
  },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="flex">
      <Sidebar onNavigate={onNavigate} currentPage="dashboard" />

      <div className="flex-1 ml-64">
        <Header_seller onNavigate={onNavigate} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {overviewCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
                    card.clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                  }`}
                  onClick={() => card.clickable && alert(`View ${card.title} details`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {card.change}
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>

                  {card.clickable && (
                    <div className="mt-4 h-12 flex items-end gap-1">
                      {[40, 55, 35, 70, 45, 80, 60].map((height, i) => (
                        <div
                          key={i}
                          className={`flex-1 ${card.color} opacity-20 rounded-t`}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Your Products</h3>
                <p className="text-gray-600 text-sm mt-1">Manage your product inventory</p>
              </div>
              <button
                onClick={() => onNavigate('add-product')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dummyProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onNavigate('products')}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => onNavigate('products')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Products →
              </button>
            </div>
          </div>
        </main>

        <Footer_seller />
      </div>
    </div>
  );
}
