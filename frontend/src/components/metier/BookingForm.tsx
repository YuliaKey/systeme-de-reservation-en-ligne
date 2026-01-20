import React, { useState } from "react";
import { BookerIdentity } from "../../types/index";
import "./BookingForm.css";

interface BookingFormProps {
  roomName: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  onSubmit: (user: BookerIdentity) => void;
  isLoading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  roomName,
  startTime,
  endTime,
  pricePerHour,
  onSubmit,
  isLoading = false,
}) => {
  const [user, setUser] = useState<BookerIdentity>({
    email: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!user.email) {
      newErrors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = "Email invalide";
    }

    if (!user.fullName || user.fullName.trim().length === 0) {
      newErrors.fullName = "Nom complet requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(user);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const durationHours =
    (new Date(endTime).getTime() - new Date(startTime).getTime()) /
    (1000 * 60 * 60);
  const totalPrice = (durationHours * pricePerHour).toFixed(2);

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Finaliser votre réservation</h2>

      <div className="booking-summary">
        <div className="summary-item">
          <span className="summary-label">Salle</span>
          <span className="summary-value">{roomName}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Date</span>
          <span className="summary-value">{formatDate(startTime)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Horaire</span>
          <span className="summary-value">
            {formatTime(startTime)} - {formatTime(endTime)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Durée</span>
          <span className="summary-value">{durationHours}h</span>
        </div>
        <div className="summary-item summary-item--price">
          <span className="summary-label">Prix total</span>
          <span className="summary-value summary-value--price">
            {totalPrice}€
          </span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="fullName" className="form-label">
          Nom complet *
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={user.fullName}
          onChange={handleChange}
          disabled={isLoading}
          className={
            errors.fullName ? "form-input form-input--error" : "form-input"
          }
        />
        {errors.fullName && (
          <span className="form-error">{errors.fullName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          disabled={isLoading}
          className={
            errors.email ? "form-input form-input--error" : "form-input"
          }
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="btn btn--primary">
          {isLoading ? "Réservation en cours..." : "Confirmer la réservation"}
        </button>
      </div>
    </form>
  );
};
