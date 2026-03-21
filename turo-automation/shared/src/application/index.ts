import type {
  ApprovalRequest,
  ApprovalStatus,
  Incident,
  ISODateString,
  JobName,
  JobRun,
  JobStatus,
  MessageDraft,
  MessageThread,
  MessageState,
  Task,
  TaskPriority,
  TaskType,
  Trip,
  TripEvent,
  TripImportRow,
  TripStatus,
  Vehicle,
} from "../domain/index.js";
import type {
  BrowserAssistPort,
  IncidentRepository,
  JobRunRepository,
  MessageRepository,
  OpsNotifier,
  TaskRepository,
  TripImportSource,
  TripRepository,
} from "../ports/index.js";

export type UseCaseSeverity = "info" | "warning" | "error";

export interface UseCaseIssue {
  code: string;
  message: string;
  severity: UseCaseSeverity;
  entityType?: string;
  entityId?: string;
}

export interface UseCaseResult<TData> {
  ok: boolean;
  data: TData;
  issues: UseCaseIssue[];
  meta: {
    generatedAt: ISODateString;
  };
}

export interface TodayOpsTripItem {
  tripId: string;
  externalTripId: string;
  vehicleLabel: string;
  guestLabel: string;
  tripStatus: TripStatus;
  pickupAt: ISODateString;
  returnAt: ISODateString;
  needsDelivery: boolean;
}

export interface TodayOpsIncidentItem {
  incidentId: string;
  tripId: string | null;
  summary: string;
  severity: Incident["severity"];
  status: Incident["status"];
  openedAt: ISODateString;
}

export interface TodayOpsApprovalItem {
  approvalRequestId: string;
  draftId: string;
  tripId: string;
  status: ApprovalRequest["status"];
  requestedBy: string;
  requestedAt: ISODateString;
}

export interface WorkerHealthItem {
  jobName: JobName;
  status: JobStatus;
  finishedAt: ISODateString | null;
  summary: string;
  issueCount: number;
}

export interface TodayOpsSnapshot {
  generatedAt: ISODateString;
  pickups: TodayOpsTripItem[];
  returns: TodayOpsTripItem[];
  activeIssues: TodayOpsIncidentItem[];
  pendingApprovals: TodayOpsApprovalItem[];
  overdueTasks: Task[];
  workerHealth: WorkerHealthItem[];
  summary: {
    pickupCount: number;
    returnCount: number;
    activeIssueCount: number;
    pendingApprovalCount: number;
    overdueTaskCount: number;
  };
}

export interface ImportTripsInput {
  triggeredBy: string;
  sourceRunId?: string;
  importedAt: ISODateString;
}

export interface ImportTripsData {
  rowsRead: number;
  importedTrips: Trip[];
  importedTripEvents: TripEvent[];
}

export interface GenerateLifecycleTasksInput {
  asOf: ISODateString;
  createdBy: string;
}

export interface GenerateLifecycleTasksData {
  createdTasks: Task[];
  existingTasks: Task[];
}

export interface CreateMessageDraftInput {
  tripId: string;
  templateKey: string;
  requestedBy: string;
  createdAt: ISODateString;
}

export interface CreateMessageDraftData {
  draft: MessageDraft | null;
}

export interface RequestApprovalInput {
  draftId: string;
  tripId: string;
  requestedBy: string;
  requestedAt: ISODateString;
}

export interface RequestApprovalData {
  approvalRequest: ApprovalRequest | null;
}

export interface DetectLateReturnsInput {
  asOf: ISODateString;
  openedBy: string;
}

export interface DetectLateReturnsData {
  incidentsCreated: Incident[];
}

export interface BuildDailyDigestInput {
  today: string;
  generatedAt: ISODateString;
  channel: string;
}

export interface BuildDailyDigestData {
  snapshot: TodayOpsSnapshot;
  summary: string;
  notificationAccepted: boolean;
}

export interface GetTodayOpsSnapshotInput {
  today: string;
  generatedAt: ISODateString;
}

export interface GetTodayOpsSnapshotUseCase {
  execute(
    input: GetTodayOpsSnapshotInput,
  ): Promise<UseCaseResult<TodayOpsSnapshot>>;
}

export interface ImportTripsUseCase {
  execute(input: ImportTripsInput): Promise<UseCaseResult<ImportTripsData>>;
}

