import { useEffect, useState } from 'react';
import { Eye, ShoppingBag, DollarSign, Star, Plus, Loader2, Package } from 'lucide-react';
import Footer_seller from '../components/Footer_seller';
import Sidebar from '../components/Sidebar';
import Header_seller from '../components/Header_seller';
import { useAuth } from '../contexts/AuthContext'; 

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface ProductPreview {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrls: string[];
}

interface SellerStats {
  income: number;
  sold: number;
  reviews: number;
}

const overviewCardsConfig = [
  {
    id: 'sold',
    title: 'Products Sold',
    icon: ShoppingBag,
    color: 'bg-green-500',
    clickable: true,
  },
  {
    id: 'income',
    title: 'Total Income',
    icon: DollarSign,
    color: 'bg-emerald-500',
    clickable: true,
  },
  {
    id: 'reviews',
    title: 'Product Reviews',
    icon: Star,
    color: 'bg-amber-500',
    clickable: true,
  },
 
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { token } = useAuth();

  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, productsResponse] = await Promise.all([
          fetch('http://localhost:3000/seller/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:3000/seller/products', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);

        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        
        const transformedProducts = productsData
          .map((p: any) => ({
            id: p.productId,
            name: p.name,
            price: parseFloat(p.price),
            stock: p.availableQuantity,
            imageUrls: p.imageUrls && p.imageUrls.length > 0
              ? p.imageUrls
              : ['https://via.placeholder.com/400?text=No+Image'],
          }))
          .slice(0, 4); // taken first 4 products for preview
        
        setProducts(transformedProducts);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);
  
  // Helper to format the stat values
  const getStatValue = (id: string) => {
    if (loading || !stats) {
      return <Loader2 className="w-6 h-6 animate-spin text-gray-400" />;
    }
    switch (id) {
      case 'income':
        return `$${stats.income.toFixed(2)}`;
      case 'sold':
        return stats.sold.toLocaleString();
      case 'reviews':
        return stats.reviews.toLocaleString();
      default:
        return '0';
    }
  };

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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-12">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {overviewCardsConfig.map((card) => {
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
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 h-10">
                    {getStatValue(card.id)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Products Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Your Products</h3>
                <p className="text-gray-600 text-sm mt-1">A preview of your product inventory</p>
              </div>
              <button
                onClick={() => onNavigate('add-product')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {/* Product Grid */}
            {loading && (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}
            
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onNavigate('products')}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && !error && (
              <div className="text-center h-40 flex flex-col justify-center items-center">
                 <Package className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No products found</h3>
                <p className="text-gray-500">Click "Add Product" to get started.</p>
              </div>
            )}
            
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