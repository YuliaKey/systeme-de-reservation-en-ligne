import React, { useState } from "react";
import { AvailabilitySlot } from "../../types/index";
import "./AvailabilityPicker.css";

interface AvailabilityPickerProps {
  slots: AvailabilitySlot[];
  onSelect: (start: string, end: string) => void;
  isLoading?: boolean;
}

export const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  slots,
  onSelect,
  isLoading = false,
}) => {
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    if (selectedStart === null) {
      setSelectedStart(slot.start);
      setSelectedEnd(slot.end);
    } else if (selectedEnd === slot.start) {
      setSelectedEnd(slot.end);
    } else {
      setSelectedStart(slot.start);
      setSelectedEnd(slot.end);
    }
  };

  const handleConfirm = () => {
    if (selectedStart && selectedEnd) {
      onSelect(selectedStart, selectedEnd);
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

  const isSlotSelected = (slot: AvailabilitySlot) => {
    if (!selectedStart || !selectedEnd) return false;
    const slotStart = new Date(slot.start).getTime();
    const slotEnd = new Date(slot.end).getTime();
    const selStart = new Date(selectedStart).getTime();
    const selEnd = new Date(selectedEnd).getTime();
    return slotStart >= selStart && slotEnd <= selEnd;
  };

  return (
    <div className="availability-picker">
      <div className="slots-grid">
        {slots.map((slot, idx) => (
          <button
            key={idx}
            className={`slot-button ${
              !slot.available
                ? "slot-button--unavailable"
                : isSlotSelected(slot)
                  ? "slot-button--selected"
                  : "slot-button--available"
            }`}
            onClick={() => slot.available && handleSelectSlot(slot)}
            disabled={!slot.available || isLoading}
            title={`${formatDate(slot.start)} ${formatTime(slot.start)} - ${formatTime(slot.end)}`}
          >
            <span className="slot-time">
              {formatTime(slot.start)} - {formatTime(slot.end)}
            </span>
            <span className="slot-status">
              {slot.available ? "✓ Libre" : "✗ Occupé"}
            </span>
          </button>
        ))}
      </div>

      {selectedStart && selectedEnd && (
        <div className="selection-summary">
          <p className="summary-text">
            Sélection : {formatDate(selectedStart)} de{" "}
            {formatTime(selectedStart)} à {formatTime(selectedEnd)}
          </p>
          <button
            className="btn btn--primary"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Confirmation..." : "Continuer vers la réservation"}
          </button>
        </div>
      )}
    </div>
  );
};
