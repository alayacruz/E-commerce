import { useState, useEffect, useMemo } from 'react';
import { Upload, X, Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'; // Import Plus and Trash2
import Header_seller from '../components/Header_seller';
import Footer_seller from '../components/Footer_seller';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';

interface AddProductProps {
  onNavigate: (page: string) => void;
  productId?: string; 
}

interface Category {
  categoryId: number;
  categoryName: string;
}

interface Specification {
  key: string;
  value: string;
}

export default function AddProduct({ onNavigate, productId }: AddProductProps) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState(''); 
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [features, setFeatures] = useState<string[]>(['']); // Start with one empty feature
  const [specifications, setSpecifications] = useState<Specification[]>([{ key: '', value: '' }]); // Start with one empty spec pair

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const { token } = useAuth();
  
  // --- 4. CREATE PREVIEWS FOR *NEW* IMAGES ---
  const newImagePreviews = useMemo(() => {
    return newImages.map(file => URL.createObjectURL(file));
  }, [newImages]);

  // Effect to clean up object URLs
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);
  
  // Effect to fetch categories (no change)
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
        console.error(err);
        alert('Could not load categories. Please try again later.');
      }
    };
    const fetchProductData = async () => {
      if (productId && token) {
        setIsLoading(true);
        try {
          // You MUST create this route on your backend
          const res = await fetch(`http://localhost:3000/seller/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch product data');
          
          const data = await res.json();
          
          // Pre-fill all form fields
          setProductName(data.name);
          setCategory(data.categoryId);
          setPrice(String(data.price));
          setOriginalPrice(String(data.originalPrice || ''));
          setStock(String(data.availableQuantity));
          setDescription(data.description || '');
          setFeatures(data.features.length > 0 ? data.features : ['']);
          setExistingImageUrls(data.imageUrls || []);
          
          if (data.specifications && Object.keys(data.specifications).length > 0) {
            setSpecifications(Object.entries(data.specifications).map(([key, value]) => ({ key, value: String(value) })));
          } else {
            setSpecifications([{ key: '', value: '' }]);
          }

        } catch (err) {
          console.error(err);
          alert('Failed to load product data. Returning to products list.');
          onNavigate('products');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCategories();
 fetchProductData();
  }, [productId, token, onNavigate]);

  // Image upload handlers (no change)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setNewImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- NEW: Handlers for Features ---
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  // --- NEW: Handlers for Specifications ---
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    const newSpecs = specifications.filter((_, i) => i !== index);
    setSpecifications(newSpecs);
  };


  // --- UPDATED: handleSave to include new fields ---
  const handleSave = async () => {
    // Basic validation
    if (!productName || !category || !price || !stock) {
      alert('Please fill in all required fields');
      return;
    }

    if (productName.length > 50) {
      alert('Product Name should not be more than 50 characters');
      return;
    }
    if (description.length > 200) {
      alert('Description should not be more than 200 characters');
      return;
    }
    if (!token) {
      alert("You are not logged in. Please log in to save a product.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true); 

    const formData = new FormData();
    formData.append('name', productName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('availableQuantity', stock);
    formData.append('categoryId', category); // 'category' state holds the ID

    // Add originalPrice if it exists
    if (originalPrice) {
      formData.append('originalPrice', originalPrice);
    }

    // Add features (filter out empty strings)
    features.forEach(f => { if (f.trim()) formData.append('features', f.trim()); });

    // Convert specs array to a JSON object and stringify it
    const specsObject = specifications.reduce((acc, spec) => {
      if (spec.key.trim() && spec.value.trim()) acc[spec.key.trim()] = spec.value.trim();
      return acc;
    }, {} as Record<string, string>);
    formData.append('specifications', JSON.stringify(specsObject));

    // Add images
    newImages.forEach((imageFile) => {
      formData.append('images', imageFile);
    });

    if (productId) {
      existingImageUrls.forEach(url => {
        formData.append('existingImageUrls', url);
      });
    }

    try {
      const isEditing = !!productId;
      const url = isEditing
        ? `http://localhost:3000/seller/products/${productId}` // PUT route
        : 'http://localhost:3000/seller/products';         // POST route
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData 
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save product');
      }

      alert(`Product ${isEditing ? 'updated' : 'saved'} successfully!`);
      onNavigate('products');

    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 8. ADD LOADING OVERLAY ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-600 mt-4">Loading product for editing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header_seller onNavigate={onNavigate} showSearch={false} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 w-full">
        {/* ... (Back to Products button) ... */}
        <button
          onClick={() => onNavigate('products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        {/* ... (Header text) ... */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {productId ? 'Edit Product' : 'Add Product'}
          </h2>
          <p className="text-gray-600 mt-2">{productId ? 'Edit your product details' : 'Add a new product to your catalog'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form className="space-y-6">
            {/* ... Product Name input... */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                  disabled={categories.length === 0 || isSubmitting}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            
              {/* ... Price input ... */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Price <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* --- NEW: Original Price and Stock inputs --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Original Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Stock Quantity <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* --- NEW: Features Section --- */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Features
              </label>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder="e.g., Active Noise Cancellation"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={isSubmitting || features.length === 1}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
            </div>

            {/* --- NEW: Specifications Section --- */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Specifications
              </label>
              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="Specification Name (e.g., Weight)"
                      className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g., 250g)"
                      className="w-full md:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      disabled={isSubmitting || specifications.length === 1}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpecification}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Specification
                </button>
              </div>
            </div>
            
            {/* ... Image Upload section (no change) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mb-4">PNG, JPG, GIF up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Choose Files
                </label>
              </div>

              {/* Combined Image Preview Gallery */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {/* Show existing images */}
                {existingImageUrls.map((image, index) => (
                  <div key={image} className="relative group">
                    <img
                      src={image}
                      alt={`Existing ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Show *new* image previews */}
                {newImagePreviews.map((image, index) => (
                  <div key={image} className="relative group">
                    <img
                      src={image}
                      alt={`New ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ... (Description input ) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product in detail..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>
            
            {/* ... Save Button (no change) ... */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button" 
                onClick={handleSave}
                disabled={isSubmitting} 
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {/* 11. UPDATE BUTTON TEXT */}
                    {productId ? 'Update Product' : 'Save Product'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer_seller />
      <BottomNav onNavigate={onNavigate} currentPage="products" />
    </div>
  );
}