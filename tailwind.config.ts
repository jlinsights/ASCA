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
        // Traditional East Asian Color Palette (Obang Colors + Cultural Extensions)
        "ink-black": "#1a1a1a",
        "rice-paper": "#f5f5f0",
        "scholar-red": "#af2626",
        "celadon-green": "#88A891",
        "stone-gray": "#707070",
        
        // Traditional Five Elements Colors (Obang)
        "east-wood": "#4a7c59",       // Spring/Wood - Eastern Direction
        "south-fire": "#d73527",      // Summer/Fire - Southern Direction  
        "center-earth": "#f4e2d7",    // Late Summer/Earth - Center
        "west-metal": "#f2f2f2",      // Autumn/Metal - Western Direction
        "north-water": "#1e3a8a",     // Winter/Water - Northern Direction
        
        // Cultural Seasonal Palette
        "spring-blossom": "#fad0c4",  // Cherry blossom pink
        "summer-jade": "#7dd3c0",     // Jade green
        "autumn-gold": "#fdb462",     // Golden leaf
        "winter-snow": "#ffffff",     // Pure snow white
        
        // Calligraphy Materials
        "bamboo-green": "#6b7c32",    // Bamboo brush handle
        "silk-cream": "#faf7f0",      // Silk paper texture
        "lacquer-black": "#0d1b2a",   // Lacquer ink stone
        "vermillion": "#e63946",      // Traditional red seal
        
        // Cultural Accents
        "temple-gold": "#d4af37",     // Temple decoration
        "moon-silver": "#c0c0c0",     // Moonlight reflection
        "plum-purple": "#8e4585",     // Plum blossom
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
        // Aceternity UI keyframes
        'meteor': {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
        },
        'gradient': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'ripple': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(0.9)',
          },
        },
        'grid': {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'spin-around': {
          '0%': {
            transform: 'translateZ(0) rotate(0)',
          },
          '15%, 35%': {
            transform: 'translateZ(0) rotate(90deg)',
          },
          '65%, 85%': {
            transform: 'translateZ(0) rotate(270deg)',
          },
          '100%': {
            transform: 'translateZ(0) rotate(360deg)',
          },
        },
        'slide': {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)',
          },
        },
        'spotlight': {
          '0%': {
            opacity: '0',
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%,-40%) scale(1)',
          },
        },
        'shimmer': {
          from: {
            backgroundPosition: '0 0',
          },
          to: {
            backgroundPosition: '-200% 0',
          },
        },
        'aurora': {
          from: {
            backgroundPosition: '50% 50%, 50% 50%',
          },
          to: {
            backgroundPosition: '350% 50%, 350% 50%',
          },
        },
        'scroll': {
          to: {
            transform: 'translate(calc(-50% - 0.5rem))',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ink-spread": "ink-spread 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        // Aceternity UI animations
        'meteor-effect': 'meteor 5s linear infinite',
        'gradient': 'gradient 15s ease infinite',
        'ripple': 'ripple 3400ms ease infinite',
        'grid': 'grid 15s linear infinite',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
        'slide': 'slide var(--speed) ease-in-out infinite alternate',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'aurora': 'aurora 60s linear infinite',
        'scroll': 'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
      },
      fontFamily: {
        // Primary Typography System
        sans: [
          "'Inter'",
          "'Noto Sans CJK KR'",
          "'Noto Sans CJK SC'",
          "'Noto Sans CJK TC'",
          "'Noto Sans CJK JP'",
          "system-ui",
          "sans-serif"
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
        
        // Cultural Typography Variants
        calligraphy: [
          "'Source Han Serif SC'",
          "'Source Han Serif TC'", 
          "'Noto Serif CJK SC'",
          "'Noto Serif CJK TC'", 
          "'Noto Serif CJK KR'", 
          "'Noto Serif CJK JP'", 
          "'KaiTi'",
          "'STKaiti'",
          "serif"
        ],
        brush: [
          "'Ma Shan Zheng'",
          "'Long Cang'",
          "'Source Han Serif SC'",
          "'Noto Serif CJK SC'",
          "cursive"
        ],
        
        // Language-Specific Optimizations
        korean: [
          "'Noto Serif CJK KR'",
          "'Source Han Serif KR'",
          "'Nanum Myeongjo'",
          "'Batang'",
          "serif"
        ],
        chinese: [
          "'Source Han Serif SC'",
          "'Noto Serif CJK SC'",
          "'SimSun'",
          "'Microsoft YaHei'",
          "serif"
        ],
        japanese: [
          "'Noto Serif CJK JP'",
          "'Source Han Serif JP'",
          "'Yu Mincho'",
          "'Hiragino Mincho Pro'",
          "serif"
        ],
        english: [
          "'Playfair Display'",
          "'Crimson Text'",
          "'Georgia'",
          "serif"
        ],
        
        // Specialized Typography
        mono: [
          "'JetBrains Mono'",
          "'SF Mono'",
          "'Monaco'",
          "'Consolas'",
          "monospace"
        ]
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
