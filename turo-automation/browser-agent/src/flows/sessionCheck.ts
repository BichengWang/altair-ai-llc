import { readBrowserAgentConfig } from '../config.js';
import { createResult } from '../results.js';

export async function runSessionCheck() {
  const config = readBrowserAgentConfig();
  return createResult('session:check', {
    implemented: false,
    checks: [
      'load storage state',
      'open dashboard or trips page',
      'detect authenticated vs expired session',
    ],
    config: {
      baseUrl: config.baseUrl,
      storageStatePath: config.storageStatePath,
    },
  });
}
