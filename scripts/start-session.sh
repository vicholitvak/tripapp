#!/bin/bash

# ============================================================================
# 🚀 Santurist Development Session Starter
#
# This script runs when you start a new development session
# It checks project status and asks what area you want to work on
# ============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ============================================================================
# PARSE COMMAND LINE ARGUMENTS
# ============================================================================
TASK_PARAM="${1:-}"
QUIET_MODE=0

# Check for --quiet flag
if [[ "$TASK_PARAM" == *"--quiet"* ]]; then
  QUIET_MODE=1
  TASK_PARAM="${TASK_PARAM//--quiet/}"
  TASK_PARAM="$(echo $TASK_PARAM | xargs)"
fi

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCTIONS
# ============================================================================

print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_section() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# ============================================================================
# CHECK PROJECT STATUS
# ============================================================================

print_header "🚀 SANTURIST DEVELOPMENT SESSION"

# Check if we're in the right directory
if [ ! -f "PROGRESS.md" ]; then
    print_error "Not in santurist root directory!"
    echo "Please run this script from the santurist root folder."
    exit 1
fi

print_section "Checking Project Status..."

# Extract overall progress from ARCHITECTURE.md
if [ -f "ARCHITECTURE.md" ]; then
    OVERALL_PROGRESS=$(grep "Overall progress:" ARCHITECTURE.md | head -1 | sed 's/.*Overall progress: //' | sed 's/%.*//' | tr -d ' ')
    CURRENT_PHASE=$(grep "Overall Progress" -A 1 ARCHITECTURE.md | tail -1 | grep -oE "Phase [0-9]" | head -1)
    print_success "Project is ${OVERALL_PROGRESS}% complete"
else
    OVERALL_PROGRESS="?"
fi

# Check git status
BRANCH=$(git rev-parse --abbrev-ref HEAD)
LOCAL_CHANGES=$(git status --short | wc -l)
UNCOMMITTED=$(git status --short | grep -v "^??" | wc -l)

if [ $UNCOMMITTED -gt 0 ]; then
    print_warning "$UNCOMMITTED uncommitted changes"
else
    print_success "Working directory clean"
fi

print_info "Current branch: $BRANCH"

echo ""

# ============================================================================
# SHOW PHASE PROGRESS
# ============================================================================

print_section "Phase Progress Overview"

# Extract phase progress from STATUS_BOARD.md
if [ -f "STATUS_BOARD.md" ]; then
    grep -A 5 "Quick Status Overview" STATUS_BOARD.md | tail -5
fi

echo ""

# ============================================================================
# SHOW RECENT COMMITS
# ============================================================================

print_section "Recent Commits (Last 3)"

git log --oneline -3

echo ""

# ============================================================================
# SHOW WHAT'S IN PROGRESS
# ============================================================================

print_section "Current Work Areas"

echo -e "${GREEN}✅ COMPLETED${NC}"
echo "  • Phase 1: Moai Integration (100%)"
echo "  • Phase 2: Provider Onboarding (100%)"
echo "  • Phase 3: Unified Marketplace (100%)"
echo ""

echo -e "${YELLOW}🔄 IN PROGRESS${NC}"
echo "  • Phase 3.5: Navigation & Mock Data (100%)"
echo ""

echo -e "${CYAN}⏳ NEXT UP${NC}"
echo "  • Phase 4: Provider Dashboard (0%)"
echo "    - /provider/dashboard"
echo "    - /provider/listings"
echo "    - /provider/orders"
echo "    - /provider/earnings"
echo "    - /provider/reviews"
echo ""

# ============================================================================
# CHECK FOR ISSUES
# ============================================================================

print_section "Known Issues & Blockers"

# Check if there are uncommitted changes
if [ $LOCAL_CHANGES -gt 0 ]; then
    print_warning "You have $LOCAL_CHANGES untracked/modified files"
fi

# Check build status
if ! npm run build --prefix app/frontend >/dev/null 2>&1; then
    print_error "Build failed - fix before committing"
else
    print_success "Build status: OK"
fi

echo ""

# ============================================================================
# ASK WHAT TO WORK ON
# ============================================================================

print_header "🎯 WHAT DO YOU WANT TO WORK ON TODAY?"

echo "Choose an option:"
echo ""
echo "  ${GREEN}1)${NC}  Continue Phase 4: Provider Dashboard"
echo "        └─ Build provider management interface"
echo ""
echo "  ${CYAN}2)${NC}  Test & Debug Marketplace"
echo "        └─ Test the current marketplace implementation"
echo ""
echo "  ${BLUE}3)${NC}  Fix Build Issues"
echo "        └─ Resolve any TypeScript/build errors"
echo ""
echo "  ${PURPLE}4)${NC}  Update Documentation"
echo "        └─ Update progress and architecture docs"
echo ""
echo "  ${YELLOW}5)${NC}  Review Code"
echo "        └─ Code review and optimization"
echo ""
echo "  ${RED}6)${NC}  Custom Task"
echo "        └─ Enter your own task"
echo ""

# Determine choice (from parameter or interactive)
if [[ -z "$TASK_PARAM" ]]; then
  read -p "Enter your choice (1-6): " CHOICE
