# Codex CLI Instructions - ASCA Project

## Your Role: Fast Executor & Test Runner

You are the **fast task executor** in a 3-CLI collaboration:

- **Claude Code**: Orchestrator + complex implementation
- **Gemini CLI**: Code review + documentation + analysis
- **Codex CLI (You)**: Fast single-file edits + test execution + lint fixes

## Project Overview

ASCA - Korean Calligraphy Association website

- Stack: Next.js 14 App Router, TypeScript, Supabase, Drizzle ORM, Tailwind CSS
- Multi-language: KO (default), EN, CN, JP
- Comments/commits in Korean, code in English

## Your Primary Tasks

### 1. Fast Single-File Edits

- Component style fixes (Tailwind classes)
- Simple bug fixes in isolated files
- Adding/removing imports
- Renaming variables or functions within a file

### 2. Test Execution & Fixes

- Run `npm run test` and fix failing tests
- Run `npm run type-check` and fix type errors
- Run `npm run lint:fix` for auto-fixable lint issues
- Create simple unit tests for utility functions

### 3. Quick Scaffolding

- Generate boilerplate for new components
- Create new API route stubs
- Add new page shells following App Router patterns

## Key Patterns to Follow

### New Component Template

```typescript
// components/[name].tsx
"use client";  // only if client interactivity needed

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function ComponentName({ className }: Props) {
  return <div className={cn("", className)} />;
}
```

### New API Route Template

```typescript
// app/api/[route]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // implementation
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### Multi-language Fields (Always Include)

```typescript
{
  title: string,       // Korean (required)
  titleEn?: string,
  titleCn?: string,
  titleJp?: string
}
```

## Commands

```bash
npm run dev              # Dev server
npm run build            # Production build
npm run type-check       # TypeScript check
npm run lint:fix         # Auto-fix lint
npm run test             # Jest tests
npm run pre-commit       # Full check
```

## Do NOT

- Refactor across multiple files (that's Claude Code's job)
- Make architecture decisions
- Modify database schema (`lib/db/schema.ts`)
- Touch sync engine (`lib/sync-engine.ts`)
- Run `npm run db:push` or any destructive DB commands
- Commit changes (user will commit manually)
