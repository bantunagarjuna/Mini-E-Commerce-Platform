import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-primary text-2xl font-bold">ShopEase</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2 text-sm text-gray-700 focus:outline-none">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  JS
                </div>
                <span className="hidden md:block">John Seller</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
