import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { roomsService, reservationsService } from "../services";
import { useAsync } from "../hooks/useAsync";
import {
  LoadingSkeleton,
  ErrorState,
  FeedbackBanner,
} from "../components/transverse";
import { BookingForm } from "../components/metier";
import { Room, BookerIdentity } from "../types/index";
import "./BookingPage.css";

export const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startTime = searchParams.get("start");
  const endTime = searchParams.get("end");

  // Récupérer les détails de la salle
  const {
    data: roomData,
    state: roomState,
    error: roomError,
    retry: retryRoom,
  } = useAsync<Room>(async () => roomsService.getRoom(roomId!), !!roomId);

  const room = roomData as Room;

  const handleSubmit = async (user: BookerIdentity) => {
    if (!roomId || !startTime || !endTime) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const reservation = await reservationsService.createReservation({
        roomId,
        start: startTime,
        end: endTime,
        user,
      });

      // Rediriger vers la confirmation
      navigate(`/reservations/${reservation.id}`);
    } catch (err) {
      const error = err as any;
      setSubmitError(error.message || "Erreur lors de la réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate(`/rooms/${roomId}`);
  };

  if (!startTime || !endTime) {
    return (
      <div className="booking-page">
        <FeedbackBanner
          type="error"
          message="Paramètres invalides. Veuillez sélectionner un créneau."
          autoClose={false}
        />
        <button className="btn btn--secondary" onClick={() => navigate("/")}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (roomState === "loading") {
    return (
      <div className="booking-page">
        <button className="btn btn--secondary back-btn" onClick={goBack}>
          ← Retour
        </button>
        <LoadingSkeleton count={1} height="300px" />
      </div>
    );
  }

  if (roomState === "error" && roomError) {
    return (
      <div className="booking-page">
        <button className="btn btn--secondary back-btn" onClick={goBack}>
          ← Retour
        </button>
        <ErrorState error={roomError} onRetry={retryRoom} />
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="booking-page">
      <button className="btn btn--secondary back-btn" onClick={goBack}>
        ← Retour
      </button>

      {submitError && (
        <FeedbackBanner
          type="error"
          message={submitError}
          onClose={() => setSubmitError(null)}
          autoClose={false}
        />
      )}

      <BookingForm
        roomName={room.name}
        startTime={startTime}
        endTime={endTime}
        pricePerHour={room.pricePerHour}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
};
