// Mini E-Commerce Platform App

// Root App Component
function App() {
  const [activeTab, setActiveTab] = React.useState('products');
  const [products, setProducts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [toast, setToast] = React.useState({ show: false, title: '', message: '', type: '' });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [deletingProductId, setDeletingProductId] = React.useState(null);

  // Fetch products on component mount
  React.useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error', 'Failed to load products. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product submission
  const handleProductAdded = (newProduct) => {
    setProducts([newProduct, ...products]);
    showToast('Success', 'Product added successfully!', 'success');
    setActiveTab('products');
  };
  
  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    setDeletingProductId(productId);
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Update products list after deletion
      setProducts(products.filter(product => product.id !== productId));
      
      // If we're showing search results, update them too
      if (searchResults) {
        setSearchResults(searchResults.filter(product => product.id !== productId));
      }
      
      showToast('Success', 'Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Error', 'Failed to delete product. Please try again.', 'error');
    } finally {
      setDeletingProductId(null);
    }
  };

  // Show toast notification
  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast({ ...toast, show: false });
    }, 3000);
  };

  // Handle product search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching products:', error);
      showToast('Error', 'Failed to search products. Please try again.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen flex flex-col">
      <Header />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="mt-8 flex-grow">
        {activeTab === 'add-product' ? (
          <ProductSubmissionForm 
            onProductAdded={handleProductAdded} 
            onError={(message) => showToast('Error', message, 'error')} 
          />
        ) : (
          <>
            <div className="mb-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit" 
                  className="gradient-btn text-white px-4 py-2 rounded-lg"
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
                {searchResults && (
                  <button 
                    type="button" 
                    onClick={clearSearch}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>
            
            <ProductsView 
              products={searchResults || products} 
              isLoading={isLoading} 
              isSearchResults={!!searchResults}
              searchQuery={searchQuery}
              onAddFirstProduct={() => setActiveTab('add-product')}
              onDeleteProduct={handleDeleteProduct}
              deletingProductId={deletingProductId}
            />
          </>
        )}
      </main>
      
      <Footer />
      <Toast {...toast} />
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2">
        <span className="gradient-text">Mini E-Commerce Platform</span>
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Browse products or add your own to our catalog. Simple, fast, and user-friendly.
      </p>
    </header>
  );
}

// Tab Navigation Component
function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-gray-200">
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === 'products'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('products')}
      >
        Browse Products
      </button>
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === 'add-product'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('add-product')}
      >
        Add Product
      </button>
    </div>
  );
}

// Product Submission Form Component
function ProductSubmissionForm({ onProductAdded, onError }) {
  const [formData, setFormData] = React.useState({
    name: '',
    price: '',
    description: '',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if URL is valid
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }
      
      const newProduct = await response.json();
      onProductAdded(newProduct);
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        description: '',
        imageUrl: ''
      });
      
    } catch (error) {
      console.error('Error adding product:', error);
      onError(error.message || 'Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Product Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter product name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
            Price ($)*
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter price"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter product description"
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
            Image URL
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.imageUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter image URL (optional)"
          />
          {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn text-white font-medium py-2 px-6 rounded-lg"
          >
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Products View Component
function ProductsView({ products, isLoading, isSearchResults, searchQuery, onAddFirstProduct, onDeleteProduct, deletingProductId }) {
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        {isSearchResults ? (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              No products match your search "{searchQuery}". Try a different search term.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first product to the catalog.
            </p>
            <button
              onClick={onAddFirstProduct}
              className="gradient-btn text-white font-medium py-2 px-6 rounded-lg"
            >
              Add Your First Product
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {isSearchResults && (
        <h3 className="text-xl font-semibold mb-4">
          Search Results for "{searchQuery}" ({products.length} {products.length === 1 ? 'product' : 'products'})
        </h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onDelete={onDeleteProduct}
            isDeleting={deletingProductId === product.id}
          />
        ))}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, onDelete, isDeleting }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      onDelete(product.id);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden card-shadow card-hover">
      {product.image_url ? (
        <div className="h-48 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
          No Image Available
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{product.name}</h3>
        <p className="text-blue-600 font-bold mb-3">{formatPrice(product.price)}</p>
        <p className="text-gray-600 mb-3">{truncateText(product.description, 100)}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            ID: {product.id}
          </span>
          <div className="flex space-x-2">
            <button 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={isDeleting}
            >
              View Details
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-12 py-6 border-t border-gray-200">
      <div className="text-center">
        <p className="text-gray-600">
          © {currentYear} Mini E-Commerce Platform. Created by <span className="gradient-text font-medium">Bantu Nagajuna</span>
        </p>
        <p className="text-gray-500 text-sm mt-1">
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// Toast Notification Component
function Toast({ show, title, message, type }) {
  if (!show) return null;
  
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };
  
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm">
      <div className={`${typeClasses[type] || 'bg-gray-800'} text-white p-4 rounded-lg shadow-lg`}>
        <div className="font-bold mb-1">{title}</div>
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
}

// Mount React app
ReactDOM.render(<App />, document.getElementById('root'));