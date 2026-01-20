import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reservationsService, roomsService } from "../services";
import { useAsync } from "../hooks/useAsync";
import {
  LoadingSkeleton,
  ErrorState,
  FeedbackBanner,
} from "../components/transverse";
import { Reservation } from "../types/index";
import "./ReservationConfirmationPage.css";

export const ReservationConfirmationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState<string>("");
  const [feedback, setFeedback] = useState<{
    type: string;
    message: string;
  } | null>(null);

  // Récupérer la réservation
  const {
    data: reservationData,
    state: reservationState,
    error: reservationError,
    retry: retryReservation,
  } = useAsync<Reservation>(
    () => reservationsService.getReservation(reservationId!),
    !!reservationId,
  );

  const reservation = reservationData as Reservation;

  // Récupérer les détails de la salle une fois qu'on a la réservation
  useEffect(() => {
    if (reservation) {
      roomsService
        .getRoom(reservation.roomId)
        .then((room) => setRoomName(room.name))
        .catch(() => setRoomName("Salle"));
    }
  }, [reservation]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goToReservations = () => {
    navigate("/my-reservations");
  };

  const goHome = () => {
    navigate("/");
  };

  if (reservationState === "loading") {
    return (
      <div className="confirmation-page">
        <LoadingSkeleton count={1} height="300px" />
      </div>
    );
  }

  if (reservationState === "error" && reservationError) {
    return (
      <div className="confirmation-page">
        <ErrorState error={reservationError} onRetry={retryReservation} />
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  return (
    <div className="confirmation-page">
      {feedback && (
        <FeedbackBanner
          type={feedback.type as any}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="confirmation-card">
        <div className="confirmation-header">
          <h1 className="confirmation-title">✓ Réservation Confirmée</h1>
          <p className="confirmation-number">Numéro: {reservation.id}</p>
        </div>

        <div className="confirmation-body">
          <div className="confirmation-item">
            <span className="item-label">Salle:</span>
            <span className="item-value">{roomName}</span>
          </div>
          <div className="confirmation-item">
            <span className="item-label">Date:</span>
            <span className="item-value">{formatDate(reservation.start)}</span>
          </div>
          <div className="confirmation-item">
            <span className="item-label">Horaire:</span>
            <span className="item-value">
              {formatTime(reservation.start)} - {formatTime(reservation.end)}
            </span>
          </div>
          <div className="confirmation-item">
            <span className="item-label">Statut:</span>
            <span className="item-value status-confirmed">
              {reservation.status === "CONFIRMED" ? "✓ Confirmée" : "✗ Annulée"}
            </span>
          </div>
          <div className="confirmation-item">
            <span className="item-label">Créée le:</span>
            <span className="item-value">
              {formatDate(reservation.createdAt)}
            </span>
          </div>
        </div>

        <div className="confirmation-message">
          <p>Un email de confirmation a été envoyé à votre adresse email.</p>
          <p>Vous pouvez consulter et gérer vos réservations à tout moment.</p>
        </div>

        <div className="confirmation-actions">
          <button className="btn btn--primary" onClick={goToReservations}>
            Mes réservations
          </button>
          <button className="btn btn--secondary" onClick={goHome}>
            Réserver une autre salle
          </button>
        </div>
      </div>
    </div>
  );
};
