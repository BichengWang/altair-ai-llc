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

### Pending
- Product spec
- Architecture overview
- Data model
- Integration plan
- Implementation roadmap
