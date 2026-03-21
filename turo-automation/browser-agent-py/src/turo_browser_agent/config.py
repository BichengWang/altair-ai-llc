from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


@dataclass(slots=True)
class BrowserAgentConfig:
    base_url: str
    headless: bool
    default_timeout_ms: int
    slowmo_ms: int
    storage_state_path: Path
    artifacts_dir: Path
    repo_root: Path



def _default_repo_root() -> Path:
    return Path(__file__).resolve().parents[2]



def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.lower() in {"1", "true", "yes", "on"}



def read_config() -> BrowserAgentConfig:
    repo_root = Path(os.getenv("TURO_BROWSER_AGENT_ROOT", _default_repo_root()))
    storage_state_path = Path(
        os.getenv(
            "BROWSER_AGENT_STORAGE_STATE_PATH",
            str(repo_root / "storage" / "state.json"),
        )
    )
    artifacts_dir = Path(
        os.getenv(
            "BROWSER_AGENT_ARTIFACTS_DIR",
            str(repo_root / "artifacts"),
        )
    )

    return BrowserAgentConfig(
        base_url=os.getenv("TURO_BASE_URL", "https://turo.com"),
        headless=_env_bool("BROWSER_AGENT_HEADLESS", False),
        default_timeout_ms=int(os.getenv("BROWSER_AGENT_TIMEOUT_MS", "15000")),
        slowmo_ms=int(os.getenv("BROWSER_AGENT_SLOWMO_MS", "0")),
        storage_state_path=storage_state_path,
        artifacts_dir=artifacts_dir,
        repo_root=repo_root,
    )
