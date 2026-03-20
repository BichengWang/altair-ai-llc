import { appName, nextMilestone } from "@turo-automation/shared";

function main() {
  console.log(`[worker] ${appName}`);
  console.log(`[worker] next milestone: ${nextMilestone}`);
}

main();
