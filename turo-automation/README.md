# Turo Automation

Internal automation platform for the Turo host team.

## Purpose

Centralize and automate daily host operations:
- trip intake and task generation
- guest communication workflows
- vehicle readiness and turnaround ops
- late return / incident handling
- team coordination and reporting

## Repo Structure

```text
turo-automation/
  docs/
    architecture/
    logs/
    planning/
    product/
    runbooks/
  web/
  worker/
  shared/
```

## Working Principles

1. Automate repetitive work first.
2. Keep human approval for risky guest-facing actions.
3. Record decisions in docs as we go.
4. Treat daily plan and dev log as source-of-truth for active work.

## Initial Priorities

- Define MVP workflows
- Draft system architecture and data model
- Build internal dashboard + background worker
- Add Slack-first operational notifications
