---
name: pdca-feature-delivery-cycle
description: Workflow command scaffold for pdca-feature-delivery-cycle in ASCA.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /pdca-feature-delivery-cycle

Use this workflow when working on **pdca-feature-delivery-cycle** in `ASCA`.

## Goal

Implements a full Plan-Design-Do-Check-Act (PDCA) cycle for a feature or security hardening initiative, producing documentation and code changes in structured phases.

## Common Files

- `docs/01-plan/features/*.plan.md`
- `docs/02-design/features/*.design.md`
- `docs/03-analysis/*.analysis.md`
- `docs/04-report/features/*.report.md`
- `.bkit-memory.json`
- `.commit_message.txt`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Write a detailed plan document outlining issues and implementation stages (docs/01-plan/...)
- Write a design document with before/after code, scenarios, and implementation order (docs/02-design/...)
- Commit code changes in discrete steps, each targeting specific files/issues (e.g., S1-S7, C1, H1, etc.)
- Update .bkit-memory.json to track progress and phases
- Analyze implementation vs. plan/design and write an analysis document (docs/03-analysis/...)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.