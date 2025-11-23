"use client";

import React from "react";
import { cn } from "@/lib/aceternity-utils";

export const CalligraphyBeams = ({ className }: { className?: string }) => {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
    "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
    "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
    "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835",
  ];

  return (
    <div
      className={cn(
        "absolute h-screen w-full bg-rice-paper dark:bg-ink-black bg-gradient-to-b from-silk-cream to-rice-paper dark:from-lacquer-black dark:to-ink-black",
        className
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.3">
          {paths.map((path, index) => (
            <path
              key={index}
              d={path}
              stroke={`url(#paint${index}_linear)`}
              strokeOpacity="0.6"
              strokeWidth="1"
            />
          ))}
        </g>
        <defs>
          {paths.map((_, index) => (
            <linearGradient
              key={index}
              id={`paint${index}_linear`}
              x1="352"
              y1="338"
              x2="179.5"
              y2="-37.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6b7c32" stopOpacity="0" />
              <stop offset="0.325" stopColor="#af2626" />
              <stop offset="0.7" stopColor="#d4af37" />
              <stop offset="1" stopColor="#1e3a8a" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
      
      {/* Cultural gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-bamboo-green/10 via-scholar-red/10 to-temple-gold/10 animate-gradient"></div>
      
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%23000' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};