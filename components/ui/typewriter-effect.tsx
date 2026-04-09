"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypewriterEffectProps {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
  html?: boolean; // If true, process as HTML string (simplified support)
}

// Simplified version for the specific use case (handling <br/> manually or just text)
export const TypewriterEffect = ({
  text,
  className,
  delay = 0,
  duration = 3,
}: {
  text: string; // Accepts HTML string like "Line 1<br />Line 2"
  className?: string;
  delay?: number;
  duration?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsStarted(true);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    // Use pure text length for timing, but we need to handle HTML tags roughly
    // For simplicity, we'll just increment character by character, but if we hit '<', we find '>' and skip
    
    let currentIndex = 0;
    const totalLength = text.length;
    // Calculate step time based on total duration (rough approximation)
    // duration is in seconds.
    const stepTime = (duration * 1000) / totalLength;

    const intervalId = setInterval(() => {
      if (currentIndex >= text.length) {
        clearInterval(intervalId);
        return;
      }

      // Check if current char is start of tag
      if (text[currentIndex] === '<') {
        const closingIndex = text.indexOf('>', currentIndex);
        if (closingIndex !== -1) {
          currentIndex = closingIndex + 1; // Jump after tag
        } else {
          currentIndex++;
        }
      } else {
        currentIndex++;
      }
      
      setDisplayedText(text.slice(0, currentIndex));

    }, stepTime);

    return () => clearInterval(intervalId);
  }, [text, duration, isStarted]);

  return (
    <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {displayedText.replace(/<br\s*\/?>/gi, '\n')}
    </div>
  );
};
