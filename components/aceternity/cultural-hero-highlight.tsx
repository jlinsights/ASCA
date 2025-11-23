"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/aceternity-utils";

export const CulturalHeroHighlight = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "relative h-[40rem] md:h-[50rem] w-full rounded-md flex flex-col items-center justify-center antialiased",
        "bg-rice-paper dark:bg-lacquer-black overflow-hidden",
        "bg-gradient-to-b from-silk-cream to-rice-paper dark:from-ink-black dark:to-lacquer-black",
        containerClassName
      )}
    >
      {/* Traditional paper texture */}
      <div 
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-opacity='0.05'%3E%3Cpolygon fill='%23af2626' points='30 0 36 24 60 30 36 36 30 60 24 36 0 30 24 24'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Cultural radial mask */}
      <div className="absolute inset-0 w-full h-full bg-rice-paper dark:bg-lacquer-black [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:[mask-image:radial-gradient(farthest-side_at_top,black,transparent)]" />
      
      <div className={cn("relative z-20", className)}>{children}</div>
    </div>
  );
};

export const CulturalHighlight = ({
  children,
  className,
  variant = "scholar"
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "scholar" | "bamboo" | "temple" | "ink";
}) => {
  
  const variantStyles = {
    scholar: "bg-gradient-to-r from-scholar-red/30 to-scholar-red/50 dark:from-scholar-red/20 dark:to-scholar-red/40",
    bamboo: "bg-gradient-to-r from-bamboo-green/30 to-bamboo-green/50 dark:from-bamboo-green/20 dark:to-bamboo-green/40",
    temple: "bg-gradient-to-r from-temple-gold/30 to-temple-gold/50 dark:from-temple-gold/20 dark:to-temple-gold/40",
    ink: "bg-gradient-to-r from-ink-black/20 to-stone-gray/30 dark:from-rice-paper/20 dark:to-rice-paper/40"
  };

  return (
    <motion.span
      initial={{
        backgroundSize: "0% 100%",
      }}
      animate={{
        backgroundSize: "100% 100%",
      }}
      transition={{
        duration: 2.5,
        ease: [0.25, 0.46, 0.45, 0.94], // Cultural gentle easing
        delay: 0.8,
      }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline",
      }}
      className={cn(
        `relative inline-block pb-1 px-2 rounded-lg`,
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.span>
  );
};