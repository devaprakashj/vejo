'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlistStore, useCartStore, WishlistItem } from '@/lib/store';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  // Prevent hydration mismatch by ensuring it only renders after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMoveToCart = (item: WishlistItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    toggleItem(item); // Remove from wishlist after moving to cart
    openCart();
  };

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header Banner */}
      <div className="bg-[#f8f8f8] py-16 text-center border-b border-surfaceBorder mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-textPrimary mb-4">Your Wishlist</h1>
        <p className="text-textSecondary">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      <div className="container-custom">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-24 h-24 bg-[#f8f8f8] rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🤍</span>
            </div>
            <h2 className="text-2xl font-serif mb-4">Your wishlist is empty</h2>
            <p className="text-textSecondary mb-8 max-w-md">
              Save your favorite items here while you browse, and come back to them anytime!
            </p>
            <Link 
              href="/products"
              className="bg-accent text-white px-8 py-4 font-bold tracking-widest uppercase text-sm hover:bg-opacity-90 transition-all rounded"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white border border-surfaceBorder rounded-lg overflow-hidden shadow-sm group">
                <Link href={`/products/${item.id}`} className="block relative aspect-square bg-[#f8f8f8]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </Link>
                
                <div className="p-4 flex flex-col gap-2">
                  <Link href={`/products/${item.id}`} className="hover:text-accent transition-colors">
                    <h3 className="font-semibold text-textPrimary text-sm line-clamp-1">{item.name}</h3>
                  </Link>
                  <p className="font-bold text-accent mb-4">₹{item.price.toLocaleString()}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 bg-[#1e293b] text-white py-3 flex items-center justify-center gap-2 font-bold tracking-widest uppercase text-[10px] hover:bg-opacity-90 transition-colors rounded-sm shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                    </button>
                    <button 
                      onClick={() => toggleItem(item)}
                      className="w-12 border border-surfaceBorder text-textSecondary hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors rounded-sm"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
