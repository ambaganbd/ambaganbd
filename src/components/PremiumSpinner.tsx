"use client";

import React from "react";
import { motion } from "framer-motion";

interface PremiumSpinnerProps {
  size?: "sm" | "md" | "lg";
  light?: boolean;
}

export default function PremiumSpinner({ size = "md", light = false }: PremiumSpinnerProps) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4",
  };

  // Brand Colors for the Organic Spinner
  // light mode (over dark): focus on Mango Gold
  // normal mode (over white): focus on Orchard Green with Mango accent
  const baseColor = light ? "border-white/10" : "border-[#2d5a27]/5";
  const accentColor = light ? "border-t-[#ffb300]" : "border-t-[#ffb300]";

  return (
    <div className={`relative ${sizeMap[size].split(" ").slice(0, 2).join(" ")} flex items-center justify-center`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className={`${sizeMap[size]} rounded-full ${baseColor} ${accentColor}`}
      />
      {/* Tiny inner organic pulse */}
      {size !== "sm" && (
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute rounded-full bg-[#2d5a27]/10 ${size === "lg" ? "w-4 h-4" : "w-2 h-2"}`}
        />
      )}
    </div>
  );
}
