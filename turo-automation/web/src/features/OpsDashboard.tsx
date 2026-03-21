import type { TodayOpsSnapshot, UseCaseIssue } from "@turo-automation/shared";
import { useState } from "react";
import { formatCompactDateTime, formatLabel } from "../lib/format";
import { actOnApproval } from "../lib/approvalActions";
import { SectionCard } from "../ui/SectionCard";

export function OpsDashboard(props: {
  snapshot: TodayOpsSnapshot;
  issues: UseCaseIssue[];
  onApprovalActioned?: () => void;
}) {
  const { snapshot, issues, onApprovalActioned } = props;
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());

  async function handleApproval(
    approvalRequestId: string,
    decision: "approved" | "rejected"
  ) {
    setActioningId(approvalRequestId);
    try {
      await actOnApproval(approvalRequestId, decision, "web.reviewer");
      setActionedIds((prev) => new Set([...prev, approvalRequestId]));
      onApprovalActioned?.();
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="dashboard-grid">
      <section className="metrics-strip">
        <article>
          <span>Pickups</span>
          <strong>{snapshot.summary.pickupCount}</strong>
        </article>
        <article>
          <span>Returns</span>
          <strong>{snapshot.summary.returnCount}</strong>
        </article>
        <article>
          <span>Issues</span>
          <strong>{snapshot.summary.activeIssueCount}</strong>
        </article>
        <article>
          <span>Approvals</span>
          <strong>{snapshot.summary.pendingApprovalCount}</strong>
        </article>
      </section>

      <SectionCard
        title="Today’s pickups"
        subtitle="Trip-level read model from the shared snapshot contract."
      >
        {snapshot.pickups.map((trip) => (
          <div className="list-row" key={trip.tripId}>
            <div>
              <strong>{trip.vehicleLabel}</strong>
              <p>
                {trip.guestLabel} · {trip.externalTripId}
              </p>
            </div>
            <div className="list-meta">
              <span>{formatCompactDateTime(trip.pickupAt)}</span>
              <span className="pill">{trip.needsDelivery ? "delivery" : "onsite"}</span>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Returns and issues"
        subtitle="Return-side exceptions stay visible before live integrations land."
      >
        {snapshot.returns.map((trip) => (
          <div className="list-row" key={trip.tripId}>
            <div>
              <strong>{trip.vehicleLabel}</strong>
              <p>
                {trip.guestLabel} · {formatLabel(trip.tripStatus)}
              </p>
            </div>
            <div className="list-meta">
              <span>{formatCompactDateTime(trip.returnAt)}</span>
            </div>
          </div>
        ))}

        {snapshot.activeIssues.map((incident) => (
          <div className="list-row incident-row" key={incident.incidentId}>
            <div>
              <strong>{incident.summary}</strong>
              <p>{formatLabel(incident.severity)}</p>
            </div>
            <div className="list-meta">
              <span>{formatLabel(incident.status)}</span>
              <span>{formatCompactDateTime(incident.openedAt)}</span>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Approval queue"
        subtitle="Guest-facing messaging stays draft-first and approval gated."
      >
        {snapshot.pendingApprovals.map((approval) => {
          const isActioning = actioningId === approval.approvalRequestId;
          const isActioned = actionedIds.has(approval.approvalRequestId);
          return (
            <div className="list-row" key={approval.approvalRequestId}>
              <div>
                <strong>{approval.tripId}</strong>
                <p>Requested by {approval.requestedBy}</p>
              </div>
              <div className="list-meta">
                <span className="pill">{formatLabel(approval.status)}</span>
                <span>{formatCompactDateTime(approval.requestedAt)}</span>
                {!isActioned && approval.status === "pending" && (
                  <span className="approval-actions">
                    <button
                      className="btn-approve"
                      disabled={isActioning}
                      onClick={() =>
                        handleApproval(approval.approvalRequestId, "approved")
                      }
                    >
                      {isActioning ? "..." : "Approve"}
                    </button>
                    <button
                      className="btn-reject"
                      disabled={isActioning}
                      onClick={() =>
                        handleApproval(approval.approvalRequestId, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </span>
                )}
                {isActioned && (
                  <span className="pill pill-completed">actioned</span>
                )}
              </div>
            </div>
          );
        })}
      </SectionCard>

      <SectionCard
        title="Overdue tasks"
        subtitle="Tasks are rendered directly from the typed snapshot output."
      >
        {snapshot.overdueTasks.map((task) => (
          <div className="list-row" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <p>
                {formatLabel(task.type)} · {formatLabel(task.priority)}
              </p>
            </div>
            <div className="list-meta">
              <span>{task.assignedTo ?? "unassigned"}</span>
              <span>{task.dueAt ? formatCompactDateTime(task.dueAt) : "no due date"}</span>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Worker health"
        subtitle="Job contracts exist before schedulers or external adapters are wired in."
      >
        {snapshot.workerHealth.map((job) => (
          <div className="list-row" key={job.jobName}>
            <div>
              <strong>{formatLabel(job.jobName)}</strong>
              <p>{job.summary}</p>
            </div>
            <div className="list-meta">
              <span className={`pill pill-${job.status}`}>{formatLabel(job.status)}</span>
              <span>{job.finishedAt ? formatCompactDateTime(job.finishedAt) : "running"}</span>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Contract issues"
        subtitle="Typed issues replace free-form runtime strings in normal flow."
      >
        {issues.map((issue) => (
          <div className="list-row" key={`${issue.code}-${issue.entityId ?? "global"}`}>
            <div>
              <strong>{issue.code}</strong>
              <p>{issue.message}</p>
            </div>
            <div className="list-meta">
              <span className={`pill pill-${issue.severity}`}>{issue.severity}</span>
              <span>{issue.entityType ?? "system"}</span>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
