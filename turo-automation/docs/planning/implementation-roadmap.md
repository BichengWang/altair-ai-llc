# Implementation Roadmap

A pragmatic path for building the Turo Automation MVP in small, reviewable PRs.

## Guiding Principle
Prefer small increments that create an operational backbone before adding sophisticated automation.

## Phase 0 — Foundation ✓
Objective: establish shared language, plan, and architecture.

PR slices:
1. docs scaffold and MVP spec ✓
2. hourly AI workflow runbook ✓
3. data model draft + implementation roadmap ✓

## Phase 1 — Operational Backbone ✓
Objective: create the minimum system needed to view trips and manage work.

PR slices:
1. initialize `web/`, `worker/`, and `shared/` ✓
2. create shared TypeScript domain models, ports, use-cases, and fixtures ✓
3. add Supabase schema + migrations for vehicles, guests, trips, tasks ✓
4. build fixture-backed ops dashboard shell ✓
5. add missing schema slices (incidents, trip_events, message_threads, message_drafts, approval_requests, job_runs) ✓
6. add Supabase-backed repository adapters in `shared/src/adapters/supabase/` ✓
7. wire worker + web to Supabase adapters (env-gated, fixture fallback) ✓

## Phase 2 — Real Notifications + Import ✓
Objective: connect the system to real external services.

PR slices:
1. Slack notifier adapter (`SLACK_WEBHOOK_URL` env var) ✓
2. trip import-source adapter (CSV / Turo export) ✓
3. `.env.example` with required environment variable documentation ✓
4. approval state transitions via UI actions ✓
5. templated pre-trip and return reminder drafts ✓

## Phase 3 — Automation Engine (items 1–4 complete)
Objective: reduce repetitive manual work with safe background jobs.

PR slices:
1. scheduled worker framework (`WORKER_MODE=scheduled`, interval-based) ✓
2. trip lifecycle task generation from real trips ✓ (GenerateLifecycleTasks use case + scheduler)
3. late return detection with real Slack alerts ✓ (DetectLateReturns + Slack notifier)
4. daily ops digest to Slack ✓ (BuildDailyDigest + scheduled)
5. auto-generate pre-trip and return reminder drafts ✓ (GenerateMessageDrafts use case)
6. incident creation from predefined triggers

## Phase 4 — Reliability + Extensions
Objective: improve correctness, visibility, and operator trust.

PR slices:
1. audit log / event timeline improvements
2. retry + failure handling for worker jobs
3. operational runbooks and alert tuning
4. richer analytics and utilization reporting

## Current Highest-Priority Next PR
Phase 3 item 6: incident creation from predefined triggers — auto-create incidents
when trip anomalies are detected:
- extend `detectLateReturns` to also detect trips with unresolved `issue` status
- add `createIncidentFromTripStatus` helper for rule-based incident creation
- wire into the scheduled `late_return_scan` job
- add contract test

## Why This Is Next
- Phases 0–3 items 1–5 are complete
- Incident creation from real trip data is the last remaining Phase 3 automation item
- Once done, Phase 3 is complete and Phase 4 (reliability) is next

## Rules for Future PRs
- one highest-priority PR at a time
- prefer reviewable increments over broad scaffolding
- update `docs/` whenever implementation changes reality
- do not mark milestones complete without code and verification
