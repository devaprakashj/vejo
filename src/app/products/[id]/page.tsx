'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Star, 
  Minus, 
  Plus, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  ChevronDown,
  Clock,
  Eye,
  Flame,
  Zap,
  Heart
} from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import * as fpixel from '@/lib/fpixel';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("description");
  const [activeImage, setActiveImage] = useState<string>("");
  
  // Conversion Triggers State
  const [timeLeft, setTimeLeft] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [stock, setStock] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product?.id || ''));

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url
    });
  };

  useEffect(() => {
    // Force scroll to top when page mounts
    window.scrollTo(0, 0);

    const handleScroll = () => {
      // Show sticky bar when scrolled past 600px
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);

    async function fetchData() {
      // Fetch main product
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (productData) {
        setProduct(productData);
        setActiveImage(productData.image_url);
        if (productData.sizes?.length) setSelectedSize(productData.sizes[0]);
        if (productData.colors?.length) setSelectedColor(productData.colors[0]);
        
        // Track ViewContent event
        fpixel.event('ViewContent', {
          content_ids: [productData.id],
          content_type: 'product',
          content_name: productData.name,
          value: productData.price,
          currency: 'INR'
        });
        
        // Fetch recommended products (other items)
        const { data: recData } = await supabase
          .from('products')
          .select('*')
          .neq('id', params.id)
          .limit(4);
        if (recData) setRecommendedProducts(recData);
      }
      setLoading(false);
      
      // Initialize random conversion numbers
      setTimeLeft(Math.floor(Math.random() * 10000) + 3600);
      setViewers(Math.floor(Math.random() * 40) + 12);
      setStock(Math.floor(Math.random() * 5) + 2); // 2 to 6 items left
    }
    fetchData();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [params.id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: params.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image_url
    });
    
    // Track AddToCart event
    fpixel.event('AddToCart', {
      content_ids: [params.id],
      content_type: 'product',
      content_name: product.name,
      value: product.price * quantity,
      currency: 'INR'
    });
    
    openCart();
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-textSecondary uppercase tracking-widest text-xs font-bold animate-pulse">Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-serif">Product Not Found</h1>
        <Link href="/" className="text-accent underline text-sm">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-20">
      
      {/* Breadcrumbs */}
      <div className="container-custom py-6 text-[11px] md:text-xs text-textSecondary uppercase tracking-wider flex items-center gap-2">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-accent transition-colors">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-textPrimary font-semibold">{product.name}</span>
      </div>

      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col md:flex-row-reverse gap-4">
            
            {/* Main Image */}
            <div className="bg-[#f8f8f8] w-full md:w-5/6 rounded-2xl overflow-hidden sticky top-32 h-[500px] lg:h-[calc(100vh-180px)] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain object-center transition-opacity duration-500"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 w-full md:w-1/6 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 snap-x">
              {[product.image_url, ...(product.gallery_urls || [])].map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`snap-center w-20 h-24 md:w-full md:h-28 flex-shrink-0 bg-[#f8f8f8] rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-accent opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Product Details (Sticky) */}
          <div className="w-full lg:w-1/2">
            <div className="flex flex-col pt-2 lg:pt-8">
              
              {/* Title & Price Section (Redesigned) */}
              <div className="mb-6 font-sans">
                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#52b174]"></div>
                  <span className="text-sm text-textPrimary">Item is in stock</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-[32px] font-light text-textPrimary leading-[1.3] mb-4">
                  {product.name}
                </h1>
                
                {/* Pricing & Rating Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[26px] font-bold text-[#00b4d8] tracking-tight">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{Math.round(product.price * 1.58).toLocaleString()}
                    </span>
                    <div className="bg-[#2b4c8a] text-yellow-400 text-[11px] px-2 py-0.5 rounded-[3px] font-medium flex items-center gap-1.5 ml-1">
                      <span>Sale</span>
                      <span className="w-1 h-1 rounded-full bg-yellow-400 opacity-70"></span>
                      <span>Save {Math.round(((Math.round(product.price * 1.58) - product.price) / Math.round(product.price * 1.58)) * 100)}%</span>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-textPrimary font-semibold text-lg">
                    <Star className="w-5 h-5 fill-current mb-0.5" />
                    <span>5.0</span>
                  </div>
                </div>

                <p className="text-base text-textPrimary">Inclusive of all taxes</p>
              </div>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-textPrimary uppercase tracking-wide">Color</span>
                  </div>
                  <div className="flex gap-3">
                    {product.colors.map((color: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-accent scale-110 p-0.5' : 'border-transparent hover:scale-105'}`}
                      >
                        <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: color }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-textPrimary uppercase tracking-wide">Size</span>
                    <button className="text-xs text-textSecondary underline hover:text-accent">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 border text-xs font-bold tracking-widest uppercase transition-all ${
                          selectedSize === size 
                            ? 'border-accent bg-accent text-white' 
                            : 'border-surfaceBorder bg-white text-textPrimary hover:border-accent'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversion Triggers: Live Viewers & Scarcity */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wide">
                  <Flame className="w-4 h-4 animate-pulse" />
                  <span>High Demand: Only {stock} items left in stock</span>
                </div>
                <div className="flex items-center gap-2 text-textSecondary text-xs">
                  <Eye className="w-4 h-4" />
                  <span>{viewers} people are viewing this right now</span>
                </div>
              </div>

              {/* Urgency / Conversion Timer Banner */}
              <div className="bg-[#FAF9F6] border border-surfaceBorder p-4 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-textPrimary">Flash Sale Ends In</span>
                </div>
                <div className="text-sm font-bold font-mono tracking-wider text-accent bg-white px-3 py-1 border border-surfaceBorder">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="flex flex-col gap-4 mb-10">
                <div className="flex gap-2 md:gap-4 h-12 md:h-14">
                  {/* Quantity */}
                  <div className="flex items-center border border-surfaceBorder bg-white w-24 md:w-32 h-full">
                    <button 
                      className="w-10 h-full flex items-center justify-center hover:bg-surface transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-semibold text-sm">{quantity}</span>
                    <button 
                      className="w-10 h-full flex items-center justify-center hover:bg-surface transition-colors"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-white border border-accent text-accent font-bold tracking-widest uppercase text-sm hover:bg-accent hover:text-white transition-colors h-full"
                  >
                    Add to Cart
                  </button>
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={handleToggleWishlist}
                    className="w-12 md:w-14 h-full border border-surfaceBorder flex items-center justify-center hover:bg-surface transition-colors rounded-sm shadow-sm flex-shrink-0"
                  >
                    <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-accent text-accent' : 'text-textPrimary'}`} />
                  </button>
                </div>

                {/* Express Checkout (UPI) Button */}
                <button 
                  onClick={handleAddToCart}
                  className="w-full h-14 bg-[#1e293b] text-white flex items-center justify-center gap-2 font-bold tracking-widest uppercase text-sm hover:bg-opacity-90 transition-colors shadow-lg rounded-md"
                >
                  Pay with UPI <Zap className="w-4 h-4 fill-current mb-0.5 text-yellow-400" />
                </button>

                {/* Accepted Payments Row (Original Logos) */}
                <div className="flex items-center justify-center gap-4 py-4 bg-[#f8f8f8] border border-surfaceBorder rounded-md mt-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-4 md:h-5 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-4 md:h-5 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-3 md:h-4 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3 md:h-4 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 py-6 border-y border-surfaceBorder mb-8">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-5 h-5 text-textPrimary" />
                  <span className="text-[10px] uppercase font-semibold text-textSecondary tracking-wider">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="w-5 h-5 text-textPrimary" />
                  <span className="text-[10px] uppercase font-semibold text-textSecondary tracking-wider">30-Day Returns</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-textPrimary" />
                  <span className="text-[10px] uppercase font-semibold text-textSecondary tracking-wider">2-Year Warranty</span>
                </div>
              </div>

              {/* Accordions */}
              <div className="flex flex-col border-b border-surfaceBorder">
                
                {/* Description Accordion */}
                <div className="border-t border-surfaceBorder">
                  <button 
                    className="w-full py-5 flex justify-between items-center group"
                    onClick={() => toggleAccordion("description")}
                  >
                    <span className="text-xs font-bold tracking-widest uppercase">Description</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeAccordion === "description" ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === "description" ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="text-sm text-textSecondary leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Shipping Accordion */}
                <div className="border-t border-surfaceBorder">
                  <button 
                    className="w-full py-5 flex justify-between items-center group"
                    onClick={() => toggleAccordion("shipping")}
                  >
                    <span className="text-xs font-bold tracking-widest uppercase">Shipping & Returns</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeAccordion === "shipping" ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === "shipping" ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="text-sm text-textSecondary leading-relaxed">
                      Complimentary express shipping on all orders above ₹10,000. 
                      Returns are accepted within 30 days of delivery in their original condition and packaging.
                    </p>
                  </div>
                </div>

              </div>

              {/* Customer Reviews Snippet */}
              <div className="mt-8 pt-8 border-t border-surfaceBorder">
                <h3 className="text-sm font-bold tracking-widest uppercase mb-6">Latest Reviews</h3>
                <div className="flex flex-col gap-6">
                  <div className="bg-[#f8f8f8] p-5 rounded-lg">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <Star className="w-3 h-3 fill-accent text-accent" />
                    </div>
                    <p className="text-xs font-bold text-textPrimary mb-1">Absolutely perfect!</p>
                    <p className="text-xs text-textSecondary italic">&quot;Exceeded my expectations. The quality is incredible and it looks exactly like the photos. Worth every penny.&quot;</p>
                    <p className="text-[10px] text-textSecondary mt-3 uppercase tracking-wider">— Sarah M. (Verified Buyer)</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* You May Also Like Section */}
      {recommendedProducts.length > 0 && (
        <div className="container-custom mt-16 md:mt-24 mb-12">
          <h2 className="text-xl md:text-2xl font-serif text-center mb-6 md:mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendedProducts.map((rec) => (
              <Link key={rec.id} href={`/products/${rec.id}`} className="group cursor-pointer">
                <div className="aspect-[4/5] bg-[#f8f8f8] mb-4 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rec.image_url} alt={rec.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h4 className="font-bold tracking-wide text-textPrimary text-[11px] md:text-xs uppercase mb-1 line-clamp-1">{rec.name}</h4>
                <p className="text-sm font-bold text-accent">₹{rec.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile "Add to Cart" Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-surfaceBorder p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 md:hidden flex gap-3 items-center ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex-1">
          <p className="text-xs font-bold text-textPrimary line-clamp-1">{product.name}</p>
          <p className="text-xs font-bold text-accent">₹{product.price.toLocaleString()}</p>
        </div>
        <button 
          onClick={handleAddToCart}
          className="bg-accent text-white px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-md"
        >
          Buy Now
        </button>
      </div>

    </div>
  );
}