else
  # Map parameters to choice numbers
  case "$TASK_PARAM" in
    1|provider|dashboard|provider-dashboard)
      CHOICE=1
      ;;
    2|marketplace|test|testing)
      CHOICE=2
      ;;
    3|build|fix|errors)
      CHOICE=3
      ;;
    4|docs|documentation|update)
      CHOICE=4
      ;;
    5|review|code|optimize)
      CHOICE=5
      ;;
    *)
      CHOICE=6
      CUSTOM_TASK="$TASK_PARAM"
      ;;
  esac
fi

case $CHOICE in
    1)
        SELECTED_TASK="Phase 4: Provider Dashboard"
        SELECTED_AREA="provider-dashboard"
        SELECTED_DESCRIPTION="Build provider management interface with dashboard, listings, orders, earnings pages"
        ;;
    2)
        SELECTED_TASK="Test & Debug Marketplace"
        SELECTED_AREA="marketplace-testing"
        SELECTED_DESCRIPTION="Test marketplace functionality, load mock data, verify all features work"
        ;;
    3)
        SELECTED_TASK="Fix Build Issues"
        SELECTED_AREA="build-fixes"
        SELECTED_DESCRIPTION="Resolve TypeScript errors, fix linting issues, ensure clean build"
        ;;
    4)
        SELECTED_TASK="Update Documentation"
        SELECTED_AREA="documentation"
        SELECTED_DESCRIPTION="Update progress docs, architecture diagrams, and development guides"
        ;;
    5)
        SELECTED_TASK="Code Review & Optimization"
        SELECTED_AREA="code-review"
        SELECTED_DESCRIPTION="Review existing code, optimize performance, refactor if needed"
        ;;
    6)
        if [[ -z "$CUSTOM_TASK" ]]; then
          read -p "Enter your custom task: " CUSTOM_TASK
        fi
        SELECTED_TASK="$CUSTOM_TASK"
        SELECTED_AREA="custom"
        SELECTED_DESCRIPTION="Custom task: $CUSTOM_TASK"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""

# ============================================================================
# PREPARE SESSION CONTEXT
# ============================================================================

print_header "📋 SESSION PREPARED"

echo -e "${GREEN}Task:${NC}          $SELECTED_TASK"
echo -e "${GREEN}Area:${NC}          $SELECTED_AREA"
echo ""
echo -e "${GREEN}Description:${NC}"
echo "  $SELECTED_DESCRIPTION"
echo ""

# ============================================================================
# SHOW HELPFUL INFO
# ============================================================================

print_section "Useful Commands"

echo "  # Start dev server"
echo "  cd app/frontend && npm run dev"
echo ""
echo "  # Run build"
echo "  cd app/frontend && npm run build"
echo ""
echo "  # Load marketplace mock data"
echo "  Navigate to: http://localhost:3000/admin/seed-marketplace"
echo ""
echo "  # Check project status"
echo "  ./scripts/start-session.sh"
echo ""

print_section "Useful Files"

echo "  📖 Documentation:"
echo "     • STATUS_BOARD.md - Quick overview"
echo "     • ARCHITECTURE.md - Detailed breakdown"
echo "     • PROGRESS.md - Historical progress"
echo ""
echo "  📝 Planning:"
echo "     • .development/progress-tracking.json - Machine readable data"
echo "     • GITHUB_PROJECTS_SETUP.md - GitHub Projects guide"
echo ""

# ============================================================================
# CREATE SESSION CONTEXT FILE
# ============================================================================

print_section "Creating Session Context"

SESSION_FILE=".development/.current-session.json"

# Create .development folder if it doesn't exist
mkdir -p .development

cat > "$SESSION_FILE" << EOF
{
  "sessionStartedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "selectedTask": "$SELECTED_TASK",
  "selectedArea": "$SELECTED_AREA",
  "description": "$SELECTED_DESCRIPTION",
  "branch": "$BRANCH",
  "projectProgress": "${OVERALL_PROGRESS}%",
  "uncommittedChanges": $UNCOMMITTED,
  "notes": "Started new development session"
}
EOF

print_success "Session context created: $SESSION_FILE"

echo ""

# ============================================================================
# FINAL INSTRUCTIONS
# ============================================================================

if [[ $QUIET_MODE -eq 0 ]]; then
  print_header "✨ READY TO CODE!"

  echo -e "${GREEN}Next steps:${NC}"
  echo ""
  echo "1. Start your dev server:"
  echo -e "   ${CYAN}cd app/frontend && npm run dev${NC}"
  echo ""
  echo "2. Begin working on:"
  echo -e "   ${CYAN}$SELECTED_TASK${NC}"
  echo ""
  echo "3. When you're done, commit your work:"
  echo -e "   ${CYAN}git add . && git commit -m \"Your message\"${NC}"
  echo ""
  echo "4. Update progress when done:"
  echo -e "   ${CYAN}./scripts/start-session.sh${NC}"
  echo ""

  echo -e "${PURPLE}Good luck! 🚀${NC}"
  echo ""
else
  echo ""
  echo -e "${GREEN}✅ SESSION READY${NC}"
  echo ""
fi

# ============================================================================
# PRINT SESSION DATA
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 SESSION CONTEXT${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cat "$SESSION_FILE"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
