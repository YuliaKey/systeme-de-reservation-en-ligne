import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loading({
  message = "Chargement...",
  size = "md",
  fullScreen = false,
}: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        className={`animate-spin text-primary-600 ${sizeClasses[size]}`}
      />
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
}

// Skeleton loaders for content
export function ResourceCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function ReservationCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}
