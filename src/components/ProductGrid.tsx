"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";

interface Product {
  id: string;
  name: string;
  regularPrice?: number;
  price?: number;
  category: string;
  image: string;
  description: string;
  variants?: {
    id: string;
    name: string;
    regularPrice: number;
  }[];
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [mounted, setMounted] = useState(false);
  const settings = useSettings();

  useEffect(() => {
    setMounted(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setIsLoading(false);
      });
  }, []);

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter((p: Product) => p.category === filter);

  return (
    <section id="shop" className="py-8 md:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-[2px] bg-[#2d5a27]" aria-hidden="true"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2d5a27]">Premium Selection</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our Fresh <span className="text-[#2d5a27]">Collection</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg leading-relaxed">
            Discover our hand-picked, organic mangoes and fresh seasonal fruits delivered straight from the orchard.
          </p>
        </div>
        
        {/* Category Filters */}
        <div className="w-full md:w-auto flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setFilter('All')}
             className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
               filter === 'All' ? "bg-[#2d5a27] text-white shadow-md shadow-green-900/10" : "text-gray-500 hover:text-gray-900"
             )}
           >
             All
           </button>
           {(settings.categories || []).map((cat: any) => (
             <button 
               key={cat.id}
               onClick={() => setFilter(cat.label)}
               className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
                 filter === cat.label ? "bg-[#2d5a27] text-white shadow-md shadow-green-900/10" : "text-gray-500 hover:text-gray-900"
               )}
             >
               {cat.label}
             </button>
           ))}
        </div>
      </div>

      {/* Product Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {!mounted || isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={`skeleton-${i}`} 
              className="bg-white rounded-2xl aspect-[3/4] animate-pulse border border-gray-100" 
              suppressHydrationWarning
            />
          ))
        ) : filteredProducts.length > 0 ? filteredProducts.map((product, i) => {
          const prices = product.variants?.map(v => v.regularPrice) || [];
          const minPrice = prices.length > 0 ? Math.min(...prices) : (product.regularPrice || product.price || 0);

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative bg-white rounded-2xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100/50"
            >
              {/* Image Container */}
              <Link href={`/shop/${product.id}`} className="relative aspect-square bg-[#f8faf9] overflow-hidden flex items-center justify-center">
                <Image
                  src={product.image.includes('ik.imagekit.io') ? `${product.image}?tr=w-600,f-auto,q-80` : product.image}
                  alt={product.name}
                  fill
                  unoptimized={true}
                  priority={i < 4}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </Link>

              {/* Content Container */}
              <div className="flex flex-col flex-1 p-3 md:p-4">
                <p className="text-[8px] md:text-[10px] font-black text-[#2d5a27] uppercase tracking-widest mb-1 truncate">
                  {product.category}
                </p>
                
                <Link href={`/shop/${product.id}`}>
                  <h3 className="text-[11px] md:text-[15px] font-black text-gray-900 leading-tight line-clamp-2 mb-2 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex flex-col mt-auto mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Starting From</p>
                  <p className="text-sm md:text-lg font-black text-[#2d5a27]">
                    {settings?.currencySymbol || '৳'}{minPrice.toFixed(0)}
                  </p>
                </div>

                <p className="hidden md:block text-[11px] text-gray-400 leading-relaxed mb-4 line-clamp-2">
                  {product.description?.length > 80 ? `${product.description.substring(0, 80)}...` : (product.description || "")}
                </p>

                <div className="mt-auto">
                  <Link 
                    href={`/shop/${product.id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-[#2d5a27] text-white hover:opacity-90 shadow-md"
                  >
                    <Zap size={10} fill="currentColor" /> Select Pack
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full py-20 text-center text-gray-400 font-medium">
            No products found in this category.
          </div>
        )}
      </div>
    </section>
  );
}
