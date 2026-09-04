'use client';

import React from 'react';
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, ArrowLeft, ArrowRight, ChevronDown, Menu } from 'lucide-react';
import { useCartStore, useWishlistStore, useSearchStore, useMobileMenuStore } from '@/lib/store';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';

export function Header() {
  const { items, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { openSearch } = useSearchStore();
  const { openMenu } = useMobileMenuStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Fetch initial user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm flex flex-col">
      {/* Top Promo Bar */}
      <div className="bg-[#0a0a0a] text-white py-2.5 px-6 flex justify-between items-center hidden md:flex text-xs font-medium tracking-wide">
        <div className="flex-1 flex items-center">
          <span className="text-gray-400">Get 20% off your first order with code:</span>
          <span className="font-bold tracking-widest ml-2 px-2.5 py-1 bg-white/10 text-white rounded-[3px] border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.07)]">WELCOME20</span>
        </div>
        
        <div className="flex-1 flex justify-center items-center gap-6 group cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all transform group-hover:-translate-x-1 duration-300" />
          <Link href="/products" className="font-bold tracking-[0.2em] uppercase text-[10px] text-white relative py-1">
            Shop the Autumn Sale
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all transform group-hover:translate-x-1 duration-300" />
        </div>
        
        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-white transition-colors text-[11px] font-bold tracking-widest">
            INR ₹ <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-surfaceBorder py-4 px-6 md:px-12 relative z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-textPrimary hover:text-accent transition-colors"
              onClick={openMenu}
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img src="/logo.png" alt="VEJO" className="h-10 md:h-12 object-contain" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-[13px] tracking-wider font-semibold text-accent uppercase">HOME</Link>
            <Link href="/products" className="text-[13px] tracking-wider font-semibold text-textSecondary hover:text-accent transition-colors uppercase">PRODUCT</Link>
            <Link href="/collections" className="text-[13px] tracking-wider font-semibold text-textSecondary hover:text-accent transition-colors uppercase flex items-center gap-1">
              COLLECTION <ChevronDown className="w-4 h-4" />
            </Link>
            <Link href="/blog" className="text-[13px] tracking-wider font-semibold text-textSecondary hover:text-accent transition-colors uppercase">BLOG</Link>
            <Link href="/pages" className="text-[13px] tracking-wider font-semibold text-textSecondary hover:text-accent transition-colors uppercase flex items-center gap-1">
              PAGES <ChevronDown className="w-4 h-4" />
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={openSearch}
              className="text-textPrimary hover:text-textSecondary transition-colors hidden sm:block"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            <Link href={user ? "/account" : "/login"} className="text-textPrimary hover:text-textSecondary transition-colors hidden sm:block relative">
              <User className="w-5 h-5 stroke-[1.5]" />
              {user && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
              )}
            </Link>
            <Link href="/wishlist" className="text-textPrimary hover:text-textSecondary transition-colors relative hidden sm:block">
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-3 w-[18px] h-[18px] rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            {/* My Cart Button */}
            <button 
              onClick={openCart}
              className="ml-2 bg-accent hover:bg-opacity-90 transition-all text-white px-5 py-2.5 flex items-center gap-3 rounded-sm shadow-sm"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="text-sm font-medium">My cart</span>
              <span className="w-[22px] h-[22px] rounded-full bg-white text-[11px] font-bold flex items-center justify-center text-accent ml-1 shadow-inner">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
