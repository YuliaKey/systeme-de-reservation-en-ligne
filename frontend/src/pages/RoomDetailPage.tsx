import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roomsService } from "../services";
import { useAsync } from "../hooks/useAsync";
import {
  LoadingSkeleton,
  ErrorState,
  FeedbackBanner,
} from "../components/transverse";
import { AvailabilityPicker } from "../components/metier";
import { Room, AvailabilityResponse } from "../types/index";
import "./RoomDetailPage.css";

export const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [availabilityParams, setAvailabilityParams] = useState<any>(null);

  // Récupérer les détails de la salle
  const {
    data: roomData,
    state: roomState,
    error: roomError,
    retry: retryRoom,
  } = useAsync<Room>(() => roomsService.getRoom(roomId!), !!roomId);

  const room = roomData as Room;

  // Récupérer les disponibilités
  const {
    data: availabilityData,
    state: availabilityState,
    error: availabilityError,
    execute: fetchAvailability,
  } = useAsync<AvailabilityResponse>(async () => {
    if (!availabilityParams || !roomId) {
      return { roomId: "", slots: [] };
    }
    return roomsService.getAvailability({
      roomId,
      ...availabilityParams,
    });
  }, false);

  const availability = availabilityData as AvailabilityResponse;

  // Quand les paramètres changent, recharger les disponibilités
  useEffect(() => {
    if (room && availabilityParams?.start && availabilityParams?.end) {
      fetchAvailability();
    }
  }, [room, availabilityParams?.start, availabilityParams?.end]);

  const handleSelectSlot = (start: string, end: string) => {
    const params = new URLSearchParams({
      start,
      end,
    });
    navigate(`/rooms/${roomId}/book?${params.toString()}`);
  };

  const goBack = () => {
    navigate("/");
  };

  if (roomState === "loading") {
    return (
      <div className="room-detail-page">
        <button className="btn btn--secondary back-btn" onClick={goBack}>
          ← Retour
        </button>
        <LoadingSkeleton count={2} height="300px" />
      </div>
    );
  }

  if (roomState === "error" && roomError) {
    return (
      <div className="room-detail-page">
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
    <div className="room-detail-page">
      <button className="btn btn--secondary back-btn" onClick={goBack}>
        ← Retour
      </button>

      <div className="room-detail">
        {room.images && room.images.length > 0 && (
          <div className="room-detail__image">
            <img src={room.images[0]} alt={room.name} />
          </div>
        )}

        <div className="room-detail__info">
          <h1 className="room-detail__name">{room.name}</h1>
          <p className="room-detail__location">📍 {room.location}</p>

          {room.description && (
            <p className="room-detail__description">{room.description}</p>
          )}

          <div className="room-detail__specs">
            <div className="spec-item">
              <span className="spec-label">Capacité:</span>
              <span className="spec-value">{room.capacity} personnes</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Prix:</span>
              <span className="spec-value">{room.pricePerHour}€ / heure</span>
            </div>
          </div>

          {room.amenities && room.amenities.length > 0 && (
            <div className="room-detail__amenities">
              <h3 className="amenities-title">Équipements</h3>
              <ul className="amenities-list">
                {room.amenities.map((amenity) => (
                  <li key={amenity} className="amenity-item">
                    ✓ {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Section disponibilités */}
      <div className="availability-section">
        <h2 className="availability-title">Sélectionner un créneau</h2>

        <div className="date-range-picker">
          <div className="form-group">
            <label htmlFor="start">Début:</label>
            <input
              type="datetime-local"
              id="start"
              onChange={(e) => {
                const params: any = {
                  ...availabilityParams,
                  start: e.target.value,
                };
                setAvailabilityParams(params);
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="end">Fin:</label>
            <input
              type="datetime-local"
              id="end"
              onChange={(e) => {
                setAvailabilityParams((prev: any) => ({
                  ...prev,
                  end: e.target.value,
                }));
              }}
            />
          </div>
        </div>

        {availabilityState === "loading" && (
          <LoadingSkeleton count={1} height="150px" />
        )}

        {availabilityState === "error" && availabilityError && (
          <ErrorState error={availabilityError} />
        )}

        {availabilityState === "success" && availability && (
          <AvailabilityPicker
            slots={availability.slots}
            onSelect={handleSelectSlot}
          />
        )}

        {availabilityState === "empty" && (
          <FeedbackBanner
            type="warning"
            message="Aucun créneau trouvé pour cette période."
            autoClose={false}
          />
        )}
      </div>
    </div>
  );
};
