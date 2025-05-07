// App Component
function App() {
  const [activeTab, setActiveTab] = React.useState('products'); // Default to 'products' tab
  const [toast, setToast] = React.useState({ show: false, title: '', message: '', type: 'success' });
  
  // Function to show a toast notification
  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };
  
  // Function to handle successful product addition
  const handleProductAdded = (product) => {
    setActiveTab('products'); // Switch to products tab after adding
    showToast('Product Added', `${product.name} has been added successfully!`);
  };
  
  // Function to handle product addition errors
  const handleError = (error) => {
    showToast('Error', error, 'error');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header />
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="mt-6">
        {activeTab === 'submit' ? (
          <ProductSubmissionForm 
            onProductAdded={handleProductAdded} 
            onError={handleError} 
          />
        ) : (
          <ProductsView onAddFirstProduct={() => setActiveTab('submit')} />
        )}
      </main>
      
      <Toast 
        show={toast.show} 
        title={toast.title} 
        message={toast.message} 
        type={toast.type} 
      />
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold gradient-text">ShopEase</h1>
        <p className="text-gray-600">Mini E-Commerce Platform</p>
      </div>
      <div className="mt-2 h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
    </header>
  );
}

// Tab Navigation Component
function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-4 px-1 font-medium text-sm ${
            activeTab === 'products'
              ? 'tab-active'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          My Products
        </button>
        
        <button
          onClick={() => setActiveTab('submit')}
          className={`py-4 px-1 font-medium text-sm ${
            activeTab === 'submit'
              ? 'tab-active'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Product Submission
        </button>
      </nav>
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.price || !formData.description) {
      onError('Please fill in all required fields');
      return;
    }
    
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
      
      const product = await response.json();
      setFormData({ name: '', price: '', description: '', imageUrl: '' });
      onProductAdded(product);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add a New Product</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Product Name*
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Price ($)*
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
            required
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
            Image URL (optional)
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Enter image URL"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:from-blue-600 hover:to-purple-700 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Products View Component
function ProductsView({ onAddFirstProduct }) {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState(null);
  
  // Fetch all products
  React.useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error loading products. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setError(null);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear search results
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };
  
  // Determine which products to display
  const displayedProducts = searchResults || products;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-2 text-red-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (products.length === 0 && !searchResults) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">No products yet</h3>
        <p className="text-gray-600 mb-4">Get started by adding your first product.</p>
        <button
          onClick={onAddFirstProduct}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          Add Your First Product
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Search Form */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or description..."
            className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
          {searchResults && (
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>
      
      {/* Search Results Indicator */}
      {searchResults && (
        <div className="mb-4 text-sm text-gray-600">
          {searchResults.length === 0 ? (
            <p>No results found for "{searchQuery}"</p>
          ) : (
            <p>Showing {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
          )}
        </div>
      )}
      
      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : searchResults && (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No matching products found.</p>
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product }) {
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {product.image_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          <span className="font-bold text-indigo-600">{formatPrice(product.price)}</span>
        </div>
        
        <p className="mt-2 text-gray-600 line-clamp-3">{product.description}</p>
        
        <div className="mt-4 text-xs text-gray-500">
          Added on {new Date(product.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Toast Notification Component
function Toast({ show, title, message, type }) {
  if (!show) return null;
  
  const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
  
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded border ${bgColor} shadow-lg transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'} max-w-md`}>
      <div className="flex justify-between">
        <h3 className="font-bold">{title}</h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={() => setToast({ ...toast, show: false })}>
          &times;
        </button>
      </div>
      <p className="mt-1">{message}</p>
    </div>
  );
}

// Render the App
ReactDOM.createRoot(document.getElementById('root')).render(<App />);