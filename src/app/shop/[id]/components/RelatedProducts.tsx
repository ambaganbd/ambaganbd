"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Product } from "../types";
import { useSettings } from "@/components/SettingsProvider";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  currencySymbol?: string;
}

export default function RelatedProducts({
  currentProductId,
  category,
  currencySymbol = "৳",
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const settings = useSettings();
  const symbol = settings?.currencySymbol || currencySymbol;

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((all: Product[]) => {
        const related = all
          .filter(
            (p) =>
              p.id !== currentProductId &&
              p.category?.toLowerCase() === category?.toLowerCase()
          )
          .slice(0, 6);
        setProducts(related);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentProductId, category]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-10 md:mt-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-widest">
          Related Products
        </h2>
        <div className="flex-1 h-px bg-gray-100" />
        <Link
          href={`/shop?category=${encodeURIComponent(category)}`}
          className="text-[9px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-all"
        >
          View All →
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-[200px] md:h-[280px] animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product, i) => {
            // Price from cheapest variant, fallback to product price
            const prices = product.variants?.map((v) => v.regularPrice) || [];
            const minPrice =
              prices.length > 0
                ? Math.min(...prices)
                : product.regularPrice ?? product.price ?? 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative bg-white rounded-2xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image */}
                <Link
                  href={`/shop/${product.id}`}
                  className="relative aspect-square bg-[#f8faf9] overflow-hidden flex items-center justify-center"
                >
                  {product.image && (
                    <Image
                      src={
                        product.image.includes("ik.imagekit.io")
                          ? `${product.image}?tr=w-400,f-auto,q-80`
                          : product.image
                      }
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                </Link>

                {/* Info */}
                <div className="flex flex-col flex-1 p-2 md:p-3">
                  <p className="text-[7px] md:text-[9px] font-black text-[#2d5a27] uppercase tracking-widest mb-0.5 truncate">
                    {product.category}
                  </p>
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="text-[10px] md:text-xs font-black text-gray-900 leading-tight line-clamp-2 mb-1.5 hover:text-[#2d5a27] transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex flex-col mt-auto mb-2">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">
                      Starting From
                    </p>
                    <p className="text-xs md:text-sm font-black text-[#2d5a27]">
                      {symbol}{minPrice.toFixed(0)}
                    </p>
                  </div>

                  <p className="hidden md:block text-[10px] text-gray-400 leading-relaxed mb-3 line-clamp-2">
                    {product.description?.length > 80
                      ? `${product.description.substring(0, 80)}...`
                      : product.description || ""}
                  </p>

                  {/* Button */}
                  <div className="mt-auto">
                    <Link
                      href={`/shop/${product.id}`}
                      className="flex items-center justify-center gap-1 w-full py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-[#2d5a27] text-white hover:opacity-90 transition-all"
                    >
                      <Zap size={9} fill="currentColor" /> Select Pack
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
