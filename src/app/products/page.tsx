import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Star } from 'lucide-react';

export const revalidate = 0; // Always fetch fresh products

export default async function ProductsPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-background min-h-screen">
      
      {/* Header Banner */}
      <div className="bg-[#f8f8f8] py-10 md:py-20 text-center border-b border-surfaceBorder mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-serif text-textPrimary mb-4">Shop the Collection</h1>
        <p className="text-textSecondary max-w-xl mx-auto px-4 leading-relaxed">
          Discover our full range of premium, sustainably sourced essentials. Designed for the modern home.
        </p>
      </div>

      <div className="container-custom pb-24">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-surfaceBorder text-sm text-textSecondary">
          <span>{products?.length || 0} Products</span>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-textPrimary">Sort: Featured</span>
          </div>
        </div>

        {/* Grid */}
        {(!products || products.length === 0) ? (
          <div className="text-center text-textSecondary py-20">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-y-12 sm:gap-x-6">
            {products.map((product) => (
              <Link 
                href={`/products/${product.id}`} 
                key={product.id}
                className="group flex flex-col"
              >
                <div className="w-full aspect-[4/5] bg-[#f8f8f8] mb-4 overflow-hidden rounded-md relative flex items-center justify-center">
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-textPrimary shadow-sm">
                      Best Seller
                    </span>
                  </div>

                  {/* Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out p-2 md:p-6"
                  />
                  
                  {/* Overlay Action */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-full bg-white text-textPrimary text-xs font-bold tracking-widest uppercase py-3 text-center shadow-lg hover:bg-[#1e293b] hover:text-white transition-colors cursor-pointer">
                      View Details
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <h3 className="text-[15px] font-medium text-textPrimary leading-snug line-clamp-2 mb-1 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-2 text-textPrimary">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[10px] text-textSecondary ml-1">(12)</span>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-accent">₹{product.price.toLocaleString()}</p>
                  <p className="text-xs text-textSecondary line-through">₹{Math.round(product.price * 1.58).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
