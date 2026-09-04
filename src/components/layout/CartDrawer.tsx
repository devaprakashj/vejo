'use client';

import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surfaceBorder">
              <h2 className="text-xl font-serif text-accent">Your Cart</h2>
              <button 
                onClick={closeCart}
                className="p-2 hover:bg-surfaceBorder rounded-full transition-colors text-textSecondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-textSecondary space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p>Your cart is empty.</p>
                  <button 
                    onClick={closeCart}
                    className="mt-4 px-6 py-2 bg-accent text-white font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-24 h-32 bg-surfaceBorder flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-textPrimary pr-4 leading-tight">{item.name}</h3>
                            <button onClick={() => removeItem(item.id)} className="text-textSecondary hover:text-accent">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {item.variantInfo && (
                            <p className="text-xs text-textSecondary mt-1">{item.variantInfo}</p>
                          )}
                          <p className="text-sm font-medium mt-2">INR ₹{item.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-surfaceBorder">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 flex items-center justify-center text-textSecondary hover:text-accent hover:bg-surfaceBorder transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-textSecondary hover:text-accent hover:bg-surfaceBorder transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-surfaceBorder bg-surface">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-textSecondary uppercase tracking-widest text-xs font-semibold">Subtotal</span>
                  <span className="text-xl font-medium">INR ₹{subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-textSecondary mb-6">Shipping & taxes calculated at checkout.</p>
                <button 
                  onClick={() => {
                    closeCart();
                    window.location.href = '/checkout';
                  }}
                  className="w-full py-4 bg-accent text-white font-semibold tracking-widest uppercase hover:bg-opacity-90 transition-all shadow-md"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
