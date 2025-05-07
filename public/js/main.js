// DOM Elements
const submissionTab = document.getElementById('submission-tab');
const productsTab = document.getElementById('products-tab');
const submissionContent = document.getElementById('submission-content');
const productsContent = document.getElementById('products-content');
const productForm = document.getElementById('product-form');
const searchInput = document.getElementById('search-products');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');
const productGrid = document.getElementById('product-grid');
const noResultsState = document.getElementById('no-results-state');
const addFirstProductBtn = document.getElementById('add-first-product');
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toast-title');
const toastMessage = document.getElementById('toast-message');

// State variables
let products = [];
let filteredProducts = [];

// Tab Switching
function switchTab(tab) {
  // Update tab appearance
  submissionTab.classList.remove('border-primary-500', 'text-primary-600');
  productsTab.classList.remove('border-primary-500', 'text-primary-600');
  submissionTab.classList.add('border-transparent', 'text-gray-500');
  productsTab.classList.add('border-transparent', 'text-gray-500');
  
  tab.classList.remove('border-transparent', 'text-gray-500');
  tab.classList.add('border-primary-500', 'text-primary-600');
  
  // Show/hide content
  if (tab === submissionTab) {
    submissionContent.classList.remove('hidden');
    productsContent.classList.add('hidden');
  } else {
    submissionContent.classList.add('hidden');
    productsContent.classList.remove('hidden');
    fetchProducts(); // Refresh products when switching to this tab
  }
}

// Tab event listeners
submissionTab.addEventListener('click', () => switchTab(submissionTab));
productsTab.addEventListener('click', () => switchTab(productsTab));

// Add First Product button
addFirstProductBtn.addEventListener('click', () => switchTab(submissionTab));

// Product form submission
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(productForm);
  const productData = {
    name: formData.get('name'),
    price: parseFloat(formData.get('price')),
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl') || null
  };
  
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    // Reset form
    productForm.reset();
    
    // Show success message
    showToast('Success', 'Product added successfully!');
    
    // Switch to products tab
    switchTab(productsTab);
  } catch (error) {
    console.error('Error submitting product:', error);
    showToast('Error', 'Failed to add product. Please try again.', 'error');
  }
});

// Fetch all products
async function fetchProducts() {
  // Show loading state
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');
  emptyState.classList.add('hidden');
  productGrid.classList.add('hidden');
  noResultsState.classList.add('hidden');
  
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    products = await response.json();
    filteredProducts = [...products];
    
    // Apply current search filter
    if (searchInput.value.trim()) {
      filterProducts(searchInput.value);
    } else {
      renderProducts();
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
  }
}

// Render products
function renderProducts() {
  loadingState.classList.add('hidden');
  
  if (products.length === 0) {
    // Show empty state
    emptyState.classList.remove('hidden');
    productGrid.classList.add('hidden');
    noResultsState.classList.add('hidden');
    return;
  }
  
  if (filteredProducts.length === 0) {
    // Show no results state
    emptyState.classList.add('hidden');
    productGrid.classList.add('hidden');
    noResultsState.classList.remove('hidden');
    return;
  }
  
  // Show product grid
  emptyState.classList.add('hidden');
  productGrid.classList.remove('hidden');
  noResultsState.classList.add('hidden');
  
  // Clear product grid
  productGrid.innerHTML = '';
  
  // Add product cards
  filteredProducts.forEach(product => {
    const productCard = createProductCard(product);
    productGrid.appendChild(productCard);
  });
}

// Create product card
function createProductCard(product) {
  const imageUrl = product.image_url || 'https://placehold.co/800x600/e2e8f0/94a3b8?text=No+Image';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md card';
  
  card.innerHTML = `
    <div class="aspect-w-16 aspect-h-9 bg-gray-200 relative h-48">
      <img 
        src="${imageUrl}" 
        alt="${product.name}" 
        class="object-cover w-full h-full"
        onerror="this.src='https://placehold.co/800x600/e2e8f0/94a3b8?text=Image+Error';"
      />
    </div>
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="text-gray-900 font-medium text-lg line-clamp-1">${product.name}</h3>
        <span class="price-tag px-2 py-1 rounded-md text-sm font-medium">${formattedPrice}</span>
      </div>
      <p class="mt-2 text-gray-600 text-sm line-clamp-3">${product.description}</p>
    </div>
  `;
  
  return card;
}

// Filter products based on search input
function filterProducts(query) {
  if (!query.trim()) {
    filteredProducts = [...products];
    renderProducts();
    return;
  }
  
  query = query.toLowerCase();
  
  // Define contextual keywords for simple semantic search
  const contextualKeywords = {
    'sit': ['chair', 'sofa', 'stool', 'bench'],
    'work': ['desk', 'office', 'chair', 'computer', 'keyboard'],
    'sleep': ['bed', 'pillow', 'mattress', 'blanket'],
    'light': ['lamp', 'bulb', 'lighting'],
    'storage': ['cabinet', 'drawer', 'shelf', 'desk'],
  };
  
  filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(query);
    const descriptionMatch = product.description.toLowerCase().includes(query);
    
    // Check for contextual matches
    let contextMatch = false;
    Object.entries(contextualKeywords).forEach(([keyword, relatedTerms]) => {
      if (query.includes(keyword)) {
        contextMatch = relatedTerms.some(term => 
          product.name.toLowerCase().includes(term) || 
          product.description.toLowerCase().includes(term)
        );
      }
    });
    
    return nameMatch || descriptionMatch || contextMatch;
  });
  
  renderProducts();
}

// Search input event listener
searchInput.addEventListener('input', (e) => {
  filterProducts(e.target.value);
});

// Show toast notification
function showToast(title, message, type = 'success') {
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  
  // Set toast type (success or error)
  if (type === 'error') {
    toast.querySelector('svg').classList.remove('text-green-500');
    toast.querySelector('svg').classList.add('text-red-500');
    toast.querySelector('svg').innerHTML = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`;
  } else {
    toast.querySelector('svg').classList.remove('text-red-500');
    toast.querySelector('svg').classList.add('text-green-500');
    toast.querySelector('svg').innerHTML = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />`;
  }
  
  // Show toast
  toast.classList.remove('translate-x-full');
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
  }, 3000);
}

// Initialize by showing the submission tab
switchTab(submissionTab);