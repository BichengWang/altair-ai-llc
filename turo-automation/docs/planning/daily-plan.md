# Daily Plan

Use this file for the current working plan. Keep it short, current, and actionable.

## Date
2026-03-19

## Objective
Stand up the Turo Automation sub-repo and define the MVP for daily host operations.

## Today's Priorities
- [x] Create repo structure
- [x] Create docs structure
- [x] Create planning + logging files
- [x] Define MVP workflows
- [x] Draft data model
- [x] Draft architecture overview
- [x] Draft implementation roadmap
- [x] Initialize `web/`, `worker/`, and `shared/` app skeletons
- [ ] Add the first Supabase schema and migrations for vehicles, guests, trips, and tasks

## Candidate MVP Workflows
1. Upcoming pickup / return dashboard
2. Auto-generated ops tasks per trip
3. Guest message drafting and approval
4. Late return / issue alerting in Slack
5. Daily team summary

## Risks / Open Questions
- What ingestion path will provide trip data reliably?
- Which channels are approved for guest communication?
- Which actions can be fully automated vs approval-only?
- What are the exact daily pain points for the host team?

## Next Suggested Step
Add the first Supabase schema/migration slice for `vehicles`, `guests`, `trips`, and `tasks`, then connect the dashboard shell to those domain models.
