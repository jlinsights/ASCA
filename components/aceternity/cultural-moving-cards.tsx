"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/aceternity-utils";

export const CulturalMovingCards = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    location?: string;
    category?: "calligraphy" | "painting" | "poetry" | "philosophy";
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "30s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "50s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "calligraphy": return "🖋️";
      case "painting": return "🎨";
      case "poetry": return "📜";
      case "philosophy": return "🧘";
      default: return "✨";
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "calligraphy": return "border-ink-black dark:border-rice-paper";
      case "painting": return "border-scholar-red dark:border-scholar-red";
      case "poetry": return "border-bamboo-green dark:border-bamboo-green";
      case "philosophy": return "border-temple-gold dark:border-temple-gold";
      default: return "border-stone-gray dark:border-stone-gray";
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            className={cn(
              "w-[380px] max-w-full relative rounded-2xl border-2 flex-shrink-0 px-8 py-6 md:w-[420px]",
              "bg-silk-cream/50 dark:bg-lacquer-black/50 backdrop-blur-sm",
              getCategoryColor(item.category),
              "shadow-[0_8px_16px_rgb(26_26_26_/_0.1)] dark:shadow-[0_8px_16px_rgb(245_245_240_/_0.1)]"
            )}
            style={{
              background: "linear-gradient(135deg, var(--silk-cream), var(--rice-paper))",
            }}
            key={`cultural-card-${idx}`}
          >
            <blockquote>
              {/* Category indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{getCategoryIcon(item.category)}</span>
                <span className="text-xs uppercase tracking-wider text-stone-gray font-mono">
                  {item.category || "文化"}
                </span>
              </div>
              
              {/* Traditional ink brush stroke decoration */}
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)] opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M10,10 Q50,5 90,20 Q85,50 80,90 Q50,85 10,80 Q15,50 10,10 Z' fill='%23af2626' opacity='0.1'/%3E%3C/svg%3E")`,
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
              
              <span className="relative z-20 text-base leading-[1.8] text-ink-black dark:text-rice-paper font-normal font-calligraphy">
                "{item.quote}"
              </span>
              
              <div className="relative z-20 mt-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-scholar-red dark:text-temple-gold font-calligraphy">
                    {item.name}
                  </span>
                  {item.location && (
                    <span className="text-xs text-stone-gray font-mono">
                      {item.location}
                    </span>
                  )}
                </div>
                <span className="text-sm text-bamboo-green dark:text-celadon-green font-calligraphy">
                  {item.title}
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};