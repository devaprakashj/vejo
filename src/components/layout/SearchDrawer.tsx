'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useSearchStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchDrawer() {
  const { isOpen, closeSearch } = useSearchStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
      setSearchResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);
      
      setSearchResults(data || []);
      setIsLoading(false);
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, supabase]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Search Card */}
          <div className="absolute top-24 left-0 right-0 flex justify-center px-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-full max-w-3xl bg-white rounded-xl shadow-2xl pointer-events-auto overflow-hidden border border-surfaceBorder"
            >
              {/* Header / Input */}
              <div className="flex items-center px-6 py-4 border-b border-surfaceBorder">
                <Search className="w-5 h-5 text-textPrimary stroke-[1.5]" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder=""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-transparent border-none outline-none text-lg text-textPrimary px-4 focus:ring-0"
                />
                <button 
                  onClick={closeSearch}
                  className="p-1 text-textPrimary hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 pt-4 max-h-[60vh] overflow-y-auto">
                {!searchQuery ? (
                  // Initial State: Suggested Terms
                  <div>
                    <div className="relative flex py-5 items-center">
                      <div className="flex-grow border-t border-gray-100"></div>
                      <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-semibold tracking-widest uppercase">
                        Suggested Search Terms
                      </span>
                      <div className="flex-grow border-t border-gray-100"></div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mt-2">
                      {['Trending Now', 'Water Bottles', 'New Arrivals', 'Best Sellers', 'Kitchen & Dining', 'Home & Décor'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="text-sm text-textSecondary hover:text-textPrimary transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  // Empty State
                  <div className="text-center text-textSecondary py-8">
                    <p className="text-sm">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  // Results State
                  <div className="mt-4">
                    <h3 className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-4">Products</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.map((product) => (
                        <Link 
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={closeSearch}
                          className="flex items-center gap-4 group p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm font-medium text-textPrimary group-hover:text-accent transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs text-textSecondary mt-0.5">
                              {product.category}
                            </p>
                          </div>
                          <p className="font-semibold text-sm text-textPrimary">
                            ${product.price.toFixed(2)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
