import { createWorkerApp } from "./app/createWorkerApp.js";

async function main() {
  const workerApp = createWorkerApp();
  await workerApp.run();
}

void main().catch((error: unknown) => {
  console.error("[worker] fatal", error);
  process.exitCode = 1;
});
