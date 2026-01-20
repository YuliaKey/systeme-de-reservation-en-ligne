import React from "react";
import { Room } from "../../types/index";
import "./RoomCard.css";

interface RoomCardProps {
  room: Room;
  onSelect: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect }) => {
  return (
    <div className="room-card">
      {room.images && room.images.length > 0 && (
        <div className="room-card__image">
          <img src={room.images[0]} alt={room.name} />
        </div>
      )}
      <div className="room-card__content">
        <h3 className="room-card__name">{room.name}</h3>
        <p className="room-card__location">📍 {room.location}</p>
        <p className="room-card__capacity">
          👥 Capacité: {room.capacity} personnes
        </p>
        <p className="room-card__price">💰 {room.pricePerHour}€ / heure</p>
        {room.amenities && room.amenities.length > 0 && (
          <div className="room-card__amenities">
            <span className="amenities-label">Équipements:</span>
            <ul className="amenities-list">
              {room.amenities.map((amenity) => (
                <li key={amenity} className="amenity-tag">
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        )}
        {room.description && (
          <p className="room-card__description">{room.description}</p>
        )}
        <button
          className="btn btn--primary room-card__action-btn"
          onClick={() => onSelect(room.id)}
        >
          Voir les disponibilités
        </button>
      </div>
    </div>
  );
};
