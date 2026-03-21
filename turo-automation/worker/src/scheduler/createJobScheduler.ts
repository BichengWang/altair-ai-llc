import { logWorkerEvent } from "../lib/logger.js";

export interface ScheduledJob {
  name: string;
  intervalMs: number;
  run: () => Promise<void>;
}

export interface JobScheduler {
  start(): void;
  stop(): void;
}

/**
 * Minimal interval-based job scheduler.
 * Each job runs immediately on start, then repeats at its configured interval.
 * Job failures are logged but do not affect other jobs or the scheduler loop.
 */
export function createJobScheduler(jobs: ScheduledJob[]): JobScheduler {
  const handles: ReturnType<typeof setInterval>[] = [];

  async function safeRun(job: ScheduledJob) {
    try {
      logWorkerEvent("scheduler.job_start", { name: job.name });
      await job.run();
      logWorkerEvent("scheduler.job_done", { name: job.name });
    } catch (error) {
      logWorkerEvent("scheduler.job_error", {
        name: job.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    start() {
      logWorkerEvent("scheduler.start", {
        jobs: jobs.map((j) => ({ name: j.name, intervalMs: j.intervalMs })),
      });

      for (const job of jobs) {
        // Run immediately, then on interval
        void safeRun(job);
        const handle = setInterval(() => void safeRun(job), job.intervalMs);
        handles.push(handle);
      }
    },

    stop() {
      logWorkerEvent("scheduler.stop", { jobCount: handles.length });
      for (const handle of handles) {
        clearInterval(handle);
      }
      handles.length = 0;
    },
  };
}
