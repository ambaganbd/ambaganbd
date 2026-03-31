"use client";

import React from "react";
import { motion } from "framer-motion";

export function PremiumLoader() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fcfdfc]"
    >
      {/* Decorative Orchard Texture Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#2d5a27 0.5px, transparent 0.5px)", backgroundSize: "30px 30px" }} />
      
      <div className="relative flex flex-col items-center">
        {/* Animated Mango Icon */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-10"
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M12 2C12 2 10 3 9 5C8 7 8 9 9 11C10 13 13 14 15 13C17 12 18 9 17 7C16 5 14 4 12 2Z" fill="#2d5a27" /> {/* Leaf */}
            <path d="M12 22C17.5228 22 21 17.5 21 12C21 6.5 17.5 4 12 4C6.5 4 3 6.5 3 12C3 17.5 6.47715 22 12 22Z" fill="#ffb300" /> {/* Mango Body */}
            <path d="M15 8C15 8 13.5 7.5 12 7.5C10.5 7.5 9 8 9 8" stroke="#e6a100" strokeWidth="0.5" strokeLinecap="round" /> {/* Detail */}
          </svg>
        </motion.div>

        {/* Brand Identity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black text-[#2d5a27] tracking-tight uppercase mb-1">
            Am Bagan BD
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-4 bg-gray-200" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
              Premium Fruits
            </p>
            <div className="h-[1px] w-4 bg-gray-200" />
          </div>
        </motion.div>

        {/* Organic Progress Indicator */}
        <div className="mt-12 w-40 h-[1.5px] bg-gray-100 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-1/3 bg-[#ffb300] rounded-full shadow-[0_0_8px_rgba(255,179,0,0.4)]"
          />
        </div>
      </div>

      {/* Soft Ambient Glows */}
      <div className="absolute top-[20%] left-[15%] w-[30%] h-[30%] bg-[#2d5a27]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-[30%] h-[30%] bg-[#ffb300]/5 rounded-full blur-[100px] pointer-events-none" />
    </motion.div>
  );
}

export default PremiumLoader;
