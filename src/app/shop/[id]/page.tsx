"use client";

// ── Product Detail Page (/shop/[id]) ──────────────────────────
// This is the lean orchestrator component. It:
//   - Fetches product data via the API route
//   - Computes shared derived state (prices, gallery images)
//   - Renders sub-components, passing only the props they need
//   - Coordinates state that spans multiple children (variant → image sync)
//
// generateMetadata is defined below (server-only) for SEO.

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUI } from "@/lib/ui";
import { useSettings } from "@/components/SettingsProvider";
import PremiumLoader from "@/components/PremiumLoader";

// Co-located components
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import RelatedProducts from "./components/RelatedProducts";

// Shared types
import { Product, Variant } from "./types";

export default function ProductDetailPage() {
  const params = useParams();
  const settings = useSettings();

  // ── Data state ────────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // ── UI state shared across children ──────────────────────────
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // ── Derived: all unique images (main + gallery + variants) ────
  const allImages = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    const add = (url?: string) => { if (url) seen.add(url); };

    add(product.image);
    product.gallery?.forEach(add);

    return Array.from(seen);
  }, [product]);

  // ── Derived: price logic (Package-based) ──────────────────────
  const activePrice = selectedVariant?.regularPrice ?? product?.regularPrice ?? 0;

  // ── Active display image ──────────────────────────────────────
  // Priority: user-clicked thumbnail > variant image > main product image
  const displayImage = activeImage ?? selectedVariant?.image ?? product?.image ?? "";

  // Reset manual image selection when variant changes
  useEffect(() => { setActiveImage(null); }, [selectedVariant]);

  // ── Fetch product ─────────────────────────────────────────────
  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/products/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return <PremiumLoader />;
  }

  // ── 404 state ─────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8 text-sm">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/shop"
          className="h-12 md:h-14 px-6 md:px-8 bg-[#2d5a27] text-white rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm"
        >
          <ArrowLeft size={18} /> Back to Shop
        </Link>
      </div>
    );
  }

  const currencySymbol = settings?.currencySymbol ?? "৳";

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        <Navbar searchEnabled={false} />

        <main className="py-2 md:py-6 lg:py-4">
          {/* Mobile back link */}
          <div className="flex items-center justify-between lg:justify-end mb-4 md:mb-6">
            <Link
              href="/shop"
              className="flex lg:hidden items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all"
            >
              <ArrowLeft size={14} /> Back to Shop
            </Link>
          </div>

          {/* Desktop: 2-column grid | Mobile: stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-2 md:mt-3">
            {/* Left Column: Images + Package Selector */}
            <div className="lg:col-span-5 space-y-8">
              <ProductImages
                images={allImages}
                activeImage={displayImage}
                onImageChange={setActiveImage}
                productName={product.name}
              />
            </div>

            {/* Right: product info, variants, cart */}
            <ProductInfo
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
              activePrice={activePrice}
              displayImage={displayImage}
              currencySymbol={currencySymbol}
            />
          </div>

          {/* ── Detailed Info Tabs ──────────────────────────────────── */}
          <section className="mt-10 md:mt-16">
            {/* Tab nav */}
            <div className="flex items-center gap-6 md:gap-10 border-b border-gray-100 mb-6 md:mb-8 overflow-x-auto pb-3">
              {(["description", "reviews"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap",
                    activeTab === tab ? "text-black" : "text-gray-300 hover:text-black"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-4 md:-bottom-6 left-0 right-0 h-[2px] md:h-[3px] bg-[#2d5a27] rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[150px] md:min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl"
                >
                  {activeTab === "description" && (
                    <div className="space-y-4">
                      {product.description ? (
                        <p className="text-gray-500 text-sm leading-relaxed font-medium whitespace-pre-line">
                          {product.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No detailed description provided.</p>
                      )}
                    </div>
                  )}


                  {activeTab === "reviews" && (
                    <p className="text-gray-500 italic text-sm">Coming soon…</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* ── Related Products ────────────────────────────────── */}
          <RelatedProducts
            currentProductId={product.id}
            category={product.category}
            currencySymbol={currencySymbol}
          />
        </main>
      </div>

      <Footer />
      
    </div>
  );
}
