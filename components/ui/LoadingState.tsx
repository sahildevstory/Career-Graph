import { Loader2 } from "lucide-react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded ${className}`}
    />
  );
}

interface LoadingStateProps {
  title?: string;
  description?: string;
  isInline?: boolean;
}

export default function LoadingState({
  title = "Loading",
  description = "Please wait...",
  isInline = false,
}: LoadingStateProps) {
  if (isInline) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-slate-400" size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-96 flex flex-col items-center justify-center py-12">
      <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-100 p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-4 w-full mb-3" />
      <Skeleton className="h-4 w-full mb-3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
