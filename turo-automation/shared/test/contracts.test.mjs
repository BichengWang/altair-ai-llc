import test from "node:test";
import assert from "node:assert/strict";
import {
  FIXTURE_NOW,
  FIXTURE_TODAY,
  createDetectLateReturnsUseCase,
  createFixtureContext,
  createGenerateLifecycleTasksUseCase,
  createGetTodayOpsSnapshotUseCase,
} from "../dist/index.js";

test("GetTodayOpsSnapshot returns the typed fixture snapshot", async () => {
  const context = createFixtureContext();
  const useCase = createGetTodayOpsSnapshotUseCase({
    tripRepository: context.tripRepository,
    taskRepository: context.taskRepository,
    incidentRepository: context.incidentRepository,
    messageRepository: context.messageRepository,
    jobRunRepository: context.jobRunRepository,
    guests: context.guests,
    vehicles: context.vehicles,
  });

  const result = await useCase.execute({
    today: FIXTURE_TODAY,
    generatedAt: FIXTURE_NOW,
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.pickups.length, 1);
  assert.equal(result.data.returns.length, 2);
  assert.equal(result.data.pendingApprovals.length, 1);
  assert.equal(result.data.overdueTasks.length, 1);
});

test("GenerateLifecycleTasks is deterministic for the fixture trip set", async () => {
  const context = createFixtureContext();
  const useCase = createGenerateLifecycleTasksUseCase({
    tripRepository: context.tripRepository,
    taskRepository: context.taskRepository,
    vehicles: context.vehicles,
  });

  const result = await useCase.execute({
    asOf: FIXTURE_NOW,
    createdBy: "test-runner",
  });

  assert.equal(result.data.createdTasks.length, 3);
  assert.deepEqual(
    result.data.createdTasks.map((task) => task.id).sort(),
    [
      "task-trip-tu-1001-pickup-check",
      "task-trip-tu-1002-return-check",
      "task-trip-tu-1003-incident-followup",
    ].sort(),
  );
});

test("DetectLateReturns creates one incident per qualifying overdue trip", async () => {
  const context = createFixtureContext();
  const useCase = createDetectLateReturnsUseCase({
    tripRepository: context.tripRepository,
    incidentRepository: context.incidentRepository,
    notifier: context.notifier,
    vehicles: context.vehicles,
  });

  const result = await useCase.execute({
    asOf: FIXTURE_NOW,
    openedBy: "test-runner",
  });

  assert.equal(result.data.incidentsCreated.length, 2);
  assert.deepEqual(
    result.data.incidentsCreated.map((incident) => incident.tripId).sort(),
    ["trip-tu-1002", "trip-tu-1003"],
  );
});
