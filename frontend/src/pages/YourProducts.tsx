import { useEffect, useState } from 'react';
import { Plus, Filter, ArrowUpDown, Trash2, Eye, CreditCard as Edit, Package, ArrowLeft, Loader2 } from 'lucide-react';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import ProductDetail from '../components/ProductDetail';
import Header_seller from '../components/Header_seller';
import { useAuth } from '../contexts/AuthContext';

interface YourProductsProps {
  onNavigate: (page: string, productId?: string) => void;
}

interface Product {
  id: string; 
  name: string;
  price: number;
  stock: number; 
  category: string; 
  imageUrls: string[]; 
  views: number; 
  sales: number;
  description: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
}
const sortOptions = ['Name (A-Z)', 'Name (Z-A)', 'Price (Low to High)', 'Price (High to Low)', 'Stock (Low to High)'];

export default function YourProducts({ onNavigate }: YourProductsProps) {
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('Name (A-Z)');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) { 
        setError("You are not logged in.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/seller/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to fetch products');
        }
        const data = await response.json();
        const transformedData: Product[] = data.map((p: any) => ({
          id: p.productId,
          name: p.name,
          price: parseFloat(p.price),
          stock: p.availableQuantity,
          description: p.description || 'No description available.',
          imageUrls: p.imageUrls && p.imageUrls.length > 0
  ? p.imageUrls
  : ['https://via.placeholder.com/400?text=No+Image'],
          category: p.category ? p.category.categoryName : 'Uncategorized',
          views: Math.floor(Math.random() * 1500) + 50,
          sales: Math.floor(Math.random() * 200) + 10,
        }));
        setProducts(transformedData);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/category');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Category fetch error:", (err as Error).message);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete '${productName}'?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/seller/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete product');
      }

      // If delete is successful, remove it from the state
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      
      // If the detailed view was open, close it
      if (selectedProduct === productId) {
        setSelectedProduct(null);
      }

      alert('Product deleted (archived) successfully');

    } catch (err: unknown) {
      alert(`Error: ${(err as Error).message}`);
    }
  };


  // 7. Update filter/find logic to use the 'products' state
  const filteredProducts = selectedCategory === 'All Categories'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const selectedProductData = products.find(p => p.id === selectedProduct);

  if (selectedProductData) {
    return (
      <div>
        <Header_seller onNavigate={onNavigate} />
        <ProductDetail
          product={selectedProductData}
          onBack={() => setSelectedProduct(null)}
          onEdit={() => onNavigate('add-product', selectedProductData.id)}
          onDelete={() => handleDelete(selectedProductData.id, selectedProductData.name)}
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
                  disabled={categories.length === 0}
                >
                  <option value="All Categories">All Categories</option>

                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
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

        
{loading && (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Products...</h3>
            <p className="text-gray-600">Please wait a moment.</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">Error Fetching Products</h3>
            <p className="text-red-700 mb-6">{error}</p>
          </div>
        )}

        {/* 10. Update render logic to check for loading/error first */}
        {!loading && !error && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id} // Use the string id
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              >
                <div
                  className="relative aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)} // Use string id
                >
                  <img
                    src={product.imageUrls[0]} // Use the new image path
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
                    <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
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
                      // 11. Wire up real delete here too
                      onClick={() => handleDelete(product.id, product.name)}
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
          // 12. Only show "No Products" if not loading and no error
          !loading && !error && (
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
          )
        )}
      </main>

      <Footer />
      <BottomNav onNavigate={onNavigate} currentPage="products" />
    </div>
  );
}