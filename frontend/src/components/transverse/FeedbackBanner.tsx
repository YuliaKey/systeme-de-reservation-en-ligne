import React from "react";
import "./FeedbackBanner.css";

type BannerType = "success" | "error" | "warning" | "info";

interface FeedbackBannerProps {
  type: BannerType;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  type,
  message,
  onClose,
  autoClose = true,
}) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, onClose]);

  if (!visible) return null;

  return (
    <div className={`feedback-banner feedback-banner--${type}`}>
      <p className="feedback-banner__message">{message}</p>
      {onClose && (
        <button
          className="feedback-banner__close"
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          aria-label="Fermer"
        >
          ×
        </button>
      )}
    </div>
  );
};
