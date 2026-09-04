'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Shirt, Gem, Armchair, Utensils, BedDouble } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/lib/supabase";

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070",
    title: "Elevate Your Space <br /> & Wardrobe",
    subtitle: "Discover our curated collection of premium women's fashion and minimalist home accessories."
  },
  {
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000",
    title: "Minimalist <br /> Living",
    subtitle: "Transform your home with our exclusive beige and neutral tone accessories."
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000",
    title: "The Autumn <br /> Collection",
    subtitle: "Timeless silhouettes and premium fabrics designed for the modern woman."
  }
];

export default function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      setProducts(data || []);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-12 pt-6 pb-12">
        <div className="relative h-[calc(100vh-200px)] min-h-[500px] w-full rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
          
          {/* Background Image Slider */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.img
                key={currentSlide}
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0.5 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                src={HERO_SLIDES[currentSlide].image}
                alt="Hero Background"
                className="w-full h-full object-cover object-center absolute inset-0"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/40 z-10" />
          </div>

          {/* Text Content */}
          <div className="relative z-20 text-center text-white px-6 w-full mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h1 
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight mb-6 max-w-4xl mx-auto drop-shadow-lg"
                  dangerouslySetInnerHTML={{ __html: HERO_SLIDES[currentSlide].title }}
                />
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-90 drop-shadow-md font-medium">
                  {HERO_SLIDES[currentSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-30">
              <Link 
                href="/collections/womens" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-accent font-bold tracking-wider text-sm hover:bg-opacity-90 transition-all rounded-sm uppercase"
              >
                Shop Women
              </Link>
              <Link 
                href="/collections/home" 
                className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white font-bold tracking-wider text-sm hover:bg-white hover:text-accent transition-all rounded-sm uppercase"
              >
                Shop Home
              </Link>
            </div>
            
            {/* Slider Controls */}
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-3 z-30">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category (Icon Grid) */}
      <section className="pt-20 pb-8 bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl">
              <span className="font-bold text-textPrimary">Shop by</span> <span className="font-serif italic text-textSecondary">category</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Link href="/collections/handbags" className="bg-white group p-4 md:p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow border border-surfaceBorder/50">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 text-accent group-hover:scale-110 transition-transform">
                <Shirt className="w-10 h-10 stroke-[1.5] hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-textSecondary mb-2">12 Items</span>
              <span className="font-semibold text-textPrimary text-sm md:text-base">Handbags</span>
            </Link>

            <Link href="/collections/jewelry" className="bg-white group p-4 md:p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow border border-surfaceBorder/50">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 text-accent group-hover:scale-110 transition-transform">
                <Gem className="w-10 h-10 stroke-[1.5]" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-textSecondary mb-2">8 Items</span>
              <span className="font-semibold text-textPrimary text-sm md:text-base">Jewelry</span>
            </Link>

            <Link href="/collections/living" className="bg-white group p-4 md:p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow border border-surfaceBorder/50">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 text-accent group-hover:scale-110 transition-transform">
                <Armchair className="w-10 h-10 stroke-[1.5]" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-textSecondary mb-2">15 Items</span>
              <span className="font-semibold text-textPrimary text-sm md:text-base">Living Decor</span>
            </Link>

            <Link href="/collections/kitchen" className="bg-white group p-4 md:p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow border border-surfaceBorder/50">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 text-accent group-hover:scale-110 transition-transform">
                <Utensils className="w-10 h-10 stroke-[1.5]" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-textSecondary mb-2">6 Items</span>
              <span className="font-semibold text-textPrimary text-sm md:text-base">Dining</span>
            </Link>

            <Link href="/collections/bedroom" className="bg-white group p-4 md:p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow border border-surfaceBorder/50">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 text-accent group-hover:scale-110 transition-transform">
                <BedDouble className="w-10 h-10 stroke-[1.5]" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-textSecondary mb-2">9 Items</span>
              <span className="font-semibold text-textPrimary text-sm md:text-base">Bedroom</span>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals (Framed Layout) */}
      <section className="pb-12 md:pb-20 pt-4 bg-background px-4 md:px-6 lg:px-12 max-w-[1600px] mx-auto w-full">
        <div className="bg-[#F5F5F5] rounded-3xl p-6 md:p-10 lg:p-12 shadow-sm border border-black/5">
          
          {/* Frame Header */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-textPrimary">
              New Arrivals
            </h2>
            <Link href="/products" className="w-10 h-10 md:w-12 md:h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-accent hover:scale-105 transition-all group">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Frame Content (Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
            
            {products && products.length > 0 ? (
              products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group cursor-pointer flex flex-col">
                  <div className="w-full aspect-[4/5] bg-[#f8f8f8] mb-4 overflow-hidden relative rounded-md flex items-center justify-center">
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-white px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-textPrimary shadow-sm">
                        New
                      </span>
                    </div>

                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-2 md:p-6 group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                    
                    {/* Overlay Action */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out opacity-0 group-hover:opacity-100">
                      <div className="w-full bg-white text-textPrimary text-[11px] md:text-xs font-bold tracking-widest uppercase py-3 text-center shadow-lg hover:bg-[#1e293b] hover:text-white transition-colors">
                        View Details
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col mt-1">
                    <h4 className="font-medium text-textPrimary text-sm line-clamp-1 mb-1 group-hover:text-accent transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-textSecondary mb-2">{product.category}</p>
                    <p className="text-sm font-bold text-accent">₹{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-textSecondary">
                <p>Loading new arrivals... (Please run the SQL schema in Supabase if this persists)</p>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}
