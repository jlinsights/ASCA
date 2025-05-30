import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand colors
        "ink-black": "#1a1a1a",
        "rice-paper": "#f5f5f0",
        "scholar-red": "#af2626",
        "celadon-green": "#88A891",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "ink-spread": {
          "0%": {
            width: "0px",
            height: "0px",
            opacity: "0.8",
          },
          "100%": {
            width: "300vw",
            height: "300vw",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ink-spread": "ink-spread 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
      },
      fontFamily: {
        sans: [
          "'Playfair Display'",
          "'Source Han Serif SC'",
          "'Source Han Serif TC'", 
          "'Noto Serif CJK SC'",
          "'Noto Serif CJK TC'", 
          "'Noto Serif CJK KR'", 
          "'Noto Serif CJK JP'", 
          "serif"
        ],
        serif: [
          "'Playfair Display'",
          "'Source Han Serif SC'",
          "'Source Han Serif TC'",
          "'Noto Serif CJK SC'",
          "'Noto Serif CJK TC'", 
          "'Noto Serif CJK KR'", 
          "'Noto Serif CJK JP'", 
          "serif"
        ],
        calligraphy: [
          "'Source Han Serif SC'",
          "'Source Han Serif TC'", 
          "'Noto Serif CJK SC'",
          "'Noto Serif CJK TC'", 
          "'Noto Serif CJK KR'", 
          "'Noto Serif CJK JP'", 
          "serif"
        ],
        english: [
          "'Playfair Display'",
          "serif"
        ]
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
