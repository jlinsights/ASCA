import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from 'react';

// Enhanced cn function for Aceternity UI
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function for generating random values
export const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Traditional East Asian color palette for calligraphy-themed effects
export const culturalColors = [
  "#af2626", // scholar-red
  "#4a7c59", // east-wood
  "#d73527", // south-fire
  "#1e3a8a", // north-water
  "#6b7c32", // bamboo-green
  "#8e4585", // plum-purple
  "#d4af37", // temple-gold
];

// Generate gradient string for backgrounds with cultural colors
export const generateCulturalGradient = (colors: string[] = culturalColors) => {
  return `linear-gradient(45deg, ${colors.join(", ")})`;
};

// Utility for creating SVG patterns with East Asian motifs
export const createPattern = (id: string, children: string) => {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <defs>
        <pattern id="${id}" patternUnits="userSpaceOnUse" width="60" height="60">
          ${children}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#${id})" />
    </svg>
  `)}`;
};

// Mouse position tracking utility
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  
  return mousePosition;
};

// Animation delay utility with cultural timing
export const getAnimationDelay = (index: number, baseDelay: number = 0.15) => {
  return `${index * baseDelay}s`;
};

// Generate traditional bamboo pattern for backgrounds
export const generateBambooPattern = (color: string = "#6b7c32", opacity: number = 0.1) => {
  return createPattern("bamboo", `
    <line x1="10" y1="0" x2="10" y2="60" stroke="${color}" stroke-width="2" opacity="${opacity}" />
    <line x1="30" y1="0" x2="30" y2="60" stroke="${color}" stroke-width="2" opacity="${opacity}" />
    <line x1="50" y1="0" x2="50" y2="60" stroke="${color}" stroke-width="2" opacity="${opacity}" />
    <circle cx="10" cy="15" r="1" fill="${color}" opacity="${opacity}" />
    <circle cx="30" cy="35" r="1" fill="${color}" opacity="${opacity}" />
    <circle cx="50" cy="25" r="1" fill="${color}" opacity="${opacity}" />
  `);
};

// Generate traditional dots pattern (representing calligraphy dots)
export const generateCalligraphyDots = (color: string = "#1a1a1a", opacity: number = 0.1) => {
  return createPattern("calligraphy-dots", `
    <circle cx="15" cy="15" r="2" fill="${color}" opacity="${opacity}" />
    <circle cx="45" cy="45" r="2" fill="${color}" opacity="${opacity}" />
    <circle cx="45" cy="15" r="1.5" fill="${color}" opacity="${opacity}" />
    <circle cx="15" cy="45" r="1.5" fill="${color}" opacity="${opacity}" />
  `);
};

// Shimmer effect utility with ink-like appearance
export const getInkShimmerGradient = (direction: string = "to right") => {
  return `linear-gradient(${direction}, transparent 0%, rgba(26,26,26,0.3) 50%, transparent 100%)`;
};

// Text gradient utility using traditional colors
export const getCulturalTextGradient = (colors: string[] = culturalColors.slice(0, 3)) => {
  return {
    background: generateCulturalGradient(colors),
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };
};

// Perspective card utilities with calligraphy-inspired movement
export const getCardTransform = (x: number, y: number, rect: DOMRect) => {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const rotateX = (y - centerY) / 15; // Gentler movement for cultural elegance
  const rotateY = (centerX - x) / 15;
  
  return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
};

// Ink spread effect utility (inspired by traditional ink painting)
export const generateInkSpread = () => {
  if (typeof window === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = 120;
  canvas.height = 120;
  
  // Create gradient that mimics ink spreading
  const gradient = ctx.createRadialGradient(60, 60, 0, 60, 60, 60);
  gradient.addColorStop(0, 'rgba(26, 26, 26, 0.4)');
  gradient.addColorStop(0.5, 'rgba(26, 26, 26, 0.2)');
  gradient.addColorStop(1, 'rgba(26, 26, 26, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 120, 120);
  
  return canvas.toDataURL();
};

// Cultural animation timing functions
export const culturalEasing = {
  gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Like flowing water
  brush: 'cubic-bezier(0.17, 0.67, 0.83, 0.67)', // Like brush strokes
  ink: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Like ink spreading
  wind: 'cubic-bezier(0.23, 1, 0.32, 1)', // Like gentle wind
};

// Language-specific utilities for ASCA's multilingual content
export const getLanguageDirection = (language: 'ko' | 'zh' | 'ja' | 'en') => {
  const directions = {
    ko: 'horizontal', // Modern Korean is horizontal
    zh: 'vertical',   // Traditional Chinese can be vertical
    ja: 'vertical',   // Traditional Japanese can be vertical
    en: 'horizontal', // English is horizontal
  };
  return directions[language];
};

// Generate traditional paper texture
export const generatePaperTexture = () => {
  if (typeof window === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = 200;
  canvas.height = 200;
  
  // Base paper color
  ctx.fillStyle = '#faf7f0';
  ctx.fillRect(0, 0, 200, 200);
  
  // Add subtle texture
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 10;
    data[i] = 250 - noise;     // red
    data[i + 1] = 247 - noise; // green
    data[i + 2] = 240 - noise; // blue
    data[i + 3] = 255;         // alpha
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};