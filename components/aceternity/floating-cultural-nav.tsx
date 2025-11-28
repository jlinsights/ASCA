"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/aceternity-utils";

export const FloatingCulturalNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    nameKo?: string;
    nameZh?: string;
    nameJa?: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const [visible, setVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ko' | 'zh' | 'ja'>('ko');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getItemName = (item: typeof navItems[0]) => {
    switch (currentLang) {
      case 'ko': return item.nameKo || item.name;
      case 'zh': return item.nameZh || item.name;
      case 'ja': return item.nameJa || item.name;
      default: return item.name;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{
            opacity: 0,
            y: -100,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            opacity: 0,
            y: -100,
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94], // Cultural gentle easing
          }}
          className={cn(
            "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-stone-gray/20 dark:border-rice-paper/20 rounded-full",
            "dark:bg-lacquer-black/80 bg-silk-cream/80 backdrop-blur-md",
            "shadow-[0px_2px_3px_-1px_rgba(26,26,26,0.1),0px_1px_0px_0px_rgba(175,38,38,0.02),0px_0px_0px_1px_rgba(107,124,50,0.08)]",
            "z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4",
            className
          )}
        >
          {navItems.map((navItem, idx) => (
            <a
              key={`cultural-link-${idx}`}
              href={navItem.link}
              className={cn(
                "relative dark:text-rice-paper text-ink-black items-center flex space-x-1",
                "dark:hover:text-temple-gold hover:text-scholar-red transition-colors duration-300",
                "font-calligraphy"
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block text-sm font-medium">
                {getItemName(navItem)}
              </span>
            </a>
          ))}
          
          {/* Language toggle */}
          <button 
            onClick={() => {
              const langs: Array<'en' | 'ko' | 'zh' | 'ja'> = ['ko', 'zh', 'ja', 'en'];
              const currentIndex = langs.indexOf(currentLang);
              setCurrentLang(langs[(currentIndex + 1) % langs.length]!);
            }}
            className="text-xs px-2 py-1 rounded-full bg-bamboo-green/20 text-bamboo-green hover:bg-bamboo-green/30 transition-colors"
          >
            {currentLang.toUpperCase()}
          </button>

          <button className="border text-sm font-medium relative border-scholar-red/30 dark:border-temple-gold/30 text-scholar-red dark:text-temple-gold px-4 py-2 rounded-full hover:bg-scholar-red/10 dark:hover:bg-temple-gold/10 transition-colors font-calligraphy">
            <span>문의하기</span>
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-scholar-red dark:via-temple-gold to-transparent h-px" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};