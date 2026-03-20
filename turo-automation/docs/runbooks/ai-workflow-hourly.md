# AI Workflow — Hourly Development Loop

Run every hour.

## Goal
Review the current development state, choose the single highest-priority next PR, implement it if feasible, verify it, open or update the PR, and keep the docs folder aligned with actual progress.

## Statement

Before Development, create {your branch name} by
```shell
git co -b {your branch name}
```

Use follow command to submit PR with {your pr title}:
```shell
git pr "{your pr title}"
```

After submit PR, delete local branch and go to {main} branch by
```
git co main
```

## Instructions
1. Review the current dev plan, active PRs, recent commits, and previous development log.
2. Identify the single highest-priority task that is ready to execute now.
3. If there is already an open PR for that task:
   - continue that PR instead of starting a new one
   - implement the next meaningful increment
4. If there is no open PR for that task:
   - create a new branch for the task
   - implement the smallest complete, reviewable increment
5. During development:
   - make code changes
   - run relevant verification and tests
   - fix obvious failures caused by the change
   - perform a brief self-review for correctness, regressions, and missing edge cases
6. If the work is in a reviewable state:
   - commit changes
   - open or update the PR
   - include a concise PR summary, verification results, and remaining follow-ups
7. Update the `docs/` folder based on:
   - the current PR
   - the previous development log
   - any newly completed behavior, decisions, or workflow changes
8. Do not invent progress. Only mark items complete if they are actually implemented and verified.
9. Prefer continuing in-flight work over starting new work, unless a higher-priority blocker or dependency change makes that incorrect.
10. If nothing is ready for implementation, do not force code changes. Instead, update the plan, docs, and next-action recommendations.

## Output
- Finished:
  - list work completed in this run
- Current PR:
  - PR title / link or branch name
  - status
  - verification performed
- Docs updated:
  - files updated in `docs/`
  - what changed
- Potential TODO:
  - short list of important remaining tasks
- Next highest priority:
  - the single next task to execute
  - why it is next
- Blockers:
  - anything preventing further progress

## Rules
- Work on one highest-priority PR at a time.
- Prefer small, mergeable increments.
- Do not duplicate existing PRs.
- Do not mark speculative work as done.
- Keep docs synchronized with implemented reality, not intentions alone.
