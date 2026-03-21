import test from "node:test";
import assert from "node:assert/strict";
import { createJobScheduler } from "../dist/scheduler/createJobScheduler.js";

test("JobScheduler runs each job immediately on start", async () => {
  const ran = [];

  const scheduler = createJobScheduler([
    {
      name: "job-a",
      intervalMs: 60_000,
      async run() {
        ran.push("a");
      },
    },
    {
      name: "job-b",
      intervalMs: 60_000,
      async run() {
        ran.push("b");
      },
    },
  ]);

  scheduler.start();

  // Allow microtasks to flush
  await new Promise((resolve) => setImmediate(resolve));

  scheduler.stop();

  assert.deepEqual(ran.sort(), ["a", "b"]);
});

test("JobScheduler isolates job failures — other jobs still run", async () => {
  const ran = [];

  const scheduler = createJobScheduler([
    {
      name: "job-fail",
      intervalMs: 60_000,
      async run() {
        throw new Error("intentional failure");
      },
    },
    {
      name: "job-ok",
      intervalMs: 60_000,
      async run() {
        ran.push("ok");
      },
    },
  ]);

  scheduler.start();

  await new Promise((resolve) => setImmediate(resolve));

  scheduler.stop();

  assert.deepEqual(ran, ["ok"]);
});

test("JobScheduler stop clears intervals", () => {
  const scheduler = createJobScheduler([
    {
      name: "job-repeat",
      intervalMs: 10,
      async run() {},
    },
  ]);

  scheduler.start();
  scheduler.stop();

  // If stop() didn't clear the interval, the test would hang
  assert.ok(true, "stop() returned without hanging");
});
