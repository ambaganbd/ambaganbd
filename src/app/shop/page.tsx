"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, Filter, ArrowRight, X, Plus, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/components/SettingsProvider";
import { Suspense } from "react";
import PremiumLoader from "@/components/PremiumLoader";

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

function ShopContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortOrder, setSortOrder] = useState("default");
  
  const { addItem } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...products];
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    result = result.filter(p => {
      const prices = p.variants?.map(v => v.regularPrice) || [];
      const minPrice = prices.length > 0 ? Math.min(...prices) : (p.regularPrice || p.price || 0);
      return minPrice <= maxPrice;
    });

    if (sortOrder === "price-asc") {
      result.sort((a, b) => {
        const aPrices = a.variants?.map(v => v.regularPrice) || [];
        const aPrice = aPrices.length > 0 ? Math.min(...aPrices) : (a.regularPrice || a.price || 0);
        const bPrices = b.variants?.map(v => v.regularPrice) || [];
        const bPrice = bPrices.length > 0 ? Math.min(...bPrices) : (b.regularPrice || b.price || 0);
        return aPrice - bPrice;
      });
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => {
        const aPrices = a.variants?.map(v => v.regularPrice) || [];
        const aPrice = aPrices.length > 0 ? Math.min(...aPrices) : (a.regularPrice || a.price || 0);
        const bPrices = b.variants?.map(v => v.regularPrice) || [];
        const bPrice = bPrices.length > 0 ? Math.min(...bPrices) : (b.regularPrice || b.price || 0);
        return bPrice - aPrice;
      });
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, maxPrice, sortOrder, products]);

  const settings = useSettings();
  const categories = ["All", ...(settings.categories?.map((c: any) => c.label) || ["Premium Mango", "Local Fruits", "Organic Combo"])];

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (!mounted) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
          <div className="h-16 w-full animate-pulse bg-white rounded-2xl mt-4 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8 mt-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl h-[280px] md:h-[380px] animate-pulse border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        <Navbar 
          searchEnabled={true} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <header className="mb-4 mt-4 md:mb-6 md:mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex justify-end md:hidden">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#2d5a27] text-white rounded-full text-xs font-bold shadow-xl shadow-green-900/10 transition-all w-full justify-center"
              >
                <Filter size={14} />
                Filters & Refine
              </button>
           </div>

           <div className="hidden md:flex items-center justify-between w-full">
             <div className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
                {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                          "px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap",
                          selectedCategory === cat 
                            ? "bg-[#2d5a27] text-white shadow-md shadow-green-900/10" 
                            : "bg-transparent text-gray-500 hover:bg-white hover:text-[#2d5a27] hover:shadow-sm"
                      )}
                    >
                      {cat}
                    </button>
                ))}
             </div>

             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sort By</span>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-xs font-bold text-[#2d5a27] py-2.5 pl-4 pr-10 rounded-xl cursor-pointer outline-none focus:ring-2 focus:ring-[#2d5a27] transition-all shadow-sm"
                  >
                    <option value="default">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#2d5a27]"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
             </div>
           </div>
        </header>

        <AnimatePresence>
          {isFilterOpen && (
            <div className="fixed inset-0 z-[200] md:hidden">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="absolute inset-0 bg-[#2d5a27]/40 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-2xl overflow-y-auto max-h-[85vh]"
              >
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8" />
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Refine Results</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-50 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Categories</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                                selectedCategory === cat 
                                  ? "bg-[#2d5a27] text-white border-[#2d5a27] shadow-lg shadow-green-900/10" 
                                  : "bg-gray-50 text-gray-500 border-gray-50"
                            )}
                          >
                            {cat}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price Range</h4>
                      <span className="text-sm font-bold text-[#2d5a27]">{settings?.currencySymbol || '৳'}{maxPrice}</span>
                    </div>
                    <input 
                      type="range" min="0" max="2000" step="50"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#2d5a27] h-1.5 bg-gray-100 rounded-full appearance-none"
                    />
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Sort By</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "default", label: "Recommended" },
                        { id: "price-asc", label: "Price: Low to High" },
                        { id: "price-desc", label: "Price: High to Low" }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSortOrder(option.id)}
                          className={cn(
                            "text-left px-5 py-4 rounded-xl text-xs font-bold transition-all border",
                            sortOrder === option.id 
                              ? "bg-[#2d5a27] text-white border-[#2d5a27]" 
                              : "bg-gray-50 text-gray-500 border-gray-50"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-5 bg-[#2d5a27] text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-green-900/20"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4 mt-2 md:mt-4 relative w-full">
          <main className="w-full">
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              {isLoading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white rounded-2xl h-[280px] md:h-[380px] animate-pulse border border-gray-100" />
                  ))
              ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product, i) => {
                    const prices = product.variants?.map(v => v.regularPrice) || [];
                    const minPrice = prices.length > 0 ? Math.min(...prices) : (product.regularPrice || product.price || 0);

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="group relative bg-white rounded-2xl transition-all duration-300 flex flex-col overflow-hidden"
                      >
                        <Link href={`/shop/${product.id}`} className="relative aspect-square bg-[#f8faf9] overflow-hidden flex items-center justify-center">
                          <Image
                            src={product.image.includes('ik.imagekit.io') ? `${product.image}?tr=w-600,f-auto,q-80` : product.image}
                            alt={product.name}
                            fill
                            unoptimized={true}
                            priority={i < 4}
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out"
                          />
                        </Link>
   
                        <div className="flex flex-col flex-1 p-2.5 md:p-4">
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
                              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[9px] font-black text-center transition-all uppercase tracking-widest bg-[#2d5a27] text-white hover:opacity-90 shadow-md"
                            >
                              <Zap size={10} fill="currentColor" /> Select Pack
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
              ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 font-bold text-lg">No products found for this category or search.</p>
                  </div>
              )}
             </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<PremiumLoader />}>
      <ShopContent />
    </Suspense>
  );
}
