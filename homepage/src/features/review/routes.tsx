import { lazy, Suspense } from "react";

const ReviewWorkspace = lazy(() => import("../../pages/ReviewWorkspace"));
const ReviewSettings = lazy(() => import("../../pages/ReviewSettings"));

function ReviewRouteFallback({ label }: { label: string }) {
  return (
    <section className="review-page">
      <div className="review-route-fallback">
        <p>{label}</p>
      </div>
    </section>
  );
}

export function ReviewRoute() {
  return (
    <Suspense fallback={<ReviewRouteFallback label="Loading review workspace..." />}>
      <ReviewWorkspace />
    </Suspense>
  );
}

export function ReviewSettingsRoute() {
  return (
    <Suspense fallback={<ReviewRouteFallback label="Loading connection..." />}>
      <ReviewSettings />
    </Suspense>
  );
}
