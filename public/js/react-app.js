// Root App component
function App() {
  const [activeTab, setActiveTab] = React.useState('submission');
  const [toast, setToast] = React.useState({ show: false, title: '', message: '', type: 'success' });
  
  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  return (
    <>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'submission' ? (
          <ProductSubmissionForm 
            onProductAdded={() => {
              showToast('Success', 'Product added successfully!');
              setActiveTab('products');
            }} 
            onError={(error) => {
              showToast('Error', error || 'Failed to add product', 'error');
            }}
          />
        ) : (
          <ProductsView onAddFirstProduct={() => setActiveTab('submission')} />
        )}
        
        <Toast 
          show={toast.show}
          title={toast.title}
          message={toast.message}
          type={toast.type}
        />
      </main>
    </>
  );
}

// Header component
function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 primary-color" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold gradient-text">ShopEase</h1>
          </div>
          <div>
            <span className="text-sm text-gray-500">Mini E-Commerce Platform</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// Tab Navigation component
function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="mb-8 border-b border-gray-200">
      <div className="flex space-x-8">
        <button 
          className={`py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
            activeTab === 'submission' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('submission')}
        >
          Product Submission
        </button>
        <button 
          className={`py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
            activeTab === 'products' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('products')}
        >
          My Products
        </button>
      </div>
    </div>
  );
}

// Product Submission Form component
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
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
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          imageUrl: formData.imageUrl || null
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        description: '',
        imageUrl: ''
      });
      
      onProductAdded();
    } catch (error) {
      console.error('Error submitting product:', error);
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-0">
      <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add a New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              id="product-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              id="product-price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="product-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (optional)
            </label>
            <input
              type="url"
              id="product-image"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-sm text-gray-500">Provide a URL to an image of your product</p>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white primary-bg hover-primary-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Products View component
function ProductsView({ onAddFirstProduct }) {
  const [products, setProducts] = React.useState([]);
  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Fetch products on component mount
  React.useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    // Define contextual keywords for simple semantic search
    const contextualKeywords = {
      'sit': ['chair', 'sofa', 'stool', 'bench'],
      'work': ['desk', 'office', 'chair', 'computer', 'keyboard'],
      'sleep': ['bed', 'pillow', 'mattress', 'blanket'],
      'light': ['lamp', 'bulb', 'lighting'],
      'storage': ['cabinet', 'drawer', 'shelf', 'desk'],
    };
    
    const lowercaseQuery = query.toLowerCase();
    
    const filtered = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(lowercaseQuery);
      const descriptionMatch = product.description.toLowerCase().includes(lowercaseQuery);
      
      // Check for contextual matches
      let contextMatch = false;
      Object.entries(contextualKeywords).forEach(([keyword, relatedTerms]) => {
        if (lowercaseQuery.includes(keyword)) {
          contextMatch = relatedTerms.some(term => 
            product.name.toLowerCase().includes(term) || 
            product.description.toLowerCase().includes(term)
          );
        }
      });
      
      return nameMatch || descriptionMatch || contextMatch;
    });
    
    setFilteredProducts(filtered);
  };
  
  // If loading
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="rounded-full h-12 w-12 border-t-2 border-b-2 loading-spinner"></div>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="inline-block p-4 rounded-full bg-red-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading products</h3>
        <p className="text-gray-500 mb-4">Please try again later.</p>
      </div>
    );
  }
  
  // If empty products
  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0L18 6m-8-3v2m0 12v2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
        <p className="text-gray-500 mb-4">Your product list is empty. Add your first product to get started.</p>
        <button 
          onClick={onAddFirstProduct}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white primary-bg hover-primary-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Add Your First Product
        </button>
      </div>
    );
  }
  
  return (
    <div className="mt-0">
      {/* Search Field */}
      <div className="max-w-lg mx-auto w-full mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input 
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Search products by name, description, or context..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Try searching for "chair", "desk", or even "need something to sit on"</p>
      </div>
      
      {/* No Search Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching products</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
        </div>
      )}
      
      {/* Product Grid */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// Product Card component
function ProductCard({ product }) {
  const imageUrl = product.image_url || 'https://placehold.co/800x600/e2e8f0/94a3b8?text=No+Image';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md card">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative h-48">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.src = 'https://placehold.co/800x600/e2e8f0/94a3b8?text=Image+Error';
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-gray-900 font-medium text-lg line-clamp-1">{product.name}</h3>
          <span className="price-tag px-2 py-1 rounded-md text-sm font-medium">{formattedPrice}</span>
        </div>
        <p className="mt-2 text-gray-600 text-sm line-clamp-3">{product.description}</p>
      </div>
    </div>
  );
}

// Toast component
function Toast({ show, title, message, type }) {
  return (
    <div 
      className={`fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-transform duration-300 flex items-start max-w-sm ${
        show ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex-shrink-0 mr-3">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`}
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          {type === 'error' ? (
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          ) : (
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          )}
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);