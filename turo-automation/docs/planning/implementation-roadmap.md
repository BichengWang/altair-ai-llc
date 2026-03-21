# Implementation Roadmap

A pragmatic path for building the Turo Automation MVP in small, reviewable PRs.

## Guiding Principle
Prefer small increments that create an operational backbone before adding sophisticated automation.

## Phase 0 — Foundation
Objective: establish shared language, plan, and architecture.

PR slices:
1. docs scaffold and MVP spec
2. hourly AI workflow runbook
3. data model draft + implementation roadmap

## Phase 1 — Operational Backbone
Objective: create the minimum system needed to view trips and manage work.

PR slices:
1. initialize `web/`, `worker/`, and `shared/`
2. create shared TypeScript domain models
3. add Supabase schema + migrations for vehicles, guests, trips, tasks
4. build trip list / today dashboard shell
5. build task board for trip-related work

## Phase 2 — Messaging Workflow
Objective: support draft-first guest communication.

PR slices:
1. add message threads + messages schema
2. build message draft center UI
3. add approval state transitions
4. generate templated pre-trip and return reminders
5. add Slack notifications for approval-needed drafts

## Phase 3 — Automation Engine
Objective: reduce repetitive manual work with safe background jobs.

PR slices:
1. scheduled worker framework
2. trip lifecycle task generation
3. late return detection
4. daily ops digest
5. incident creation from predefined triggers

## Phase 4 — Reliability + Extensions
Objective: improve correctness, visibility, and operator trust.

PR slices:
1. audit log / event timeline improvements
2. retry + failure handling for worker jobs
3. operational runbooks and alert tuning
4. richer analytics and utilization reporting

## Current Highest-Priority Next PR
Wire the new shared contracts to real persistence and notification adapters:
- Supabase-backed trip, task, incident, message, and job-run repositories
- worker adapter replacements for fixture ingestion and notification
- dashboard reads backed by repository data instead of fixture context

## Why This Is Next
- the interface-first package boundaries now exist and compile
- the next bottleneck is that all reads and jobs are still fixture-backed
- adapter wiring can now proceed without changing the public shared contracts

## Rules for Future PRs
- one highest-priority PR at a time
- prefer reviewable increments over broad scaffolding
- update `docs/` whenever implementation changes reality
- do not mark milestones complete without code and verification
