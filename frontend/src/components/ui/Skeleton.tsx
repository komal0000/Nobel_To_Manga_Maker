'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function PanelSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-800 rounded">
      <div className="flex flex-col items-center gap-3">
        <div className="skeleton w-16 h-16 rounded-full" />
        <div className="skeleton w-24 h-3 rounded" />
        <div className="skeleton w-16 h-3 rounded" />
      </div>
    </div>
  );
}
