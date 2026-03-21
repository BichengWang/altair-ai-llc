from __future__ import annotations

from .config import BrowserAgentConfig, read_config
from .fs import ensure_dir, ensure_parent_dir



def prepare_runtime(config: BrowserAgentConfig | None = None) -> dict[str, object]:
    cfg = config or read_config()
    ensure_parent_dir(cfg.storage_state_path)
    ensure_dir(cfg.artifacts_dir)
    return {
        "baseUrl": cfg.base_url,
        "headless": cfg.headless,
        "defaultTimeoutMs": cfg.default_timeout_ms,
        "slowMoMs": cfg.slowmo_ms,
        "storageStatePath": str(cfg.storage_state_path),
        "artifactsDir": str(cfg.artifacts_dir),
        "repoRoot": str(cfg.repo_root),
    }
