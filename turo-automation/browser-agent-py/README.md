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
After `python3 -m pip install -e .`, the `turo-browser-agent` console script is also available.

## Current status

This is now a minimal real browser runner:
- `health-smoke` launches a browser and opens Turo
- `session-bootstrap` opens the login flow and waits for manual auth
- `session-check` reuses saved browser state and checks whether the session still looks valid

It still stays read-first and intentionally avoids guest-facing writes.

## Local dev

```bash
cd turo-automation/browser-agent-py
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
python3 -m playwright install chromium
./run health-smoke
```

If you want to use an installed Chrome instead of Playwright-managed Chromium:

```bash
export BROWSER_AGENT_BROWSER_CHANNEL=chrome
```

## Environment variables

- `TURO_BASE_URL` — default `https://turo.com`
- `TURO_LOGIN_URL` — default `<base>/login`
- `BROWSER_AGENT_HEADLESS` — default `false`
- `BROWSER_AGENT_TIMEOUT_MS` — default `15000`
- `BROWSER_AGENT_SLOWMO_MS` — default `0`
- `BROWSER_AGENT_BOOTSTRAP_WAIT_MS` — default `120000`
- `BROWSER_AGENT_BROWSER_CHANNEL` — optional Playwright browser channel (for example `chrome`)
- `BROWSER_AGENT_STORAGE_STATE_PATH` — default `storage/state.json`
- `BROWSER_AGENT_ARTIFACTS_DIR` — default `artifacts/`

## Storage conventions

- `storage/state.json` — persisted browser auth state
- `artifacts/` — screenshots and debug artifacts
