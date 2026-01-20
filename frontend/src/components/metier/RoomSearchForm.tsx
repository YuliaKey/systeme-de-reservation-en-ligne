import React, { useState } from "react";
import "./RoomSearchForm.css";

export interface SearchFormData {
  start: string;
  end: string;
  capacity?: number;
  location?: string;
  amenities?: string;
}

interface RoomSearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
}

export const RoomSearchForm: React.FC<RoomSearchFormProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<SearchFormData>({
    start: new Date().toISOString().split("T")[0] + "T09:00",
    end: new Date().toISOString().split("T")[0] + "T10:00",
    capacity: undefined,
    location: "",
    amenities: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.start) {
      newErrors.start = "La date/heure de début est requise";
    }
    if (!formData.end) {
      newErrors.end = "La date/heure de fin est requise";
    }
    if (
      formData.start &&
      formData.end &&
      new Date(formData.start) >= new Date(formData.end)
    ) {
      newErrors.end = "La fin doit être après le début";
    }
    if (formData.capacity && formData.capacity < 1) {
      newErrors.capacity = "La capacité doit être >= 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity" ? (value ? parseInt(value, 10) : undefined) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSearch(formData);
    }
  };

  return (
    <form className="room-search-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Rechercher une salle</h2>

      <div className="form-group">
        <label htmlFor="start" className="form-label">
          Début du créneau
        </label>
        <input
          type="datetime-local"
          id="start"
          name="start"
          value={formData.start}
          onChange={handleChange}
          disabled={isLoading}
          className={
            errors.start ? "form-input form-input--error" : "form-input"
          }
        />
        {errors.start && <span className="form-error">{errors.start}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="end" className="form-label">
          Fin du créneau
        </label>
        <input
          type="datetime-local"
          id="end"
          name="end"
          value={formData.end}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.end ? "form-input form-input--error" : "form-input"}
        />
        {errors.end && <span className="form-error">{errors.end}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="capacity" className="form-label">
          Capacité minimale (personnes)
        </label>
        <input
          type="number"
          id="capacity"
          name="capacity"
          min="1"
          value={formData.capacity ?? ""}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Optionnel"
          className={
            errors.capacity ? "form-input form-input--error" : "form-input"
          }
        />
        {errors.capacity && (
          <span className="form-error">{errors.capacity}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="location" className="form-label">
          Localisation
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Ex: Paris 10"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="amenities" className="form-label">
          Équipements (séparés par des virgules)
        </label>
        <input
          type="text"
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Ex: wifi,ecran,vidéoprojecteur"
          className="form-input"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn--primary form-submit-btn"
      >
        {isLoading ? "Recherche en cours..." : "Rechercher"}
      </button>
    </form>
  );
};
