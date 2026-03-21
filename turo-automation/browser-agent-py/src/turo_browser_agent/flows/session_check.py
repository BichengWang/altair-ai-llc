from __future__ import annotations

from ..config import read_config
from ..runtime import BrowserDependencyError, capture_page_artifacts, open_browser_page
from ..types import create_result



def run_session_check():
    config = read_config()
    state_exists = config.storage_state_path.exists()
    if not state_exists:
        return create_result(
            "session:check",
            {
                "implemented": True,
                "stateFileExists": False,
                "status": "missing_state",
                "storageStatePath": str(config.storage_state_path),
                "artifactsDir": str(config.artifacts_dir),
            },
            warnings=["No storage state found; run session-bootstrap first."],
        )

    try:
        with open_browser_page(config, storage_state=str(config.storage_state_path)) as (_, context, page):
            response = page.goto(config.base_url, wait_until="domcontentloaded")
            try:
                page.wait_for_load_state("networkidle", timeout=min(config.default_timeout_ms, 5000))
            except Exception:
                pass
            title = page.title()
            url = page.url
            cookies = context.cookies()
            body_text = (page.locator("body").inner_text(timeout=5000) or "")[:2000]

            blocked = "you've been blocked" in body_text.lower() or "blocked" in title.lower()
            looks_logged_out = any(marker in body_text.lower() for marker in ["log in", "sign up", "join turo"])
            status = "authenticated" if not blocked and not looks_logged_out else "login_required"
            if blocked:
                status = "blocked"

            artifacts = capture_page_artifacts(page, config, "session-check")
            warnings = None
            if status == "login_required":
                warnings = ["Stored browser state exists, but Turo still appears to require login."]
            elif status == "blocked":
                warnings = ["Turo appears to be blocking this browser session."]

            return create_result(
                "session:check",
                {
                    "implemented": True,
                    "stateFileExists": True,
                    "status": status,
                    "storageStatePath": str(config.storage_state_path),
                    "artifactsDir": str(config.artifacts_dir),
                    "title": title,
                    "finalUrl": url,
                    "httpStatus": response.status if response else None,
                    "cookieCount": len(cookies),
                    "artifacts": artifacts,
                },
                warnings=warnings,
            )
    except BrowserDependencyError as exc:
        return create_result(
            "session:check",
            {
                "implemented": False,
                "stateFileExists": True,
                "status": "dependency_missing",
                "storageStatePath": str(config.storage_state_path),
            },
            warnings=[str(exc)],
            ok=False,
        )
    except Exception as exc:
        return create_result(
            "session:check",
            {
                "implemented": True,
                "stateFileExists": True,
                "status": "check_failed",
                "storageStatePath": str(config.storage_state_path),
                "error": str(exc),
            },
            warnings=["Session check failed while opening Turo with saved state."],
            ok=False,
        )
