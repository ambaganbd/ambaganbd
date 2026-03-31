// Server Component — no "use client" directive.
// This allows Next.js to SSR the page shell and bake the
// hero image URL into the initial HTML, so the browser can
// start fetching it immediately (before JS runs) → lower LCP.

import React from "react";
import { storage } from "@/lib/storage";
import HeroSlider from "@/components/HeroSlider";
import HomeNavWrapper from "@/components/HomeNavWrapper";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Star, Leaf, ShieldCheck, Truck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function Home() {
  // Fetch settings server-side. Next.js deduplicates this with the
  // layout.tsx call in the same request.
  let settings: any = {};
  let banners: any[] = [];
  try {
    settings = await storage.getSettings();
    banners = (settings as any)?.banners ?? [];
  } catch {
    settings = {};
    banners = [];
  }

  return (
    <div className="flex flex-col w-full">
      {/* Constraints for centered content */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        {/* Navigation Bar — client component (needs useCart / useAuth) */}
        <HomeNavWrapper />

        {/* Hero Slider — client component that receives SSR'd banner data */}
        {banners.length > 0 && <HeroSlider banners={banners} />}

        {/* --- New Section: Browse by Category --- */}
        <section className="mt-12 md:mt-24">
          <div className="flex flex-col items-center text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-black text-gray-950 mb-3">Shop by <span className="text-[#2d5a27]">Category</span></h2>
            <div className="w-12 h-1 bg-amber-500 rounded-full" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
            {[
              { name: 'Mangoes', icon: '/icons/mango-cat.png', bg: 'bg-amber-50' },
              { name: 'Dates', icon: '/icons/dates-cat.png', bg: 'bg-orange-50' },
              { name: 'Berries', icon: '/icons/berries-cat.png', bg: 'bg-red-50' },
              { name: 'Organic Honey', icon: '/icons/honey-cat.png', bg: 'bg-yellow-50' },
              { name: 'Winter Fruits', icon: '/icons/winter-cat.png', bg: 'bg-blue-50' },
              { name: 'View All', icon: '/icons/all-cat.png', bg: 'bg-green-50' },
            ].map((cat, i) => (
              <Link key={i} href="/shop" className="group flex flex-col items-center">
                <div className={cn(
                  "w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 shadow-sm border border-white/50",
                  cat.bg
                )}>
                   {/* Placeholder for category icons - since we don't have them yet, we'll use fallback */}
                   <Leaf className="text-gray-400 group-hover:text-green-600 transition-colors" size={32} />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#2d5a27] transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* --- New Section: The Am Bagan Promise --- */}
        <section className="mt-20 md:mt-32 py-16 px-6 md:px-12 bg-organic-green rounded-[2.5rem] border border-[#2d5a27]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl blob-shape -mr-20 -mt-20" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#2d5a27] shadow-xl shadow-green-900/5 mb-6">
                 <Leaf size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-950 mb-3">Direct from Orchard</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">We skip the middlemen to bring you the freshest harvest within 24 hours of picking.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-xl shadow-amber-900/5 mb-6">
                 <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-950 mb-3">100% Pesticide Free</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">Certified organic processes at every step, ensuring the purest fruit for your family.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#2d5a27] shadow-xl shadow-green-900/5 mb-6">
                 <Truck size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-950 mb-3">Nationwide Express</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">Carefully packed and delivered across Bangladesh with temperature-controlled logistics.</p>
            </div>
          </div>
        </section>

        {/* --- Orchard Moments (Gallery) --- */}
        {settings.orchardMoments && settings.orchardMoments.length > 0 && (
          <section className="mt-20 md:mt-32">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-3">Orchard <span className="text-[#2d5a27]">Moments</span></h2>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest tracking-tighter">Glimpse into our farm life</p>
            </div>
            
            <div className={cn(
              "grid gap-4 md:gap-6 px-2 md:px-0",
              settings.orchardMoments.length === 1 ? "grid-cols-1" :
              settings.orchardMoments.length === 2 ? "grid-cols-2" :
              settings.orchardMoments.length === 3 ? "grid-cols-2 md:grid-cols-3" :
              "grid-cols-2 lg:grid-cols-4"
            )}>
               {(() => {
                  const gallery = settings.orchardMoments;
                  const count = gallery.length;

                  // Specialized layouts for small counts
                  if (count === 1) {
                    return (
                      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-[2rem] md:rounded-[4rem] overflow-hidden group shadow-2xl">
                         <Image src={gallery[0]} alt="Orchard Moment" fill unoptimized className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      </div>
                    );
                  }

                  if (count === 2) {
                    return gallery.map((url: string, i: number) => (
                      <div key={url+i} className="relative aspect-square md:aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-2xl">
                         <Image src={url} alt="Orchard Moment" fill unoptimized className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                      </div>
                    ));
                  }

                  if (count === 3) {
                    return (
                      <>
                        <div className="md:col-span-2 relative aspect-[16/9] md:aspect-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-2xl">
                           <Image src={gallery[0]} alt="Orchard Moment" fill unoptimized className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                        </div>
                        <div className="flex flex-col gap-4 md:gap-6">
                           {gallery.slice(1).map((url: string, i: number) => (
                             <div key={url+i} className="relative flex-1 aspect-square md:aspect-auto rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group shadow-2xl">
                               <Image src={url} alt="Orchard Moment" fill unoptimized className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                             </div>
                           ))}
                        </div>
                      </>
                    );
                  }

                  // Default Masonry-like grid for 4-6 images
                  const columns = [[], [], [], []] as string[][];
                  gallery.forEach((url: string, i: number) => {
                    columns[i % 4].push(url);
                  });

                  return columns.map((colImages, colIdx) => (
                    <div 
                      key={colIdx} 
                      className={cn(
                        "space-y-4 md:space-y-6",
                        colIdx % 2 === 1 ? "pt-8 md:pt-16" : "",
                        colIdx >= 2 ? "hidden lg:block" : ""
                      )}
                    >
                      {colImages.map((imgUrl: string, imgIdx: number) => (
                        <div 
                          key={imgUrl + imgIdx} 
                          className={cn(
                            "relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-green-900/10",
                            (imgIdx + colIdx) % 2 === 0 ? "aspect-[4/5]" : "aspect-square"
                          )}
                        >
                           <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                           <Image 
                             src={imgUrl} 
                             alt={`Orchard Moment ${colIdx}-${imgIdx}`} 
                             fill 
                             unoptimized={true}
                             className="object-cover transition-transform duration-1000 group-hover:scale-110"
                           />
                        </div>
                      ))}
                    </div>
                  ));
               })()}
            </div>
          </section>
        )}
      </div>

      {/* Full Catalog Section */}
      <div className="mt-4 md:mt-16">
        <ProductGrid />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
