import React from "react";
import { Reservation } from "../../types/index";
import "./ReservationCard.css";

interface ReservationCardProps {
  reservation: Reservation;
  roomName?: string;
  onView?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  roomName,
  onView,
  onCancel,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const startDate = new Date(reservation.start);
  const now = new Date();
  const canCancel = startDate > now && reservation.status === "CONFIRMED";

  return (
    <div
      className={`reservation-card reservation-card--${reservation.status.toLowerCase()}`}
    >
      <div className="reservation-card__header">
        <h3 className="reservation-card__room">
          {roomName || reservation.roomId}
        </h3>
        <span
          className={`status-badge status-badge--${reservation.status.toLowerCase()}`}
        >
          {reservation.status === "CONFIRMED" ? "✓ Confirmée" : "✗ Annulée"}
        </span>
      </div>

      <div className="reservation-card__body">
        <p className="reservation-item">
          <span className="item-label">Numéro:</span>
          <span className="item-value">{reservation.id}</span>
        </p>
        <p className="reservation-item">
          <span className="item-label">Date:</span>
          <span className="item-value">{formatDate(reservation.start)}</span>
        </p>
        <p className="reservation-item">
          <span className="item-label">Horaire:</span>
          <span className="item-value">
            {formatTime(reservation.start)} - {formatTime(reservation.end)}
          </span>
        </p>
        <p className="reservation-item">
          <span className="item-label">Créée le:</span>
          <span className="item-value">
            {formatDate(reservation.createdAt)}
          </span>
        </p>
      </div>

      <div className="reservation-card__actions">
        {onView && (
          <button
            className="btn btn--secondary"
            onClick={() => onView(reservation.id)}
          >
            Voir le détail
          </button>
        )}
        {onCancel && canCancel && (
          <button
            className="btn btn--danger"
            onClick={() => onCancel(reservation.id)}
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
};
