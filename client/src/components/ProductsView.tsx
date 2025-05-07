import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

interface ProductsViewProps {
  onAddFirstProduct: () => void;
}

export default function ProductsView({ onAddFirstProduct }: ProductsViewProps) {
  const { products, isLoading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Simple search function that filters products by name, description
  const filteredProducts = products?.filter(product => {
    const query = searchQuery.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(query);
    const descriptionMatch = product.description.toLowerCase().includes(query);
    
    // Simple keyword-based contextual search
    const contextualKeywords = {
      'sit': ['chair', 'sofa', 'stool', 'bench'],
      'work': ['desk', 'office', 'chair', 'computer', 'keyboard'],
      'sleep': ['bed', 'pillow', 'mattress', 'blanket'],
      'light': ['lamp', 'bulb', 'lighting'],
      'storage': ['cabinet', 'drawer', 'shelf', 'desk'],
    };
    
    // Check if any contextual keywords in the search query matches product content
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

  return (
    <div className="space-y-6">
      {/* Search Field */}
      <div className="max-w-lg mx-auto w-full mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <Input
            id="search-products"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition-colors"
            placeholder="Search products by name, description, or context..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Try searching for "chair", "desk", or even "need something to sit on"</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="inline-block p-4 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading products</h3>
          <p className="text-gray-500 mb-4">Please try again later.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products && products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0L18 6m-8-3v2m0 12v2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Your product list is empty. Add your first product to get started.</p>
          <Button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={onAddFirstProduct}
          >
            Add Your First Product
          </Button>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !error && filteredProducts && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && !error && products && products.length > 0 && filteredProducts && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching products</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
