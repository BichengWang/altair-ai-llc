from __future__ import annotations

from ..config import read_config
from ..runtime import prepare_runtime
from ..types import create_result



def run_health_smoke():
    config = read_config()
    runtime = prepare_runtime(config)
    return create_result(
        "health:smoke",
        {
            **runtime,
            "implemented": False,
            "next": [
                "install Playwright or Selenium runtime",
                "open the Turo landing page",
                "verify DOM/content load",
                "capture a smoke-test artifact on failure",
            ],
        },
    )
