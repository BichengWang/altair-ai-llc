from __future__ import annotations

from ..config import read_config
from ..types import create_result



def run_session_check():
    config = read_config()
    state_exists = config.storage_state_path.exists()
    warnings = None if state_exists else ["No storage state found; run session-bootstrap first."]
    return create_result(
        "session:check",
        {
            "implemented": False,
            "stateFileExists": state_exists,
            "status": "ready_for_browser_check" if state_exists else "missing_state",
            "storageStatePath": str(config.storage_state_path),
            "artifactsDir": str(config.artifacts_dir),
            "next": [
                "launch browser with saved state",
                "navigate to host dashboard or trips page",
                "verify authenticated markers",
                "return actionable auth status",
            ],
        },
        warnings=warnings,
    )
