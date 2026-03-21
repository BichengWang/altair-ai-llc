# Browser Agent (Python)

Python-first executable subtree for Turo host browser automation.

## Why this exists

The repo already has a TypeScript `browser-agent/` package, but the actual host-browser workflow is a better fit for a small Python CLI subtree that can grow into a standalone automation runner without coupling it to the web dashboard or worker packages.

This subtree captures the learned browser automation steps as executable commands and JSON contracts.

## Command surface

- `./run health-smoke`
- `./run session-bootstrap`
- `./run session-check`
- `turo-browser-agent health-smoke`
- `turo-browser-agent session-bootstrap`
- `turo-browser-agent session-check`

The checked-in `./run` wrapper works without installing the package first.
After `pip install -e .`, the `turo-browser-agent` console script is also available.

## Current status

This is a scaffold with executable commands and filesystem/runtime preparation.
It intentionally stays read-first and documents the next implementation slice instead of pretending the Turo flow is already production-ready.

## Local dev

```bash
cd turo-automation/browser-agent-py
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
turo-browser-agent health-smoke
```

## Storage conventions

- `storage/state.json` — persisted browser auth state
- `artifacts/` — screenshots and debug artifacts
