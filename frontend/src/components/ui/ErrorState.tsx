import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  details?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  message = "Une erreur est survenue",
  details,
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
        {details && <p className="text-sm text-gray-600 max-w-md">{details}</p>}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">{content}</div>
  );
}

// Error boundary fallback
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorBoundaryFallback({
  error,
  resetError,
}: ErrorBoundaryFallbackProps) {
  return (
    <ErrorState
      message="L'application a rencontré une erreur"
      details={error.message}
      onRetry={resetError}
      fullScreen
    />
  );
}
