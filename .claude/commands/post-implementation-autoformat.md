---
name: post-implementation-autoformat
description: Workflow command scaffold for post-implementation-autoformat in ASCA.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /post-implementation-autoformat

Use this workflow when working on **post-implementation-autoformat** in `ASCA`.

## Goal

Runs code formatting (prettier or similar) on files that were recently changed as part of a feature or fix, often as a dedicated commit.

## Common Files

- `app/api/graphql/route.ts`
- `.commit_message.txt`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Identify files changed in recent commits
- Run code formatter (e.g., prettier) on those files
- Commit the formatting changes separately

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.