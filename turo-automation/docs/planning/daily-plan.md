# Daily Plan

Use this file for the current working plan. Keep it short, current, and actionable.

## Date
2026-03-20

## Objective
Freeze the interface-first architecture for `turo-automation` and make the subtree reviewable as the first implementation PR.

## Today's Priorities
- [x] Save the host mode plan into the subtree
- [x] Create shared domain, ports, fixtures, and use-case contracts
- [x] Refactor the web shell to consume `TodayOpsSnapshot`
- [x] Refactor the worker to run fixture-backed contract jobs
- [x] Add build and contract-test verification
- [ ] Wire shared contracts to real persistence adapters

## Candidate MVP Workflows
1. Upcoming pickup / return dashboard
2. Auto-generated ops tasks per trip
3. Guest message drafting and approval
4. Late return / issue alerting in Slack
5. Daily team summary

## Risks / Open Questions
- What is the first reliable ingestion adapter after manual import?
- Which guest communication channels are approved after draft review?
- Which missing Supabase schema slices should land first: incidents or messaging?
- When should supervised Playwright be introduced as an optional adapter?

## Next Suggested Step
Implement Supabase-backed repository adapters and move the dashboard and worker off fixture context while keeping the same shared interfaces.
