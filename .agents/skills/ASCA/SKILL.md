```markdown
# ASCA Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill outlines the development patterns and workflows used in the ASCA TypeScript codebase. ASCA emphasizes process-driven feature delivery, security-focused changes, and consistent code style. The repository uses structured documentation for planning and analysis, discrete commits for traceability, and a clear approach to code formatting and testing.

## Coding Conventions

- **File Naming:**  
  Use camelCase for file names.  
  _Example:_  
  ```
  app/api/members/me/route.ts
  lib/graphql/context.ts
  ```

- **Import Style:**  
  Use alias imports for modules.  
  _Example:_  
  ```typescript
  import { getUser } from '@/lib/user'
  ```

- **Export Style:**  
  Use named exports.  
  _Example:_  
  ```typescript
  export function getUserContext() { ... }
  ```

- **Commit Messages:**  
  Freeform, sometimes with prefixes like `S1`, `C1`, `H1`, etc., to indicate step or context.  
  _Example:_  
  ```
  S3: Add authentication enforcement to members API
  ```

## Workflows

### PDCA Feature Delivery Cycle
**Trigger:** When delivering a new feature or addressing related issues in a process-driven, auditable way  
**Command:** `/pdca-feature`

1. **Plan:**  
   Write a detailed plan document outlining issues and implementation stages.  
   _File:_ `docs/01-plan/features/<feature>.plan.md`
2. **Design:**  
   Write a design document with before/after code, scenarios, and implementation order.  
   _File:_ `docs/02-design/features/<feature>.design.md`
3. **Implement:**  
   Commit code changes in discrete steps, each targeting specific files/issues (e.g., S1-S7, C1, H1, etc.).
4. **Track Progress:**  
   Update `.bkit-memory.json` to track progress and phases.
5. **Analyze:**  
   Compare implementation vs. plan/design and write an analysis document.  
   _File:_ `docs/03-analysis/<feature>.analysis.md`
6. **Report:**  
   Write a final report summarizing the cycle and outcomes.  
   _File:_ `docs/04-report/features/<feature>.report.md`

_Example commit sequence:_
```
S1: Setup initial API route for feature X
S2: Add validation logic
C1: Update context for new auth checks
```

---

### Security Fix Implementation
**Trigger:** When addressing specific security issues (e.g., auth, CORS, error leakage) in API routes or GraphQL context  
**Command:** `/security-fix`

1. **Identify Issue:**  
   Determine the target file and security issue (e.g., C1, C2, H1-H4).
2. **Implement Fix:**  
   Apply the fix in the relevant file (e.g., enforce auth, restrict access, sanitize errors).
   _Example:_  
   ```typescript
   // Before
   export async function GET(req) { ... }

   // After
   export async function GET(req) {
     if (!req.user) throw new Error('Unauthorized')
     ...
   }
   ```
3. **Update Related Files:**  
   Optionally update related files for consistency or formatting.
4. **Verify:**  
   Run `tsc` or similar checks to ensure correctness.

---

### Post-Implementation Autoformat
**Trigger:** After implementing changes, to ensure code style consistency  
**Command:** `/format-changed`

1. **Identify Changed Files:**  
   Find files changed in recent commits.
2. **Format:**  
   Run code formatter (e.g., Prettier) on those files.
   _Example:_  
   ```
   npx prettier --write app/api/graphql/route.ts
   ```
3. **Commit:**  
   Commit the formatting changes as a separate commit.

---

## Testing Patterns

- **Test File Pattern:**  
  Test files follow the `*.test.*` naming convention.  
  _Example:_  
  ```
  lib/user/userService.test.ts
  ```
- **Testing Framework:**  
  Not explicitly detected; check project dependencies or test files for specifics.
- **Test Structure:**  
  Place tests alongside or near the code they validate, using the `.test.ts` suffix.

---

## Commands

| Command          | Purpose                                                        |
|------------------|----------------------------------------------------------------|
| /pdca-feature    | Start a PDCA feature delivery cycle with plan/design docs      |
| /security-fix    | Implement and track targeted security fixes                    |
| /format-changed  | Autoformat files changed in recent commits                     |
```