export interface GenerateLifecycleTasksUseCase {
  execute(
    input: GenerateLifecycleTasksInput,
  ): Promise<UseCaseResult<GenerateLifecycleTasksData>>;
}

export interface CreateMessageDraftUseCase {
  execute(
    input: CreateMessageDraftInput,
  ): Promise<UseCaseResult<CreateMessageDraftData>>;
}

export interface RequestApprovalUseCase {
  execute(
    input: RequestApprovalInput,
  ): Promise<UseCaseResult<RequestApprovalData>>;
}

export interface DetectLateReturnsUseCase {
  execute(
    input: DetectLateReturnsInput,
  ): Promise<UseCaseResult<DetectLateReturnsData>>;
}

export interface BuildDailyDigestUseCase {
  execute(
    input: BuildDailyDigestInput,
  ): Promise<UseCaseResult<BuildDailyDigestData>>;
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeResult<TData>(
  data: TData,
  issues: UseCaseIssue[],
  generatedAt: ISODateString,
): UseCaseResult<TData> {
  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    data,
    issues,
    meta: {
      generatedAt,
    },
  };
}

function dayPrefix(value: ISODateString): string {
  return value.slice(0, 10);
}

function minutesBefore(iso: ISODateString, minutes: number): ISODateString {
  return new Date(Date.parse(iso) - minutes * 60_000).toISOString();
}

function minutesAfter(iso: ISODateString, minutes: number): ISODateString {
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString();
}

