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
        // 브랜드 색상 확장 - 금융 컨설팅에 최적화
        navy: {
          primary: "#1E3A8A", // 더 밝고 접근하기 쉬운 신뢰의 파란색
          dark: "#1E40AF",
          light: "#3B82F6",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        bronze: {
          primary: "#92400E", // 차분하고 프리미엄한 청동색
          light: "#A3541A",
          dark: "#78350F",
          50: "#fefdf2",
          100: "#fef7ed",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#92400e",
          950: "#78350f",
        },
        forest: {
          primary: "#065F46", // 안정성과 성장을 상징하는 포레스트 그린
          light: "#047857",
          dark: "#064E3B",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        // 금융 특화 색상
        "trust-blue": "#2563EB",
        "success-green": "#059669", 
        "warning-amber": "#D97706",
        "premium-purple": "#7C3AED",
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
        // 다크 모드용 UI 색상
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
      backgroundImage: {
        // 브랜드 그라데이션 - 금융 컨설팅에 최적화된 전문적인 색상
        "gradient-brand": "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)",
        "gradient-navy": "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
        "gradient-bronze": "linear-gradient(135deg, #92400E 0%, #A3541A 100%)",
        "gradient-forest": "linear-gradient(135deg, #065F46 0%, #047857 100%)",
        "gradient-trust": "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
        "gradient-success": "linear-gradient(135deg, #059669 0%, #10B981 100%)",
        "gradient-premium": "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "gradient-glass-dark": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        // 애니메이션 그라데이션 - 새로운 브랜드 색상으로 업데이트
        "gradient-animated": "linear-gradient(270deg, #1E3A8A, #2563EB, #3B82F6, #1E3A8A)",
        // 호버 그라데이션 - 더 차분하고 전문적인 느낌
        "gradient-hover": "linear-gradient(135deg, rgba(146,64,14,0.1) 0%, rgba(6,95,70,0.1) 100%)",
        // 가독성을 위한 새로운 미묘한 그라데이션
        "gradient-subtle": "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
        "gradient-overlay": "linear-gradient(135deg, rgba(30,58,138,0.8) 0%, rgba(30,64,175,0.9) 100%)",
      },
      backgroundSize: {
        "gradient-animated": "400% 400%",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Custom border radius
        "custom-sm": "4px",
        "custom-md": "8px",
        "custom-lg": "12px",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // 기존 그림자
        light: "0 2px 10px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 20px rgba(0, 0, 0, 0.1)",
        heavy: "0 8px 30px rgba(0, 0, 0, 0.15)",
        "dark-light": "0 2px 10px rgba(0, 0, 0, 0.2)",
        "dark-medium": "0 4px 20px rgba(0, 0, 0, 0.3)",
        "dark-heavy": "0 8px 30px rgba(0, 0, 0, 0.4)",
        // 글래스모피즘 그림자
        "glass": "0 8px 32px rgba(0, 0, 0, 0.1), 0 1px 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        // 브랜드 그림자 - 새로운 색상에 맞게 업데이트
        "brand": "0 10px 40px rgba(30, 58, 138, 0.3), 0 4px 12px rgba(6, 95, 70, 0.2)",
        "bronze": "0 8px 25px rgba(146, 64, 14, 0.3)",
        "forest": "0 8px 25px rgba(6, 95, 70, 0.3)",
        "navy": "0 8px 25px rgba(30, 58, 138, 0.3)",
        // 호버 그림자
        "hover-light": "0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)",
        "hover-brand": "0 15px 50px rgba(30, 58, 138, 0.4), 0 6px 20px rgba(6, 95, 70, 0.3)",
        "bronze-hover": "0 12px 40px rgba(146, 64, 14, 0.4), 0 4px 16px rgba(163, 84, 26, 0.3)",
        "forest-hover": "0 12px 40px rgba(6, 95, 70, 0.4), 0 4px 16px rgba(4, 120, 87, 0.3)",
        "navy-hover": "0 12px 40px rgba(30, 58, 138, 0.4), 0 4px 16px rgba(37, 130, 246, 0.3)",
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
      blur: {
        xs: "2px",
        "4xl": "72px",
        "5xl": "96px",
      },
      backdropBlur: {
        xs: "2px",
        "4xl": "72px",
        "5xl": "96px",
      },
      transitionTimingFunction: {
        "fo-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      transitionDuration: {
        "fo-fast": "200ms",
        "fo-normal": "300ms",
        "fo-slow": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
      scale: {
        "102": "1.02",
        "103": "1.03",
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
        "fade-in": {
          "0%": { 
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "slide-up": {
          "0%": { 
            opacity: "0",
            transform: "translateY(30px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "slide-down": {
          "0%": { 
            opacity: "0",
            transform: "translateY(-20px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "gradient-move": {
          "0%, 100%": { 
            "background-position": "0% 50%" 
          },
          "50%": { 
            "background-position": "100% 50%" 
          },
        },
        "pulse-soft": {
          "0%, 100%": { 
            opacity: "0.4" 
          },
          "50%": { 
            opacity: "0.8" 
          },
        },
        // 모바일 친화적 키프레임 추가
        "mobile-fade": {
          "0%": { 
            opacity: "0",
            transform: "translateY(15px) scale(0.95)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0) scale(1)"
          },
        },
        "bounce-soft": {
          "0%, 100%": { 
            transform: "translateY(0)" 
          },
          "50%": { 
            transform: "translateY(-5px)" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s cubic-bezier(0.19, 1, 0.22, 1)",
        "slide-up": "slide-up 0.6s cubic-bezier(0.19, 1, 0.22, 1)",
        "slide-down": "slide-down 0.3s cubic-bezier(0.19, 1, 0.22, 1)",
        "gradient-move": "gradient-move 8s ease infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        // 모바일 친화적 애니메이션 추가
        "mobile-fade": "mobile-fade 0.4s ease-out",
        "bounce-soft": "bounce-soft 1s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
