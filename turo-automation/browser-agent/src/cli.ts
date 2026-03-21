import { runHealthSmoke } from './flows/healthSmoke.js';
import { runSessionBootstrap } from './flows/sessionBootstrap.js';
import { runSessionCheck } from './flows/sessionCheck.js';

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'health:smoke':
      process.stdout.write(`${JSON.stringify(await runHealthSmoke(), null, 2)}\n`);
      return;
    case 'session:bootstrap':
      process.stdout.write(`${JSON.stringify(await runSessionBootstrap(), null, 2)}\n`);
      return;
    case 'session:check':
      process.stdout.write(`${JSON.stringify(await runSessionCheck(), null, 2)}\n`);
      return;
    default:
      throw new Error(`Unknown command: ${command ?? '<missing>'}`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${JSON.stringify({ ok: false, error: message }, null, 2)}\n`);
  process.exit(1);
});
