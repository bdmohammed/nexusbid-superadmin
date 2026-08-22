interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl ${className}`}
    />
  );
}

interface SkeletonGridProps {
  count?: number;
  cols?: string;
  heightClass?: string;
}

export function SkeletonGrid({
  count = 4,
  cols = "grid md:grid-cols-2 lg:grid-cols-4 gap-6",
  heightClass = "h-44",
}: SkeletonGridProps) {
  return (
    <div className={cols}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/security/noToArraySpread: standard React helper key mapping
        <Skeleton key={i} className={heightClass} />
      ))}
    </div>
  );
}

export function SkeletonList({
  count = 5,
  heightClass = "h-16",
}: {
  count?: number;
  heightClass?: string;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/security/noToArraySpread: standard React helper key mapping
        <Skeleton key={i} className={heightClass} />
      ))}
    </div>
  );
}

export default function QuerySkeleton() {
  return <Skeleton className="h-32 w-full" />;
}
