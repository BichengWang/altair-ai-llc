from __future__ import annotations

from ..config import read_config
from ..runtime import prepare_runtime
from ..types import create_result



def run_session_bootstrap():
    config = read_config()
    runtime = prepare_runtime(config)
    return create_result(
        "session:bootstrap",
        {
            **runtime,
            "implemented": False,
            "prepared": True,
            "next": [
                "launch a headed browser session",
                "navigate to the Turo login flow",
                "pause for manual auth / MFA",
                "verify authenticated landing page",
                "persist storage state to storage/state.json",
            ],
        },
    )
