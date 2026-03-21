import test from "node:test";
import assert from "node:assert/strict";
import {
  FIXTURE_NOW,
  FIXTURE_TODAY,
  createActOnApprovalUseCase,
  createDetectLateReturnsUseCase,
  createFixtureContext,
  createGenerateLifecycleTasksUseCase,
  createGetTodayOpsSnapshotUseCase,
  createImportTripsUseCase,
  createInMemoryGuestRepository,
  createInMemoryTripRepository,
  createInMemoryVehicleRepository,
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

test("ImportTrips upserts guests and vehicles when repos are provided", async () => {
  const tripRepository = createInMemoryTripRepository({ trips: [], tripEvents: [] });
  const guestRepository = createInMemoryGuestRepository({ guests: [] });
  const vehicleRepository = createInMemoryVehicleRepository({ vehicles: [] });

  const importSource = {
    async readTripImportRows() {
      return [
        {
          externalTripId: "TU-9901",
          guestFullName: "Import Guest",
          guestEmail: "import@example.com",
          guestPhone: "+13105559999",
          vehicleNickname: "Test EV",
          pickupAt: "2026-04-10T10:00:00.000Z",
          returnAt: "2026-04-12T10:00:00.000Z",
          pickupLocation: "Test Location",
          returnLocation: "Test Location",
          tripStatus: "upcoming",
          deliveryRequired: false,
          tripTotalAmount: 150,
          source: "test",
        },
      ];
    },
  };

  const useCase = createImportTripsUseCase({
    tripImportSource: importSource,
    tripRepository,
    guestRepository,
    vehicleRepository,
  });

  const result = await useCase.execute({
    triggeredBy: "test-runner",
    importedAt: FIXTURE_NOW,
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.importedTrips.length, 1);

  // Guest and vehicle should have been upserted
  const guests = await guestRepository.listGuests();
  assert.equal(guests.length, 1);
  assert.equal(guests[0].fullName, "Import Guest");
  assert.equal(guests[0].email, "import@example.com");

  const vehicles = await vehicleRepository.listVehicles();
  assert.equal(vehicles.length, 1);
  assert.equal(vehicles[0].nickname, "Test EV");

  // Trip references the upserted guest and vehicle
  const trips = await tripRepository.listTrips();
  assert.equal(trips[0].guestId, guests[0].id);
  assert.equal(trips[0].vehicleId, vehicles[0].id);
});

test("ActOnApproval transitions a pending approval to approved and updates draft state", async () => {
  const context = createFixtureContext();
  const noopNotifier = {
    async publishDigest() { return { accepted: false, externalId: null }; },
    async notifyApprovalRequested() { return { accepted: false, externalId: null }; },
    async notifyIncidentDetected() { return { accepted: false, externalId: null }; },
  };

  const useCase = createActOnApprovalUseCase({
    messageRepository: context.messageRepository,
    notifier: noopNotifier,
  });

  const result = await useCase.execute({
    approvalRequestId: "approval-tu-1001-pretrip",
    decision: "approved",
    reviewedBy: "test.reviewer",
    reviewedAt: FIXTURE_NOW,
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.approvalRequest.status, "approved");
  assert.equal(result.data.approvalRequest.reviewedBy, "test.reviewer");
  assert.equal(result.data.draft.approvalStatus, "approved");
  assert.equal(result.data.draft.state, "ready_for_review");
});
