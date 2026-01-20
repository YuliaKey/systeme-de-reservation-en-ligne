import React from "react";
import { UiError } from "../../types/index";
import "./ErrorState.css";

interface ErrorStateProps {
  error: UiError;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const isRetryable = error.retryable !== false;

  return (
    <div className="error-state">
      <div className="error-state__icon">⚠️</div>
      <h2 className="error-state__title">
        {error.type === "business"
          ? "Action impossible"
          : "Une erreur est survenue"}
      </h2>
      <p className="error-state__message">{error.message}</p>
      {error.code && <p className="error-state__code">Erreur: {error.code}</p>}
      {isRetryable && onRetry && (
        <button className="error-state__retry-btn" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
};
