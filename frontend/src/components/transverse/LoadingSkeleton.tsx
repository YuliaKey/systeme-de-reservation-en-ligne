import React from "react";
import "./LoadingSkeleton.css";

interface LoadingSkeletonProps {
  count?: number;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  height = "100px",
}) => {
  return (
    <div className="loading-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="loading-skeleton" style={{ height }} />
      ))}
    </div>
  );
};
