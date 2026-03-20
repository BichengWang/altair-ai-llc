# Dev Log

Chronological notes on repo setup, architecture decisions, implementation progress, blockers, and follow-ups.

---

## 2026-03-19

### Repo bootstrap
- Created `turo-automation/` under `/Users/mac/my-code/altair-ai-llc`
- Added docs-first structure:
  - `docs/architecture/`
  - `docs/logs/`
  - `docs/planning/`
  - `docs/product/`
  - `docs/runbooks/`
- Added application folders:
  - `web/`
  - `worker/`
  - `shared/`
- Added root `README.md`
- Added `docs/planning/daily-plan.md`
- Added `docs/logs/dev-log.md`

### Initial direction
- Goal: automate Turo host daily operations without over-automating risky workflows on day 1
- Recommendation: start with detection, task routing, message drafting, and approvals before enabling autonomous guest-facing sends
- MVP focus areas:
  1. trip ops dashboard
  2. task orchestration
  3. guest messaging draft workflow
  4. incident / late-return alerting
  5. daily summary reporting

### Added runbook
- Added `docs/runbooks/ai-workflow-hourly.md`
- Established the hourly development loop: review state, choose one highest-priority PR, implement incrementally, verify, update PR, and keep docs synchronized with reality

### First runbook execution
- Reviewed current repo state, open PRs, recent commits, and docs inventory
- Chose the highest-priority ready task: document the implementation roadmap and draft the MVP data model
- Added `docs/planning/implementation-roadmap.md`
- Added `docs/architecture/data-model.md`
- Updated `docs/planning/daily-plan.md` to reflect completed planning work and the next executable step

### Second runbook execution
- Reviewed current repo state again from `main`
- Confirmed there were no open PRs and the next ready task was the app skeleton milestone
- Initialized an executable workspace under `turo-automation/` with:
  - `package.json` and npm workspaces
  - `tsconfig.base.json`
  - `web/` Vite + React shell
  - `worker/` TypeScript worker entrypoint
  - `shared/` shared package for common exports
  - `.gitignore` for local build artifacts and dependencies
- Updated the root `README.md` to describe package roles
- Updated `docs/planning/daily-plan.md` to mark the app skeleton milestone complete

### Third runbook execution
- Synced back to `main` after the app skeleton merged
- Selected the next highest-priority ready task: create the first persistence slice for the MVP domain
- Added `turo-automation/supabase/migrations/0001_turo_ops_core.sql`
- Implemented initial tables for:
  - `vehicles`
  - `guests`
  - `trips`
  - `tasks`
- Added indexes, `updated_at` triggers, and baseline authenticated RLS policies for those tables
- Updated `docs/planning/daily-plan.md` to mark the schema milestone complete and point to the dashboard shell as the next task

### Decision
- The next highest-priority implementation PR should build the first internal dashboard shell for vehicles, trips, tasks, and incidents
- Reason: the docs foundation, app skeleton, and initial persistence layer now exist; the next smallest useful increment is turning that structure into an operator-facing UI shape

### Verification
- Verified the migration file against existing SQL conventions in `homepage/supabase/workspace.sql`
- Assumption: Supabase CLI is not installed locally, so verification was limited to SQL consistency review rather than CLI lint/apply

### Pending
- Build the first internal dashboard shell beyond placeholder content
- Add worker job framework for scheduled automation
- Connect shared domain models to persistence and UI
- Add incident and messaging schema slices
