import { readBrowserAgentConfig } from '../config.js';
import { createResult } from '../results.js';

export async function runSessionBootstrap() {
  const config = readBrowserAgentConfig();
  return createResult('session:bootstrap', {
    implemented: false,
    next: [
      'launch headed Playwright browser',
      'navigate to login',
      'wait for manual authentication',
      'save storage state',
    ],
    config: {
      baseUrl: config.baseUrl,
      storageStatePath: config.storageStatePath,
    },
  });
}
