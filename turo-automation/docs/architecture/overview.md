# Architecture Overview

## Proposed Components

### `web/`
Internal dashboard for:
- trip list and status
- today's pickups / returns
- task board
- message drafts and approvals
- issue tracking

### `worker/`
Background job runner for:
- scheduled reminders
- trip lifecycle task creation
- late return detection
- digest generation
- integration sync jobs

### `shared/`
Shared code for:
- TypeScript types
- business rules
- validation
- API client helpers

## Core Design Principle
Separate user-facing operational views (`web`) from automation execution (`worker`) so manual ops and automated jobs can evolve independently.

## Expected Integrations
- Supabase
- Slack
- email / SMS / WhatsApp later
- trip data ingestion source (TBD)
