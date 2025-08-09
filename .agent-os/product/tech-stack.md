# Technical Stack

## Frontend Architecture

- **Application Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript 5.x
- **JavaScript Framework:** React 18.3.1
- **CSS Framework:** Tailwind CSS 3.4.17
- **UI Component Library:** Radix UI + Shadcn/ui
- **State Management:** React Context API + Zustand 4.5.0
- **Form Handling:** React Hook Form 7.54.1 + Zod 3.24.1

## Backend & Database

- **Database System:** SQLite + Better SQLite3
- **ORM:** Drizzle ORM 0.43.1
- **Migration Tool:** Drizzle Kit 0.31.1
- **External Database:** Supabase (PostgreSQL) + Airtable API integration
- **Authentication:** Clerk 6.25.4 + Custom Admin System

## Development Tools

- **Package Manager:** npm 8+
- **Build Tool:** Next.js built-in (Webpack/Turbopack)
- **Import Strategy:** ES Modules (node)
- **Linting:** ESLint + TypeScript ESLint 6.21.0
- **Formatting:** Prettier 3.2.5
- **Testing:** Jest 29.7.0 + React Testing Library 15.0.0
- **Pre-commit:** Husky 8.0.3 + lint-staged 15.2.2

## Design & UI

- **Fonts Provider:** Google Fonts (Inter)
- **Icon Library:** Lucide React 0.454.0
- **Image Optimization:** Next.js Image component
- **Theme System:** next-themes 0.4.4 (Light/Dark modes)
- **Animation:** Tailwind CSS Animate 1.0.7

## Hosting & Infrastructure

- **Application Hosting:** Vercel (Edge Network)
- **Database Hosting:** Local SQLite + Supabase Cloud
- **Asset Hosting:** Vercel Static Assets + CDN
- **Deployment Solution:** Vercel + GitHub Actions CI/CD

## External Services

- **Chat Support:** ChannelIO
- **Meeting Scheduler:** Cal.com integration
- **PDF Generation:** jsPDF + html2canvas
- **Internationalization:** i18next 25.3.2 + react-i18next 15.6.0
- **Performance Monitoring:** Web Vitals 5.1.0
- **Analytics:** Google Analytics (optional)

## Media & Content Management

- **Image Optimization:** Next.js Image component with automatic optimization
- **Gallery Management:** Custom gallery system with categorization
- **Media Storage:** Vercel blob storage for images and documents
- **Content Delivery:** CDN integration for fast global access

## Data Architecture

- **Primary Database:** SQLite with 12 tables (local development)
- **Production Database:** Supabase PostgreSQL
- **Content Management:** Airtable API integration
- **Synchronization:** Custom bidirectional sync engine
- **Schema Management:** Drizzle ORM with TypeScript types

## Security & Performance

- **Rate Limiting:** Custom implementation
- **Audit Logging:** Security event tracking
- **Bundle Analysis:** @next/bundle-analyzer
- **Performance Auditing:** Lighthouse integration
- **Type Safety:** Strict TypeScript configuration

## Development Environment

- **Node.js:** >=18.0.0
- **Package Manager:** npm >=8.0.0
- **Environment Management:** dotenv 16.5.0
- **Development Server:** Next.js dev with Turbo mode
- **Database GUI:** Drizzle Studio

## Code Repository

- **Version Control:** Git
- **Repository Platform:** GitHub
- **Branching Strategy:** Feature branches with main/production
- **Code Quality:** Automated pre-commit hooks and CI/CD validation