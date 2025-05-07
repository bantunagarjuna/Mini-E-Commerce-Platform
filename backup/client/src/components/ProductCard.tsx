import React from 'react';
import { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Default image if none provided
  const imageUrl = product.imageUrl || 'https://placehold.co/800x600/e2e8f0/94a3b8?text=No+Image';
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative h-48">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="object-cover w-full h-full"
          onError={(e) => {
            // If image fails to load, use placeholder
            e.currentTarget.src = 'https://placehold.co/800x600/e2e8f0/94a3b8?text=Image+Error';
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-gray-900 font-medium text-lg line-clamp-1">{product.name}</h3>
          <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-sm font-medium">{formattedPrice}</span>
        </div>
        <p className="mt-2 text-gray-600 text-sm line-clamp-3">{product.description}</p>
      </div>
    </div>
  );
}
