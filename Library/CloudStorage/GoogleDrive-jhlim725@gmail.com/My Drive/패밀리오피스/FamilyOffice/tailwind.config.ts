import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"], // 클래스 기반 다크모드 사용
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
        // 브랜드 색상
        navy: {
          primary: "#1A1A2E",
          dark: "#101022",
          light: "#2A2A3E",
        },
        gold: {
          primary: "#C9B037",
          light: "#D6C158",
          dark: "#B09020",
        },
        burgundy: {
          primary: "#800020",
          light: "#9A112E",
        },
        // 라이트 모드용 UI 색상
        light: {
          bg: {
            primary: "#FFFFFF",
            secondary: "#F8F8F8",
            tertiary: "#EFEFEF",
          },
          text: {
            primary: "#1A1A2E",
            secondary: "#444444",
            tertiary: "#777777",
          },
          border: "#E0E0E0",
        },
        // 다크 모드용 UI 색상 (자동으로 다크 모드에서 사용됨)
        dark: {
          bg: {
            primary: "#121220",
            secondary: "#1A1A2E",
            tertiary: "#252538",
          },
          text: {
            primary: "#F0F0F0",
            secondary: "#D0D0D0",
            tertiary: "#A0A0A0",
          },
          border: "#2A2A3E",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Custom border radius
        "custom-sm": "4px",
        "custom-md": "8px",
        "custom-lg": "12px",
      },
      boxShadow: {
        light: "0 2px 10px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 20px rgba(0, 0, 0, 0.1)",
        heavy: "0 8px 30px rgba(0, 0, 0, 0.15)",
        "dark-light": "0 2px 10px rgba(0, 0, 0, 0.2)",
        "dark-medium": "0 4px 20px rgba(0, 0, 0, 0.3)",
        "dark-heavy": "0 8px 30px rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "var(--font-baskerville)", "var(--font-nanum-myeongjo)", ...fontFamily.serif],
        body: ["var(--font-body)", "var(--font-gotham)", "var(--font-noto-sans-kr)", ...fontFamily.sans],
      },
      spacing: {
        xs: "8px",
        sm: "16px",
        md: "24px",
        lg: "48px",
        xl: "100px",
      },
      transitionTimingFunction: {
        "fo-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "fo-fast": "200ms",
        "fo-normal": "300ms",
        "fo-slow": "500ms",
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
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.3s ease-in-out forwards",
        "fade-out": "fadeOut 0.3s ease-in-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