function stableId(parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findVehicle(vehicles: Vehicle[], vehicleId: string): Vehicle | undefined {
  return vehicles.find((vehicle) => vehicle.id === vehicleId);
}

function buildTripLabel(
  trip: Trip,
  guestsById: Map<string, string>,
  vehiclesById: Map<string, string>,
): TodayOpsTripItem {
  return {
    tripId: trip.id,
    externalTripId: trip.externalTripId,
    vehicleLabel: vehiclesById.get(trip.vehicleId) ?? trip.vehicleId,
    guestLabel: guestsById.get(trip.guestId) ?? trip.guestId,
    tripStatus: trip.status,
    pickupAt: trip.pickupAt,
    returnAt: trip.returnAt,
    needsDelivery: trip.deliveryRequired,
  };
}

function buildDigestText(snapshot: TodayOpsSnapshot): string {
  return [
    `Turo ops digest for ${snapshot.generatedAt.slice(0, 10)}`,
    `Pickups: ${snapshot.summary.pickupCount}`,
    `Returns: ${snapshot.summary.returnCount}`,
    `Active issues: ${snapshot.summary.activeIssueCount}`,
    `Pending approvals: ${snapshot.summary.pendingApprovalCount}`,
    `Overdue tasks: ${snapshot.summary.overdueTaskCount}`,
  ].join("\n");
}

function taskTemplateForTrip(
  trip: Trip,
  vehiclesById: Map<string, Vehicle>,
): Array<{
  type: TaskType;
  title: string;
  description: string;
  dueAt: ISODateString;
  priority: TaskPriority;
}> {
  const vehicle = vehiclesById.get(trip.vehicleId);
  const vehicleLabel = vehicle?.nickname ?? trip.vehicleId;
  const templates: Array<{
    type: TaskType;
    title: string;
    description: string;
    dueAt: ISODateString;
    priority: TaskPriority;
  }> = [];

  if (trip.status === "upcoming") {
    templates.push({
      type: "prep",
      title: `Prep ${vehicleLabel} for pickup`,
      description: "Confirm fueling, cleaning, and staging before guest arrival.",
      dueAt: minutesBefore(trip.pickupAt, 120),
      priority: "high",
    });
    templates.push({
      type: "pickup_check",
      title: `Pickup check for ${vehicleLabel}`,
      description: "Verify photos, key handoff instructions, and trip readiness.",
      dueAt: trip.pickupAt,
      priority: trip.deliveryRequired ? "urgent" : "high",
    });
  }

  if (trip.status === "active") {
    templates.push({
      type: "return_check",
      title: `Return check for ${vehicleLabel}`,
      description: "Review expected return status, photos, and guest notes.",
      dueAt: trip.returnAt,
      priority: "high",
    });
  }

  if (trip.status === "completed") {
    templates.push({
      type: "cleaning",
      title: `Turn around ${vehicleLabel}`,
      description: "Clean, refuel, and reset the vehicle after trip completion.",
      dueAt: minutesAfter(trip.actualReturnAt ?? trip.returnAt, 45),
      priority: "medium",
    });
  }

  if (trip.status === "issue") {
    templates.push({
      type: "incident_followup",
      title: `Investigate issue on ${vehicleLabel}`,
      description: "Coordinate host follow-up and collect supporting evidence.",
      dueAt: trip.returnAt,
      priority: "urgent",
    });
  }

  return templates;
}

export function buildTodayOpsSnapshotModel(input: {
  today: string;
  generatedAt: ISODateString;
  trips: Trip[];
  tasks: Task[];
  incidents: Incident[];
  approvalRequests: ApprovalRequest[];
  jobRuns: JobRun[];
  guests: Array<{ id: string; fullName: string }>;
  vehicles: Vehicle[];
}): UseCaseResult<TodayOpsSnapshot> {
  const guestsById = new Map(
    input.guests.map((guest) => [guest.id, guest.fullName] as const),
  );
  const vehiclesById = new Map(
    input.vehicles.map(
      (vehicle) => [vehicle.id, `${vehicle.nickname} (${vehicle.plate ?? "no plate"})`] as const,
    ),
  );

  const pickups = input.trips
    .filter((trip) => dayPrefix(trip.pickupAt) === input.today)
    .map((trip) => buildTripLabel(trip, guestsById, vehiclesById));
  const returns = input.trips
    .filter((trip) => dayPrefix(trip.returnAt) === input.today)
    .map((trip) => buildTripLabel(trip, guestsById, vehiclesById));
  const activeIssues = input.incidents
    .filter((incident) => incident.status !== "resolved" && incident.status !== "closed")
    .map((incident) => ({
      incidentId: incident.id,
      tripId: incident.tripId,
      summary: incident.summary,
      severity: incident.severity,
      status: incident.status,
      openedAt: incident.openedAt,
    }));
  const pendingApprovals = input.approvalRequests
    .filter((approvalRequest) => approvalRequest.status === "pending")
    .map((approvalRequest) => ({
      approvalRequestId: approvalRequest.id,
      draftId: approvalRequest.draftId,
      tripId: approvalRequest.tripId,
      status: approvalRequest.status,
      requestedBy: approvalRequest.requestedBy,
      requestedAt: approvalRequest.requestedAt,
    }));
  const overdueTasks = input.tasks.filter((task) => {
    if (!task.dueAt) {
      return false;
    }

    return (
      task.status !== "done" &&
      task.status !== "cancelled" &&
      Date.parse(task.dueAt) < Date.parse(input.generatedAt)
    );
  });
  const workerHealth = input.jobRuns.map((jobRun) => ({
    jobName: jobRun.jobName,
    status: jobRun.status,
    finishedAt: jobRun.finishedAt,
    summary: jobRun.summary,
    issueCount: jobRun.issueCount,
  }));

  const issues: UseCaseIssue[] = [];

  if (overdueTasks.length > 0) {
    issues.push({
      code: "OVERDUE_TASKS_PRESENT",
      message: `${overdueTasks.length} tasks are overdue in the ops snapshot.`,
      severity: "warning",
      entityType: "task",
    });
  }

  if (workerHealth.some((job) => job.status === "failed")) {
    issues.push({
      code: "FAILED_JOB_PRESENT",
      message: "One or more worker jobs are marked as failed.",
      severity: "warning",
      entityType: "job_run",
    });
  }

  return makeResult(
    {
      generatedAt: input.generatedAt,
      pickups,
      returns,
      activeIssues,
      pendingApprovals,
      overdueTasks,
      workerHealth,
      summary: {
        pickupCount: pickups.length,
        returnCount: returns.length,
        activeIssueCount: activeIssues.length,
        pendingApprovalCount: pendingApprovals.length,
        overdueTaskCount: overdueTasks.length,
      },
    },
    issues,
    input.generatedAt,
  );
}

export function computeLifecycleTasks(input: {
  asOf: ISODateString;
  createdBy: string;
  trips: Trip[];
  vehicles: Vehicle[];
  existingTasks: Task[];
}): UseCaseResult<GenerateLifecycleTasksData> {
  const vehiclesById = new Map(input.vehicles.map((vehicle) => [vehicle.id, vehicle]));
  const existingTaskIds = new Set(
    input.existingTasks.map((task) => `${task.tripId ?? "none"}:${task.type}`),
  );

  const createdTasks: Task[] = [];

  for (const trip of input.trips) {
    for (const template of taskTemplateForTrip(trip, vehiclesById)) {
      const dedupeKey = `${trip.id}:${template.type}`;
      if (existingTaskIds.has(dedupeKey)) {
        continue;
      }

      createdTasks.push({
        id: stableId(["task", trip.id, template.type]),
        tripId: trip.id,
        vehicleId: trip.vehicleId,
        type: template.type,
        title: template.title,
        description: template.description,
        status: "todo",
        priority: template.priority,
        assignedTo: null,
        dueAt: template.dueAt,
        completedAt: null,
        createdBy: input.createdBy,
        createdAt: input.asOf,
        updatedAt: input.asOf,
      });
    }
  }

  const issues =
    createdTasks.length === 0
      ? [
          {
            code: "NO_LIFECYCLE_TASKS_CREATED",
            message: "No additional lifecycle tasks were created for the current trip set.",
            severity: "info" as const,
          },
        ]
      : [];

  return makeResult(
    {
      createdTasks,
      existingTasks: input.existingTasks,
    },
    issues,
    input.asOf,
  );
}

export function computeLateReturnIncidents(input: {
  asOf: ISODateString;
  openedBy: string;
  trips: Trip[];
  incidents: Incident[];
  vehicles: Vehicle[];
}): UseCaseResult<DetectLateReturnsData> {
  const openLateReturnByTripId = new Set(
    input.incidents
      .filter(
        (incident) =>
          incident.type === "late_return" &&
          incident.status !== "resolved" &&
          incident.status !== "closed" &&
          incident.tripId,
      )
      .map((incident) => incident.tripId as string),
  );
  const vehiclesById = new Map(input.vehicles.map((vehicle) => [vehicle.id, vehicle]));

  const incidentsCreated = input.trips
    .filter(
      (trip) =>
        (trip.status === "active" || trip.status === "issue") &&
        !trip.actualReturnAt &&
        Date.parse(trip.returnAt) < Date.parse(input.asOf) &&
        !openLateReturnByTripId.has(trip.id),
    )
    .map((trip) => {
      const vehicle = vehiclesById.get(trip.vehicleId);
      const vehicleLabel = vehicle?.nickname ?? trip.vehicleId;

      return {
        id: stableId(["incident", trip.id, "late-return"]),
        tripId: trip.id,
        vehicleId: trip.vehicleId,
        type: "late_return" as const,
        severity: "high" as const,
        status: "open" as const,
        summary: `${vehicleLabel} is past the planned return time`,
        details: `Trip ${trip.externalTripId} has not been closed and is past ${trip.returnAt}.`,
        ownerId: input.openedBy,
        openedAt: input.asOf,
        resolvedAt: null,
        createdAt: input.asOf,
        updatedAt: input.asOf,
      };
    });

  const issues =
    incidentsCreated.length > 0
      ? [
          {
            code: "LATE_RETURNS_DETECTED",
            message: `${incidentsCreated.length} late return incidents were detected.`,
            severity: "warning" as const,
            entityType: "incident",
          },
        ]
      : [];

  return makeResult(
    {
      incidentsCreated,
    },
    issues,
    input.asOf,
  );
}

export function createGetTodayOpsSnapshotUseCase(deps: {
  tripRepository: TripRepository;
  taskRepository: TaskRepository;
  incidentRepository: IncidentRepository;
  messageRepository: MessageRepository;
  jobRunRepository: JobRunRepository;
  guests: Array<{ id: string; fullName: string }>;
  vehicles: Vehicle[];
}): GetTodayOpsSnapshotUseCase {
  return {
    async execute(input) {
      const [trips, tasks, incidents, approvalRequests, jobRuns] = await Promise.all([
        deps.tripRepository.listTrips(),
        deps.taskRepository.listTasks(),
        deps.incidentRepository.listIncidents(),
        deps.messageRepository.listApprovalRequests(),
        deps.jobRunRepository.listJobRuns(),
      ]);

      return buildTodayOpsSnapshotModel({
        today: input.today,
        generatedAt: input.generatedAt,
        trips,
        tasks,
        incidents,
        approvalRequests,
        jobRuns,
        guests: deps.guests,
        vehicles: deps.vehicles,
      });
    },
  };
}

export function createImportTripsUseCase(deps: {
  tripImportSource: TripImportSource;
  tripRepository: TripRepository;
}): ImportTripsUseCase {
  return {
    async execute(input) {
      const rows = await deps.tripImportSource.readTripImportRows({
        triggeredBy: input.triggeredBy,
        sourceRunId: input.sourceRunId,
      });
      const existingTrips = await deps.tripRepository.listTrips();
      const tripsByExternalId = new Map(
        existingTrips.map((trip) => [trip.externalTripId, trip] as const),
      );

      const importedTrips: Trip[] = [];
      const importedTripEvents: TripEvent[] = [];

      rows.forEach((row, index) => {
        const existingTrip = tripsByExternalId.get(row.externalTripId);
        const tripId = existingTrip?.id ?? stableId(["trip", row.externalTripId]);
        importedTrips.push({
          id: tripId,
          externalTripId: row.externalTripId,
          vehicleId: stableId(["vehicle", row.vehicleNickname]),
          guestId: stableId(["guest", row.guestFullName]),
          status: row.tripStatus,
          pickupAt: row.pickupAt,
          returnAt: row.returnAt,
          actualReturnAt: existingTrip?.actualReturnAt ?? null,
          pickupLocation: row.pickupLocation,
          returnLocation: row.returnLocation,
          tripTotalAmount: row.tripTotalAmount,
          deliveryRequired: row.deliveryRequired,
          source: row.source,
          notes: null,
          createdAt: existingTrip?.createdAt ?? input.importedAt,
          updatedAt: input.importedAt,
        });
        importedTripEvents.push({
          id: stableId(["trip-event", row.externalTripId, String(index)]),
          tripId,
          eventType: "trip_imported",
          eventTime: input.importedAt,
          source: row.source,
          payload: {
            externalTripId: row.externalTripId,
            tripStatus: row.tripStatus,
          },
          createdAt: input.importedAt,
        });
      });

      await deps.tripRepository.saveTrips(importedTrips);
      await deps.tripRepository.saveTripEvents(importedTripEvents);

      return makeResult(
        {
          rowsRead: rows.length,
          importedTrips,
          importedTripEvents,
        },
        [],
        input.importedAt,
      );
    },
  };
}

export function createGenerateLifecycleTasksUseCase(deps: {
  tripRepository: TripRepository;
  taskRepository: TaskRepository;
  vehicles: Vehicle[];
}): GenerateLifecycleTasksUseCase {
  return {
    async execute(input) {
      const [trips, existingTasks] = await Promise.all([
        deps.tripRepository.listTrips(),
        deps.taskRepository.listTasks(),
      ]);
      const result = computeLifecycleTasks({
        asOf: input.asOf,
        createdBy: input.createdBy,
        trips,
        vehicles: deps.vehicles,
        existingTasks,
      });

      if (result.data.createdTasks.length > 0) {
        await deps.taskRepository.saveTasks(result.data.createdTasks);
      }

      return result;
    },
  };
}

export function createCreateMessageDraftUseCase(deps: {
  tripRepository: TripRepository;
  messageRepository: MessageRepository;
}): CreateMessageDraftUseCase {
  return {
    async execute(input) {
      const trip = await deps.tripRepository.getTripById(input.tripId);
      if (!trip) {
        return makeResult(
          {
            draft: null,
          },
          [
            {
              code: "TRIP_NOT_FOUND",
              message: `Trip ${input.tripId} was not found for draft creation.`,
              severity: "error",
              entityType: "trip",
              entityId: input.tripId,
            },
          ],
          input.createdAt,
        );
      }

      const threads = await deps.messageRepository.listThreads();
      const thread =
        threads.find((candidate) => candidate.tripId === trip.id) ??
        {
          id: stableId(["thread", trip.id]),
          tripId: trip.id,
          guestId: trip.guestId,
          channel: "turo" as const,
          status: "drafting" as MessageState,
          lastMessageAt: input.createdAt,
          ownerId: input.requestedBy,
          createdAt: input.createdAt,
          updatedAt: input.createdAt,
        };

      if (!threads.some((candidate) => candidate.id === thread.id)) {
        await deps.messageRepository.saveThreads([thread]);
      }

      const draft: MessageDraft = {
        id: stableId(["draft", trip.id, input.templateKey, input.createdAt]),
        threadId: thread.id,
        tripId: trip.id,
        direction: "outbound",
        channel: "turo",
        body: `Draft for ${input.templateKey} on trip ${trip.externalTripId}.`,
        templateKey: input.templateKey,
        approvalStatus: "pending" as ApprovalStatus,
        state: "awaiting_approval",
        requestedBy: input.requestedBy,
        createdAt: input.createdAt,
        updatedAt: input.createdAt,
      };

      await deps.messageRepository.saveDrafts([draft]);

      return makeResult(
        {
          draft,
        },
        [],
        input.createdAt,
      );
    },
  };
}

export function createRequestApprovalUseCase(deps: {
  messageRepository: MessageRepository;
  notifier: OpsNotifier;
}): RequestApprovalUseCase {
  return {
    async execute(input) {
      const draft = (await deps.messageRepository.listDrafts()).find(
        (candidate) => candidate.id === input.draftId,
      );

      if (!draft) {
        return makeResult(
          {
            approvalRequest: null,
          },
          [
            {
              code: "DRAFT_NOT_FOUND",
              message: `Draft ${input.draftId} was not found for approval request.`,
              severity: "error",
              entityType: "message_draft",
              entityId: input.draftId,
            },
          ],
          input.requestedAt,
        );
      }

      const approvalRequest: ApprovalRequest = {
        id: stableId(["approval", draft.id]),
        draftId: draft.id,
        tripId: input.tripId,
        status: "pending",
        requestedBy: input.requestedBy,
        reviewedBy: null,
        requestedAt: input.requestedAt,
        reviewedAt: null,
        notes: null,
      };

      await deps.messageRepository.saveApprovalRequests([approvalRequest]);
      await deps.notifier.notifyApprovalRequested({
        approvalRequestId: approvalRequest.id,
        draftId: approvalRequest.draftId,
        tripId: approvalRequest.tripId,
      });

      return makeResult(
        {
          approvalRequest,
        },
        [],
        input.requestedAt,
      );
    },
  };
}

export function createDetectLateReturnsUseCase(deps: {
  tripRepository: TripRepository;
  incidentRepository: IncidentRepository;
  notifier: OpsNotifier;
  vehicles: Vehicle[];
}): DetectLateReturnsUseCase {
  return {
    async execute(input) {
      const [trips, incidents] = await Promise.all([
        deps.tripRepository.listTrips(),
        deps.incidentRepository.listIncidents(),
      ]);
      const result = computeLateReturnIncidents({
        asOf: input.asOf,
        openedBy: input.openedBy,
        trips,
        incidents,
        vehicles: deps.vehicles,
      });

      if (result.data.incidentsCreated.length > 0) {
        await deps.incidentRepository.saveIncidents(result.data.incidentsCreated);
        await Promise.all(
          result.data.incidentsCreated.map((incident) =>
            deps.notifier.notifyIncidentDetected({
              incidentId: incident.id,
              tripId: incident.tripId,
              type: incident.type,
            }),
          ),
        );
      }

      return result;
    },
  };
}

export function createBuildDailyDigestUseCase(deps: {
  getTodayOpsSnapshot: GetTodayOpsSnapshotUseCase;
  notifier: OpsNotifier;
}): BuildDailyDigestUseCase {
  return {
    async execute(input) {
      const snapshotResult = await deps.getTodayOpsSnapshot.execute({
        today: input.today,
        generatedAt: input.generatedAt,
      });
      const summary = buildDigestText(snapshotResult.data);
      const notification = await deps.notifier.publishDigest({
        channel: input.channel,
        summary,
      });

      return makeResult(
        {
          snapshot: snapshotResult.data,
          summary,
          notificationAccepted: notification.accepted,
        },
        snapshotResult.issues,
        input.generatedAt,
      );
    },
  };
}

export interface SharedFixtureContext {
  vehicles: Vehicle[];
  guests: Array<{ id: string; fullName: string }>;
  tripRepository: TripRepository;
  taskRepository: TaskRepository;
  incidentRepository: IncidentRepository;
  messageRepository: MessageRepository;
  jobRunRepository: JobRunRepository;
  tripImportSource: TripImportSource;
  notifier: OpsNotifier;
  browserAssistPort: BrowserAssistPort;
}

export function createInMemoryTripRepository(seed: {
  trips: Trip[];
  tripEvents: TripEvent[];
}): TripRepository {
  const state = {
    trips: cloneValue(seed.trips),
    tripEvents: cloneValue(seed.tripEvents),
  };

  return {
    async listTrips() {
      return cloneValue(state.trips);
    },
    async getTripById(tripId) {
      return cloneValue(state.trips.find((trip) => trip.id === tripId) ?? null);
    },
    async saveTrips(trips) {
      for (const trip of trips) {
        const index = state.trips.findIndex((candidate) => candidate.id === trip.id);
        if (index >= 0) {
          state.trips[index] = cloneValue(trip);
        } else {
          state.trips.push(cloneValue(trip));
        }
      }

      return cloneValue(trips);
    },
    async listTripEvents() {
      return cloneValue(state.tripEvents);
    },
    async saveTripEvents(events) {
      state.tripEvents.push(...cloneValue(events));
      return cloneValue(events);
    },
  };
}

export function createInMemoryTaskRepository(seed: { tasks: Task[] }): TaskRepository {
  const state = {
    tasks: cloneValue(seed.tasks),
  };

  return {
    async listTasks() {
      return cloneValue(state.tasks);
    },
    async saveTasks(tasks) {
      for (const task of tasks) {
        const index = state.tasks.findIndex((candidate) => candidate.id === task.id);
        if (index >= 0) {
          state.tasks[index] = cloneValue(task);
        } else {
          state.tasks.push(cloneValue(task));
        }
      }

      return cloneValue(tasks);
    },
  };
}

export function createInMemoryIncidentRepository(seed: {
  incidents: Incident[];
}): IncidentRepository {
  const state = {
    incidents: cloneValue(seed.incidents),
  };

  return {
    async listIncidents() {
      return cloneValue(state.incidents);
    },
    async saveIncidents(incidents) {
      for (const incident of incidents) {
        const index = state.incidents.findIndex(
          (candidate) => candidate.id === incident.id,
        );
        if (index >= 0) {
          state.incidents[index] = cloneValue(incident);
        } else {
          state.incidents.push(cloneValue(incident));
        }
      }

      return cloneValue(incidents);
    },
  };
}

export function createInMemoryMessageRepository(seed: {
  threads: MessageThread[];
  drafts: MessageDraft[];
  approvalRequests: ApprovalRequest[];
}): MessageRepository {
  const state = {
    threads: cloneValue(seed.threads),
    drafts: cloneValue(seed.drafts),
    approvalRequests: cloneValue(seed.approvalRequests),
  };

  return {
    async listThreads() {
      return cloneValue(state.threads);
    },
    async saveThreads(threads) {
      for (const thread of threads) {
        const index = state.threads.findIndex((candidate) => candidate.id === thread.id);
        if (index >= 0) {
          state.threads[index] = cloneValue(thread);
        } else {
          state.threads.push(cloneValue(thread));
        }
      }

      return cloneValue(threads);
    },
    async listDrafts() {
      return cloneValue(state.drafts);
    },
    async saveDrafts(drafts) {
      for (const draft of drafts) {
        const index = state.drafts.findIndex((candidate) => candidate.id === draft.id);
        if (index >= 0) {
          state.drafts[index] = cloneValue(draft);
        } else {
          state.drafts.push(cloneValue(draft));
        }
      }

      return cloneValue(drafts);
    },
    async listApprovalRequests() {
      return cloneValue(state.approvalRequests);
    },
    async saveApprovalRequests(approvalRequests) {
      for (const approvalRequest of approvalRequests) {
        const index = state.approvalRequests.findIndex(
          (candidate) => candidate.id === approvalRequest.id,
        );
        if (index >= 0) {
          state.approvalRequests[index] = cloneValue(approvalRequest);
        } else {
          state.approvalRequests.push(cloneValue(approvalRequest));
        }
      }

      return cloneValue(approvalRequests);
    },
  };
}

export function createInMemoryJobRunRepository(seed: {
  jobRuns: JobRun[];
}): JobRunRepository {
  const state = {
    jobRuns: cloneValue(seed.jobRuns),
  };

  return {
    async listJobRuns() {
      return cloneValue(state.jobRuns);
    },
    async saveJobRun(jobRun) {
      state.jobRuns.push(cloneValue(jobRun));
      return cloneValue(jobRun);
    },
  };
}
