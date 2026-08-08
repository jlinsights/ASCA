---
name: security-fix-implementation
description: Workflow command scaffold for security-fix-implementation in ASCA.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /security-fix-implementation

Use this workflow when working on **security-fix-implementation** in `ASCA`.

## Goal

Implements targeted security fixes across multiple API endpoints, each with a focused commit and file change, often following a prior plan/design.

## Common Files

- `lib/graphql/context.ts`
- `app/api/realtime/sse/route.ts`
- `app/api/members/[id]/route.ts`
- `app/api/admin/dashboard/route.ts`
- `app/api/graphql/route.ts`
- `app/api/members/me/route.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Identify the target file and security issue (e.g., C1, C2, H1-H4)
- Implement the fix in the relevant file (e.g., enforce auth, restrict access, sanitize errors)
- Optionally update related files for consistency or formatting
- Verify with tsc or similar checks

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.