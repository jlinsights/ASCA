#!/bin/bash
# ai-collab.sh - 3-CLI Collaboration Orchestrator for ASCA
# Usage: ./scripts/ai-collab.sh <command> [args...]

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  ASCA 3-CLI Collaboration System${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_roles() {
    echo -e "${PURPLE}[Claude Code]${NC} Orchestrator + Complex Implementation"
    echo -e "${GREEN}[Gemini CLI]${NC}  Code Review + Analysis + Documentation"
    echo -e "${YELLOW}[Codex CLI]${NC}   Fast Tasks + Tests + Lint Fixes"
    echo ""
}

# --- Gemini CLI Commands ---

gemini_review() {
    local target="${1:-.}"
    echo -e "${GREEN}[Gemini]${NC} Reviewing: $target"
    gemini -p "Review the following code for type safety, Next.js best practices, multi-language consistency, and security issues. Use the review format from GEMINI.md. Target: $target"
}

gemini_analyze() {
    echo -e "${GREEN}[Gemini]${NC} Full codebase analysis..."
    gemini -p "Analyze the entire ASCA codebase for: 1) Dead code 2) Circular dependencies 3) Missing i18n fields 4) Type safety gaps. Provide a prioritized report."
}

gemini_docs() {
    local target="${1:-app/api}"
    echo -e "${GREEN}[Gemini]${NC} Generating docs for: $target"
    gemini -p "Generate comprehensive documentation for all files in $target. Include function signatures, parameters, return types, and usage examples."
}

# --- Codex CLI Commands ---

codex_fix_types() {
    echo -e "${YELLOW}[Codex]${NC} Fixing type errors..."
    codex -q "Run npm run type-check, then fix all TypeScript errors found. Do not change the logic, only fix types."
}

codex_fix_lint() {
    echo -e "${YELLOW}[Codex]${NC} Fixing lint issues..."
    codex -q "Run npm run lint:fix to auto-fix lint issues. For remaining issues, fix them manually."
}

codex_test() {
    echo -e "${YELLOW}[Codex]${NC} Running and fixing tests..."
    codex -q "Run npm run test. If any tests fail, fix the failing tests. Do not modify the source code being tested."
}

codex_quick_edit() {
    local instruction="$1"
    echo -e "${YELLOW}[Codex]${NC} Quick edit: $instruction"
    codex -q "$instruction"
}

# --- Combined Workflows ---

workflow_pre_commit() {
    echo -e "${PURPLE}[Workflow]${NC} Pre-commit quality pipeline"
    echo ""
    echo -e "Step 1/3: ${YELLOW}[Codex]${NC} type-check + lint fix"
    codex -q "Run npm run type-check and npm run lint:fix. Fix any issues found."
    echo ""
    echo -e "Step 2/3: ${YELLOW}[Codex]${NC} test execution"
    codex -q "Run npm run test. Report results."
    echo ""
    echo -e "Step 3/3: ${GREEN}[Gemini]${NC} final review"
    gemini -p "Review all staged changes (git diff --cached). Check for type safety, security issues, and i18n consistency."
}

workflow_new_feature() {
    local feature="$1"
    echo -e "${PURPLE}[Workflow]${NC} New feature pipeline: $feature"
    echo ""
    echo "This workflow should be run with Claude Code as orchestrator:"
    echo ""
    echo -e "  1. ${PURPLE}[Claude Code]${NC} /pdca plan $feature   -- Plan & Design"
    echo -e "  2. ${PURPLE}[Claude Code]${NC} /pdca design $feature -- Architecture"
    echo -e "  3. ${PURPLE}[Claude Code]${NC} Implement core logic   -- Multi-file changes"
    echo -e "  4. ${YELLOW}[Codex]${NC}       Fix types & lint       -- Quick fixes"
    echo -e "  5. ${YELLOW}[Codex]${NC}       Run tests              -- Validation"
    echo -e "  6. ${GREEN}[Gemini]${NC}      Review implementation   -- Quality gate"
    echo -e "  7. ${PURPLE}[Claude Code]${NC} /pdca analyze $feature -- Gap analysis"
    echo ""
    echo "Run each step in the respective CLI tool."
}

# --- Main ---

case "${1:-help}" in
    # Gemini commands
    review)     gemini_review "${2:-.}" ;;
    analyze)    gemini_analyze ;;
    docs)       gemini_docs "${2:-app/api}" ;;

    # Codex commands
    fix-types)  codex_fix_types ;;
    fix-lint)   codex_fix_lint ;;
    test)       codex_test ;;
    quick)      codex_quick_edit "${2:-}" ;;

    # Combined workflows
    pre-commit) workflow_pre_commit ;;
    feature)    workflow_new_feature "${2:-new-feature}" ;;

    # Help
    help|*)
        print_header
        print_roles
        echo "Commands:"
        echo ""
        echo -e "  ${GREEN}Gemini CLI (Review & Analysis):${NC}"
        echo "    review [path]     Code review (default: entire project)"
        echo "    analyze           Full codebase analysis"
        echo "    docs [path]       Generate documentation"
        echo ""
        echo -e "  ${YELLOW}Codex CLI (Fast Tasks):${NC}"
        echo "    fix-types         Fix TypeScript errors"
        echo "    fix-lint          Fix lint issues"
        echo "    test              Run & fix tests"
        echo "    quick \"instruction\"  Quick single edit"
        echo ""
        echo -e "  ${PURPLE}Combined Workflows:${NC}"
        echo "    pre-commit        Full quality pipeline (Codex + Gemini)"
        echo "    feature <name>    New feature guide (all 3 CLIs)"
        echo ""
        echo "Examples:"
        echo "  ./scripts/ai-collab.sh review app/api/artists"
        echo "  ./scripts/ai-collab.sh fix-types"
        echo "  ./scripts/ai-collab.sh pre-commit"
        echo "  ./scripts/ai-collab.sh feature gallery-redesign"
        echo "  ./scripts/ai-collab.sh quick \"Add loading skeleton to artists page\""
        ;;
esac
