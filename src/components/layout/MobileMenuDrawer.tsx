// @ts-nocheck
/* eslint-disable */
'use client';

import React, { useEffect, useState } from 'react';
import { X, ChevronRight, User, Heart, Package, Settings, LogOut, Info, Mail } from 'lucide-react';
import { useMobileMenuStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export function MobileMenuDrawer() {
  const { isOpen, closeMenu } = useMobileMenuStore();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Lock body scroll when open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Fetch user for auth state in menu
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, supabase]);

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'PRODUCTS', href: '/products' },
    { label: 'NEW ARRIVALS', href: '/products' },
    { label: 'BEST SELLERS', href: '/products' },
    { label: 'COLLECTIONS', href: '/collections' },
    { label: 'JOURNAL', href: '/blog' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[400px] bg-surface shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surfaceBorder">
              <h2 className="text-xl font-serif tracking-widest text-textPrimary">VEJO.</h2>
              <button 
                onClick={closeMenu}
                className="p-2 -mr-2 text-textSecondary hover:text-textPrimary transition-colors"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Main Navigation */}
            <div className="flex-grow overflow-y-auto py-6 px-6">
              <nav className="space-y-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.label}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-sm font-semibold tracking-widest text-textPrimary group-hover:text-accent transition-colors">
                      {link.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" />
                  </Link>
                ))}
              </nav>

              <div className="my-8 border-t border-surfaceBorder"></div>

              {/* Account & Utilities */}
              <div className="space-y-5">
                {user ? (
                  <>
                    <Link href="/account" onClick={closeMenu} className="flex items-center gap-4 text-textSecondary hover:text-textPrimary transition-colors">
                      <User className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-sm font-medium tracking-wide">My Account</span>
                    </Link>
                    <Link href="/account/orders" onClick={closeMenu} className="flex items-center gap-4 text-textSecondary hover:text-textPrimary transition-colors">
                      <Package className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-sm font-medium tracking-wide">Orders</span>
                    </Link>
                    <Link href="/wishlist" onClick={closeMenu} className="flex items-center gap-4 text-textSecondary hover:text-textPrimary transition-colors">
                      <Heart className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-sm font-medium tracking-wide">Wishlist</span>
                    </Link>
                    <form action="/auth/signout" method="post" onSubmit={closeMenu}>
                      <button className="flex items-center gap-4 text-red-500 hover:text-red-600 transition-colors w-full text-left">
                        <LogOut className="w-5 h-5 stroke-[1.5]" />
                        <span className="text-sm font-medium tracking-wide">Sign Out</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu} className="flex items-center gap-4 text-textSecondary hover:text-textPrimary transition-colors">
                      <User className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-sm font-medium tracking-wide">Sign In / Register</span>
                    </Link>
                    <Link href="/wishlist" onClick={closeMenu} className="flex items-center gap-4 text-textSecondary hover:text-textPrimary transition-colors">
                      <Heart className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-sm font-medium tracking-wide">Wishlist</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Footer Area */}
            <div className="p-6 bg-gray-50 border-t border-surfaceBorder space-y-4">
              <Link href="#" className="flex items-center gap-3 text-xs text-textSecondary hover:text-textPrimary transition-colors">
                <Info className="w-4 h-4 stroke-[1.5]" />
                Help & Support
              </Link>
              <Link href="#" className="flex items-center gap-3 text-xs text-textSecondary hover:text-textPrimary transition-colors">
                <Mail className="w-4 h-4 stroke-[1.5]" />
                ritaidevelopers@gmail.com
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

