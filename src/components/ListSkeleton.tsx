type List = "open-apps" | "inputs" | "apps" | "up-next" | "trending";

const COUNTS: Record<List, number> = { "open-apps": 2, inputs: 3, apps: 9, "up-next": 3, trending: 2 };

/** The Home's glass silhouettes, kept out of the tab order while a TV list is pending. */
export function ListSkeleton({ of, label }: { of: List; label: string }) {
  const text = of === "open-apps" || of === "up-next" || of === "trending";
  return (
    <div class={`list-skeleton skeleton-${of}`} role="status" aria-label={label}>
      <div class="skeleton-items" aria-hidden="true">
        {Array.from({ length: COUNTS[of] }, (_, index) => (
          <div class="skeleton-item" key={index}>
            <span class="skeleton-picture" />
            {text && (
              <span class="skeleton-text">
                <span class="skeleton-line" />
                {of !== "open-apps" && <span class="skeleton-line" />}
                {of === "up-next" && <span class="skeleton-line" />}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
