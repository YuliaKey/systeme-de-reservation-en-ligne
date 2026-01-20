import React from "react";
import "./EmptyState.css";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = "📭",
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__message">{message}</p>
      {action && (
        <button className="empty-state__action-btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};
