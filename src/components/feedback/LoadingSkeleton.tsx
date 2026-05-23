import { cn } from "@utils/cn";

interface Props {
  className?: string;
  pill?: boolean;
}

export const Skeleton = ({ className, pill }: Props) => (
  <div
    aria-hidden
    className={cn(
      "relative overflow-hidden bg-white/[0.04]",
      pill ? "rounded-full" : "rounded-lg",
      "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/[0.05] after:to-transparent",
      className,
    )}
  />
);

interface CardSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
}

export const CardSkeleton = ({ lines = 3, showAvatar }: CardSkeletonProps) => (
  <div className="surface-card p-6">
    <div className="mb-5 flex items-center gap-3">
      {showAvatar && <Skeleton pill className="h-12 w-12" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="surface-card p-6">
    <div className="mb-5 flex gap-3">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
    <div className="space-y-3.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton pill className="h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  </div>
);
