import { useState } from 'react';
import { Plus, Filter, ArrowUpDown, Trash2, Eye, CreditCard as Edit, Package, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import ProductDetail from '../components/ProductDetail';
import Header_seller from '../components/Header_seller';

interface YourProductsProps {
  onNavigate: (page: string) => void;
}

const categories = ['All Categories', 'Electronics', 'Accessories', 'Home & Office', 'Wearables'];
const sortOptions = ['Name (A-Z)', 'Name (Z-A)', 'Price (Low to High)', 'Price (High to Low)', 'Stock (Low to High)'];

const dummyProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 89.99,
    stock: 45,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    views: 1234,
    sales: 89,
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals who demand the best audio experience.',
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    price: 299.99,
    stock: 23,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    views: 2341,
    sales: 156,
    description: 'Advanced smartwatch with fitness tracking, heart rate monitoring, GPS, and water resistance. Stay connected and healthy with this cutting-edge wearable technology.',
  },
  {
    id: 3,
    name: 'Laptop Stand',
    price: 49.99,
    stock: 67,
    category: 'Home & Office',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    views: 876,
    sales: 234,
    description: 'Ergonomic laptop stand designed to improve posture and reduce neck strain. Adjustable height and angle, compatible with all laptop sizes. Made from premium aluminum alloy.',
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    price: 149.99,
    stock: 12,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop',
    views: 1543,
    sales: 67,
    description: 'Professional mechanical keyboard with RGB backlighting, customizable keys, and tactile switches. Perfect for gaming and typing with exceptional durability and response time.',
  },
  {
    id: 5,
    name: 'Wireless Mouse',
    price: 29.99,
    stock: 89,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
    views: 654,
    sales: 178,
    description: 'Ergonomic wireless mouse with precision tracking and long battery life. Comfortable design for extended use, perfect for both work and gaming.',
  },
  {
    id: 6,
    name: 'USB-C Hub',
    price: 79.99,
    stock: 34,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',
    views: 987,
    sales: 123,
    description: 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery. Expand your connectivity options with this essential accessory for modern laptops.',
  },
  {
    id: 7,
    name: 'Desk Lamp',
    price: 39.99,
    stock: 56,
    category: 'Home & Office',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    views: 432,
    sales: 98,
    description: 'LED desk lamp with adjustable brightness and color temperature. Energy-efficient lighting solution for your workspace with modern design and flexible positioning.',
  },
  {
    id: 8,
    name: 'Bluetooth Speaker',
    price: 69.99,
    stock: 41,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    views: 1876,
    sales: 201,
    description: 'Portable Bluetooth speaker with powerful sound, deep bass, and 12-hour battery life. Waterproof design makes it perfect for outdoor adventures and parties.',
  },
];

export default function YourProducts({ onNavigate }: YourProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('Name (A-Z)');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const filteredProducts = selectedCategory === 'All Categories'
    ? dummyProducts
    : dummyProducts.filter(p => p.category === selectedCategory);

  const selectedProductData = dummyProducts.find(p => p.id === selectedProduct);

  if (selectedProductData) {
    return (
      <div>
        <Header_seller onNavigate={onNavigate} />
        <ProductDetail
          product={selectedProductData}
          onBack={() => setSelectedProduct(null)}
          onEdit={() => alert('Edit product: ' + selectedProductData.name)}
          onDelete={() => {
            if (confirm('Delete ' + selectedProductData.name + '?')) {
              alert('Deleted');
              setSelectedProduct(null);
            }
          }}
        />
        <Footer />
        <BottomNav onNavigate={onNavigate} currentPage="products" />
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
          <h2 className="text-3xl font-bold text-gray-900">Your Products</h2>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <button
              onClick={() => onNavigate('add-product')}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              >
                <div
                  className="relative aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-gray-900">${product.price}</span>
                    <span className={`text-sm font-medium ${product.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{product.views} views</span>
                    <span>{product.sales} sold</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Edit product: ' + product.name)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => confirm('Delete ' + product.name + '?') && alert('Deleted')}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Start by adding your first product to your catalog.</p>
            <button
              onClick={() => onNavigate('add-product')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </button>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav onNavigate={onNavigate} currentPage="products" />
    </div>
  );
}
