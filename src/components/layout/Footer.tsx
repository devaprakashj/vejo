import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-12 mt-auto">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1">
            <img src="/logo.png" alt="VEJO" className="h-10 md:h-12 object-contain mb-6 filter invert brightness-0" />
            <p className="text-gray-400 text-sm mb-8 leading-relaxed font-light">
              Premium, sustainable essentials designed for the modern lifestyle. Handcrafted with care, built to last.
            </p>
            <form className="flex border-b border-gray-700 pb-3 transition-colors focus-within:border-white">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent border-none outline-none w-full text-xs tracking-widest text-white placeholder-gray-500 focus:ring-0 px-0 uppercase"
                required
              />
              <button type="submit" className="text-gray-400 hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Shop Links */}
          <div className="lg:pl-8">
            <h4 className="font-bold tracking-[0.15em] uppercase text-xs mb-8 text-white">Shop</h4>
            <ul className="space-y-5 text-sm text-gray-400 font-light">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Home Decor</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Kitchen & Dining</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold tracking-[0.15em] uppercase text-xs mb-8 text-white">Company</h4>
            <ul className="space-y-5 text-sm text-gray-400 font-light">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/help/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/help/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/help/refund-policy" className="hover:text-white transition-colors">Cancellation & Refund</Link></li>
              <li><Link href="/help/shipping-and-delivery" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/help/contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Socials & Info */}
          <div>
            <h4 className="font-bold tracking-[0.15em] uppercase text-xs mb-8 text-white">Connect</h4>
            <div className="flex flex-col gap-5 mb-10 text-gray-400 font-light text-sm">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Youtube</a>
            </div>
            <div className="text-gray-400 font-light space-y-2">
              <p className="text-sm">ritaidevelopers@gmail.com</p>
              <p className="text-sm">+91 8667466390</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-500 font-light tracking-wider">
            &copy; {new Date().getFullYear()} VEJO STUDIO. ALL RIGHTS RESERVED.
          </p>
          
          {/* Payment Icons */}
          <div className="flex items-center justify-center md:justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/payment-methods.webp" alt="Payment Methods" className="h-8 md:h-10 object-contain" />
          </div>
        </div>
      </div>
    </footer>
  );
}
