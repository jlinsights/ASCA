"use client";

import React from "react";
import { cn } from "@/lib/aceternity-utils";

export const InkMeteors = ({
  number = 15,
  className,
  color = "ink-black"
}: {
  number?: number;
  className?: string;
  color?: "ink-black" | "scholar-red" | "bamboo-green" | "temple-gold";
}) => {
  const meteors = new Array(number || 15).fill(true);
  
  const colorClasses = {
    "ink-black": "bg-ink-black shadow-[0_0_0_1px_#1a1a1a20] before:from-[#1a1a1a] before:to-transparent",
    "scholar-red": "bg-scholar-red shadow-[0_0_0_1px_#af262620] before:from-[#af2626] before:to-transparent",
    "bamboo-green": "bg-bamboo-green shadow-[0_0_0_1px_#6b7c3220] before:from-[#6b7c32] before:to-transparent",
    "temple-gold": "bg-temple-gold shadow-[0_0_0_1px_#d4af3720] before:from-[#d4af37] before:to-transparent"
  };
  
  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={"ink-meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] rotate-[215deg]",
            colorClasses[color],
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r",
            className
          )}
          style={{
            top: Math.random() * (400 - -400) + -400 + "px",
            left: Math.random() * (400 - -400) + -400 + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.random() * (12 - 3) + 3 + "s", // Slower, more graceful
          }}
        ></span>
      ))}
    </>
  );
};