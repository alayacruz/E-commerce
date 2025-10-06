import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Package, DollarSign, Star, Eye, MoreVertical } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import BottomNavigation from '../components/BottomNavigation';

const Dashboard: React.FC = () => {
  const overviewCards = [
    {
      title: 'Total Views',
      value: '12,543',
      change: '+12%',
      icon: Eye,
      color: 'blue',
      clickable: false,
      chart: '📈'
    },
    {
      title: 'Products Sold',
      value: '1,234',
      change: '+8%',
      icon: Package,
      color: 'green',
      clickable: true,
      chart: '📊'
    },
    {
      title: 'Total Income',
      value: '$45,678',
      change: '+15%',
      icon: DollarSign,
      color: 'orange',
      clickable: true,
      chart: '💰'
    },
    {
      title: 'Product Reviews',
      value: '4.8',
      change: '+0.2',
      icon: Star,
      color: 'purple',
      clickable: true,
      chart: '⭐'
    }
  ];

  const recentProducts = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 199,
      stock: 45,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=200',
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      price: 249,
      stock: 23,
      image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=200',
      category: 'Electronics'
    },
    {
      id: 3,
      name: 'Premium Coffee Maker',
      price: 159,
      stock: 12,
      image: 'https://images.pexels.com/photos/7543663/pexels-photo-7543663.jpeg?auto=compress&cs=tinysrgb&w=200',
      category: 'Home & Garden'
    },
    {
      id: 4,
      name: 'Designer Running Shoes',
      price: 129,
      stock: 67,
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=200',
      category: 'Fashion'
    }
  ];

  const getCardColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'green': return 'bg-green-50 border-green-200 text-green-600';
      case 'orange': return 'bg-orange-50 border-orange-200 text-orange-600';
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-600';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Only on Dashboard */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
            <p className="text-gray-600">Here's what's happening with your store today.</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {overviewCards.map((card) => {
              const Icon = card.icon;
              const CardComponent = card.clickable ? Link : 'div';
              const cardProps = card.clickable ? { to: '/analytics' } : {};
              
              return (
                <CardComponent
                  key={card.title}
                  {...cardProps}
                  className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 ${
                    card.clickable ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCardColorClasses(card.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl">{card.chart}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-green-600 font-medium">{card.change} from last month</p>
                  </div>
                </CardComponent>
              );
            })}
          </div>

          {/* Your Products Section */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
                  <p className="text-gray-600 mt-1">Manage your product inventory</p>
                </div>
                <Link
                  to="/add-product"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentProducts.map((product) => (
                  <div key={product.id} className="group relative bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.stock > 20 ? 'bg-green-100 text-green-800' : 
                          product.stock > 5 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </div>
                      
                      <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View All Products
                  <TrendingUp className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Dashboard;