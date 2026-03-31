"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, Variant } from "../types";
import AddToCartButton from "./AddToCartButton";

interface ProductInfoProps {
  product: Product;
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant) => void;
  activePrice: number;
  displayImage: string;
  currencySymbol?: string;
}

export default function ProductInfo({
  product,
  selectedVariant,
  onVariantChange,
  activePrice,
  displayImage,
  currencySymbol = "৳",
}: ProductInfoProps) {
  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-7 flex flex-col pt-2 md:pt-0"
    >
      {/* ── Header: category badge + rating + name + price ── */}
      <div className="mb-3 md:mb-4">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-[#2d5a27] text-white rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
            {product.category}
          </span>
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 rounded-full border border-gray-100">
            <Star size={9} className="text-black fill-current" />
            <span className="text-[8px] font-bold text-black">
              {product.rating?.toFixed(1) ?? "4.9"} / 5.0
            </span>
          </div>
        </div>

        {/* Product name */}
        <h1 className="text-base md:text-xl font-black text-gray-900 mb-1.5 tracking-tight leading-tight">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-xl md:text-2xl font-black text-[#2d5a27]">
            {currencySymbol}{activePrice.toFixed(0)}
          </span>
          <span className="text-xs text-gray-400 font-medium">/per box</span>
        </div>
      </div>

      {/* ── Package Selector (Stacked List) ── */}
      {hasVariants && (
        <div className="mb-4">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
            Select Package
          </p>
          <div className="flex flex-col gap-1.5">
            {product.variants!.map((v) => (
              <button
                key={v.id}
                onClick={() => onVariantChange(v)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold border-2 transition-all duration-200",
                  selectedVariant?.id === v.id
                    ? "bg-[#2d5a27] text-white border-[#2d5a27] shadow-sm"
                    : "bg-white text-gray-700 hover:border-[#2d5a27] border-gray-200"
                )}
              >
                {product.name} — {v.name} Kg{" "}
                <span className={cn(
                  "font-bold",
                  selectedVariant?.id === v.id ? "text-white" : "text-[#2d5a27]"
                )}>
                  ({currencySymbol} {v.regularPrice})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Add to Cart / Buy Now ── */}
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
        <AddToCartButton
          productId={product.id}
          productName={product.name}
          activePrice={activePrice}
          displayImage={displayImage}
          selectedVariant={selectedVariant}
          hasVariants={hasVariants}
          quantity={1}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* ── About this item ── */}
      {product.aboutItem && (
        <div className="mb-4">
          <div className="w-6 h-0.5 bg-gray-200 mb-3" />
          <h3 className="text-[9px] font-black text-gray-900 uppercase tracking-widest mb-2">
            About This Item
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed font-medium max-w-xl whitespace-pre-line">
            {product.aboutItem}
          </p>
        </div>
      )}
    </motion.div>
  );
}
