# 🚀 Quick Start Guide - Session Commands

## Fastest Way to Start Development

Simply run this command from the project root:

```bash
./scripts/start-session.sh 1
```

---

## Available Commands

### Phase 4: Provider Dashboard (RECOMMENDED - NEXT PRIORITY)
```bash
./scripts/start-session.sh 1
# or any of these:
./scripts/start-session.sh provider
./scripts/start-session.sh dashboard
./scripts/start-session.sh provider-dashboard
```

**Status:** 0% - Ready to start immediately
**Estimated Time:** 8-12 hours
**What:** Build provider management interface with dashboard, listings, orders, earnings pages

---

### Test & Debug Marketplace
```bash
./scripts/start-session.sh 2
# or:
./scripts/start-session.sh marketplace
./scripts/start-session.sh test
./scripts/start-session.sh testing
```

**Status:** 100% - Complete
**Purpose:** Test marketplace functionality, load mock data, verify all features work

---

### Fix Build Issues
```bash
./scripts/start-session.sh 3
# or:
./scripts/start-session.sh build
./scripts/start-session.sh fix
./scripts/start-session.sh errors
```

**Status:** Variable
**Purpose:** Resolve TypeScript errors, fix linting issues, ensure clean build

---

### Update Documentation
```bash
./scripts/start-session.sh 4
# or:
./scripts/start-session.sh docs
./scripts/start-session.sh documentation
./scripts/start-session.sh update
```

**Purpose:** Update progress docs, architecture diagrams, and development guides

---

### Code Review & Optimization
```bash
./scripts/start-session.sh 5
# or:
./scripts/start-session.sh review
./scripts/start-session.sh code
./scripts/start-session.sh optimize
```

**Purpose:** Review existing code, optimize performance, refactor if needed

---

### Custom Task
```bash
./scripts/start-session.sh "Your custom task name"
```

**Purpose:** Start a custom task with any name you provide

---

## Interactive Mode (No Parameter)

If you run the script without a parameter:

```bash
./scripts/start-session.sh
```

It will display an interactive menu and ask you to select an option (1-6).

---

## What The Script Does

When you run the command, the script will:

1. ✅ Check your current git branch and status
2. ✅ Display project progress (currently 60% complete)
3. ✅ Show recent commits
4. ✅ List what phases are complete and what's pending
5. ✅ Check build status
6. ✅ Create a session context file with your selection
7. ✅ Display helpful commands for development

---

## Example Output

When you run `./scripts/start-session.sh 1`, you'll see:

```
💻 PROJECT STATUS
✅ Working directory clean
ℹ️  Current branch: main

▶ Phase Progress Overview
Phase 1: Moai Integration           ████████████████████░░  100% ✅
Phase 2: Provider Onboarding        ████████████████████░░  100% ✅
Phase 3: Unified Marketplace        ████████████████████░░  100% ✅
Phase 4: Provider Dashboard         ░░░░░░░░░░░░░░░░░░░░    0% ⏳
Phase 5: Advanced Features          ░░░░░░░░░░░░░░░░░░░░    0% ⏳

▶ Recent Commits (Last 3)
[commit info...]

▶ Current Work Areas
✅ COMPLETED
  • Phase 1: Moai Integration (100%)
  • Phase 2: Provider Onboarding (100%)
  • Phase 3: Unified Marketplace (100%)

⏳ NEXT UP
  • Phase 4: Provider Dashboard (0%)

✅ SESSION READY
```

---

## After Running The Script

The script creates a session context file at `.development/.current-session.json` that tracks:
- What task you selected
- When your session started
- Current git branch
- Project progress percentage
- Number of uncommitted changes

This helps maintain context across sessions.

---

## Quick Dev Server Start

After running the session script, start your dev server:

```bash
cd app/frontend && npm run dev
```

Then open http://localhost:3000

---

## What's Ready for Development

✅ **Phase 1-3 Complete (60% overall)**
- Moai delivery integration
- Provider onboarding system
- Unified marketplace with mock data

🔄 **Phase 4 Next (Provider Dashboard)**
- `/provider/dashboard` - Overview page
- `/provider/listings` - CRUD for products
- `/provider/orders` - Order management
- `/provider/earnings` - Revenue tracking
- `/provider/reviews` - Review display

📚 **All Supporting Services Ready**
- OrderService ✅
- EarningsService ✅
- MarketplaceService ✅
- PaymentService ✅
- Authentication ✅

---

## Need More Info?

- **Project Status:** Run `./scripts/start-session.sh`
- **Architecture Details:** Read `ARCHITECTURE.md`
- **Quick Overview:** Check `STATUS_BOARD.md`
- **Progress Data:** See `.development/progress-tracking.json`
- **Marketplace Setup:** Review `MARKETPLACE_SEED_GUIDE.md`
- **GitHub Setup:** See `GITHUB_PROJECTS_SETUP.md`

---

## TL;DR

```bash
# To start working on Provider Dashboard (next priority)
./scripts/start-session.sh 1

# Start dev server
cd app/frontend && npm run dev

# Open browser to http://localhost:3000
```

That's it! The script handles all the status checking and context setup for you. 🎯
