import type { Config } from 'tailwindcss'

// shadcn 슬롯은 app/globals.css 의 hex 변수(var(--primary) 등)를 그대로 읽는다.
// Tailwind 3 는 var() 색에 투명도를 붙일 수 없어 bg-primary/10 같은 클래스가 CSS 를 만들지 않았다.
// color-mix 로 감싸면 /N 클래스가 실제로 칠해지고, 라이트·다크 값은 변수 쪽에서 계속 바뀐다.
// (scholar-red 는 RGB 삼중값 변수 방식 — 새 변수를 늘리지 않으려고 여기서는 color-mix 를 쓴다)
const withAlpha = (name: string) =>
  `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: withAlpha('border'),
        input: withAlpha('input'),
        ring: withAlpha('ring'),
        background: withAlpha('background'),
        foreground: withAlpha('foreground'),
        primary: {
          DEFAULT: withAlpha('primary'),
          foreground: withAlpha('primary-foreground'),
        },
        secondary: {
          DEFAULT: withAlpha('secondary'),
          foreground: withAlpha('secondary-foreground'),
        },
        destructive: {
          DEFAULT: withAlpha('destructive'),
          foreground: withAlpha('destructive-foreground'),
        },
        muted: {
          DEFAULT: withAlpha('muted'),
          foreground: withAlpha('muted-foreground'),
        },
        accent: {
          DEFAULT: withAlpha('accent'),
          foreground: withAlpha('accent-foreground'),
        },
        popover: {
          DEFAULT: withAlpha('popover'),
          foreground: withAlpha('popover-foreground'),
        },
        card: {
          DEFAULT: withAlpha('card'),
          foreground: withAlpha('card-foreground'),
        },
        // ASCA Ink System (Navy & Gold) — DESIGN.md §2. 이름은 기존 클래스를 그대로 살리기 위해
        // 유지하고 값만 바꿨다. 이름의 원래 색(청자·선비홍)은 더 이상 의미하지 않는다.
        'ink-black': '#0b1733', // navy-900 · 본문 먹색
        'rice-paper': '#fbf8ef', // paper · 宣紙
        // 다크 모드에서 gold-400 으로 바뀐다 — 남색 바탕 위 남색 글자가 사라지지 않도록.
        // 값은 app/globals.css --scholar-red-rgb, 검증은 scripts/design-diff.ts
        'scholar-red': 'rgb(var(--scholar-red-rgb) / <alpha-value>)', // navy-900 · 주 CTA (구 Scholar Red)
        'celadon-green': '#a77d24', // gold-700 · 글자·배경 겸용 금색 (구 Celadon)
        'stone-gray': '#424a5e', // stone-700 · 보조 텍스트 (paper 위 AA)

        // Ink System 사다리 — 하드코딩 팔레트(gray-*, blue-* …)를 옮겨 올 자리.
        // 다크 모드에서 값이 바뀌지 않는 절대색이다. 모드를 따라야 하면 시맨틱 슬롯을 쓴다.
        // stone 은 Tailwind 기본 stone 위에 덮어쓴다(남색 기운 중성색). 50·400·600·800·950 은
        // Tailwind 기본값(따뜻한 회색)이 남아 Ink System 밖이다 — 쓰지 말 것 (DESIGN.md §2.0.1).
        navy: {
          950: '#070d1a',
          900: '#0b1733',
          800: '#142244',
          700: '#1d2e5c',
          600: '#2a3f7a',
          500: '#3a54a0',
          400: '#6a82c0',
          300: '#9eb0d6',
        },
        gold: {
          900: '#6b4e14',
          800: '#8a661c',
          700: '#a77d24',
          600: '#c89729',
          500: '#d4a84a',
          400: '#e2c074',
          300: '#ecd6a1',
          200: '#f5e9c8',
          100: '#fbf5e4',
        },
        stone: {
          900: '#1a1d2a',
          700: '#424a5e',
          500: '#6b7385',
          300: '#b8bccb',
          200: '#d7dae3',
          100: '#edeff3',
        },
        paper: { DEFAULT: '#fbf8ef', 2: '#f4efdd' },
        seal: { DEFAULT: '#a8201a', soft: '#c94a3f' },

        // 아래 장식색들은 이름만 남기고 값을 Ink System 으로 옮겼다(2026-10-13).
        // 원래 색(오방·계절·문인화 초록·난초 보라 등)은 더 이상 의미하지 않는다. DESIGN.md §2.0
        // Traditional Five Elements Colors (Obang)
        'east-wood': '#3f7a4e', // success
        'south-fire': '#a8201a', // seal-red
        'center-earth': '#f4efdd', // paper-2
        'west-metal': '#edeff3', // stone-100
        'north-water': '#1d2e5c', // navy-700

        // Cultural Seasonal Palette
        'spring-blossom': '#fbf5e4', // gold-100
        'summer-jade': '#9eb0d6', // navy-300
        'autumn-gold': '#e2c074', // gold-400
        'winter-snow': '#ffffff',

        // Calligraphy Materials
        'bamboo-green': '#3f7a4e', // success
        'silk-cream': '#fbf5e4', // gold-100 · cream paper
        'lacquer-black': '#070d1a', // navy-950 · 墨玄
        vermillion: '#a8201a', // seal-red · 朱印 (낙관 전용)

        // Cultural Accents
        'temple-gold': '#d4a84a', // gold-500 · 正金 시그니처 금색
        'plum-purple': '#2a3f7a', // navy-600

        // 옛 Brand Extended Palette — 이름만 유지
        'terra-red': '#c94a3f', // seal-red-soft
        'sage-green': '#b8bccb', // stone-300
        'spring-green': '#3f7a4e', // success
        'brand-gold': '#d4a84a', // gold-500 (구 #ffcc00 는 Ink System 밖)
        'medium-orchid': '#3a54a0', // navy-500
        'royal-blue': '#3a54a0', // navy-500

        // Semantic literals (DESIGN.md SSoT) — bg-highlight, text-success 등 직접 접근용
        // shadcn semantic 슬롯(primary/secondary/...)은 var(--*) 경로 유지, 본 5개는
        // hex 직결로 design-diff 대상이 된다
        highlight: '#d4a84a', // gold-500 · 수상·기념·프리미엄
        'highlight-foreground': '#0b1733',
        success: '#3f7a4e',
        warning: '#a77d24', // gold-700
        info: '#2a3f7a', // navy-600
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'ink-spread': {
          '0%': {
            width: '0px',
            height: '0px',
            opacity: '0.8',
          },
          '100%': {
            width: '300vw',
            height: '300vw',
            opacity: '0',
          },
        },
        // Aceternity UI keyframes
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        ripple: {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(0.9)',
          },
        },
        grid: {
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
        slide: {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)',
          },
        },
        spotlight: {
          '0%': {
            opacity: '0',
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%,-40%) scale(1)',
          },
        },
        shimmer: {
          from: {
            backgroundPosition: '0 0',
          },
          to: {
            backgroundPosition: '-200% 0',
          },
        },
        aurora: {
          from: {
            backgroundPosition: '50% 50%, 50% 50%',
          },
          to: {
            backgroundPosition: '350% 50%, 350% 50%',
          },
        },
        scroll: {
          to: {
            transform: 'translate(calc(-50% - 0.5rem))',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'ink-spread': 'ink-spread 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        // Aceternity UI animations
        'meteor-effect': 'meteor 5s linear infinite',
        gradient: 'gradient 15s ease infinite',
        ripple: 'ripple 3400ms ease infinite',
        grid: 'grid 15s linear infinite',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
        slide: 'slide var(--speed) ease-in-out infinite alternate',
        spotlight: 'spotlight 2s ease .75s 1 forwards',
        shimmer: 'shimmer 2s linear infinite',
        aurora: 'aurora 60s linear infinite',
        scroll:
          'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
      },
      fontSize: {
        // Type Scale (1.25 ratio for harmonious hierarchy)
        xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }], // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        '5xl': ['3rem', { lineHeight: '1.1' }], // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1' }], // 60px
        '7xl': ['4.5rem', { lineHeight: '1.1' }], // 72px
        '8xl': ['6rem', { lineHeight: '1.1' }], // 96px
        '9xl': ['8rem', { lineHeight: '1' }], // 128px
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      lineHeight: {
        none: '1',
        tight: '1.1',
        snug: '1.25',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },
      fontFamily: {
        // Primary Typography System — Pretendard(CDN) 우선, Noto Sans KR(next/font) 폴백
        sans: [
          "'Pretendard'",
          'var(--font-noto-sans-kr)',
          "'Noto Sans CJK SC'",
          "'Noto Sans CJK TC'",
          "'Noto Sans CJK JP'",
          'system-ui',
          'sans-serif',
        ],
        serif: [
          'var(--font-display)',
          'var(--font-noto-serif-kr)',
          "'Source Han Serif SC'",
          "'Source Han Serif TC'",
          "'Noto Serif CJK SC'",
          "'Noto Serif CJK TC'",
          "'Noto Serif CJK JP'",
          'serif',
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
          'serif',
        ],
        brush: [
          "'Ma Shan Zheng'",
          "'Long Cang'",
          "'Source Han Serif SC'",
          "'Noto Serif CJK SC'",
          'cursive',
        ],

        // Language-Specific Optimizations
        korean: [
          'var(--font-noto-serif-kr)',
          "'Source Han Serif KR'",
          "'Nanum Myeongjo'",
          "'Batang'",
          'serif',
        ],
        chinese: [
          "'Source Han Serif SC'",
          "'Noto Serif CJK SC'",
          "'SimSun'",
          "'Microsoft YaHei'",
          'serif',
        ],
        japanese: [
          "'Noto Serif CJK JP'",
          "'Source Han Serif JP'",
          "'Yu Mincho'",
          "'Hiragino Mincho Pro'",
          'serif',
        ],
        english: ['var(--font-display)', "'Cormorant Garamond'", "'Georgia'", 'serif'],
        // 번체 한자 — 협회명·슬로건·서체명 등 브랜드 한자 (BRAND.md §3)
        tc: ['var(--font-noto-serif-tc)', "'Source Han Serif TC'", "'Noto Serif TC'", 'serif'],

        // Specialized Typography
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Monaco'", "'Consolas'", 'monospace'],
      },
      spacing: {
        // 8px 기반 스페이싱 시스템 확장
        '18': '4.5rem', // 72px
        '88': '22rem', // 352px
        '104': '26rem', // 416px
        '128': '32rem', // 512px
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config

export default config
