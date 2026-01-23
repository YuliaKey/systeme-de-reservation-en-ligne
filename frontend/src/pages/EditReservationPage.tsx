import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { reservationsService, resourcesService } from "../services";
import { Loading, ErrorState } from "../components/ui";
import type {
  UpdateReservationRequest,
  DbTimeRange,
  TimeRange,
} from "../types";

const parseTimeValue = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (value.includes(":")) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours + minutes / 60;
  }
  return parseFloat(value);
};

const isDbTimeRange = (
  range: DbTimeRange | TimeRange,
): range is DbTimeRange => {
  return "start" in range && "end" in range;
};

const formatTimeRange = (range: DbTimeRange | TimeRange): string => {
  const start = isDbTimeRange(range)
    ? parseTimeValue(range.start)
    : parseTimeValue(range.startTime);
  const end = isDbTimeRange(range)
    ? parseTimeValue(range.end)
    : parseTimeValue(range.endTime);

  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return `${formatHour(start)} - ${formatHour(end)}`;
};

const isWithinTimeRange = (
  startHour: number,
  endHour: number,
  range: DbTimeRange | TimeRange,
): boolean => {
  const rangeStart = isDbTimeRange(range)
    ? parseTimeValue(range.start)
    : parseTimeValue(range.startTime);
  const rangeEnd = isDbTimeRange(range)
    ? parseTimeValue(range.end)
    : parseTimeValue(range.endTime);

  return startHour >= rangeStart && endHour <= rangeEnd;
};

const getMinDuration = (
  rules:
    | { minDurationMinutes?: number; maxDurationMinutes?: number }
    | { minDuration?: number; maxDuration?: number },
): number | undefined => {
  if ("minDurationMinutes" in rules) {
    return rules.minDurationMinutes;
  }
  if ("minDuration" in rules) {
    return rules.minDuration;
  }
  return undefined;
};

const getMaxDuration = (
  rules:
    | { minDurationMinutes?: number; maxDurationMinutes?: number }
    | { minDuration?: number; maxDuration?: number },
): number | undefined => {
  if ("maxDurationMinutes" in rules) {
    return rules.maxDurationMinutes;
  }
  if ("maxDuration" in rules) {
    return rules.maxDuration;
  }
  return undefined;
};

export function EditReservationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch reservation data
  const {
    data: reservation,
    isLoading: isLoadingReservation,
    error: reservationError,
  } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => reservationsService.getById(id!),
    enabled: !!id,
  });

  // Fetch resource data
  const {
    data: resource,
    isLoading: isLoadingResource,
    error: resourceError,
  } = useQuery({
    queryKey: ["resource", reservation?.resourceId],
    queryFn: () => resourcesService.getById(reservation!.resourceId),
    enabled: !!reservation?.resourceId,
  });

  // Pré-remplir le formulaire avec les données existantes
  useEffect(() => {
    if (reservation) {
      const start = new Date(reservation.startTime);
      const end = new Date(reservation.endTime);

      // Format date as YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Format time as HH:MM
      const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      };

      setStartDate(formatDate(start));
      setStartTime(formatTime(start));
      setEndDate(formatDate(end));
      setEndTime(formatTime(end));
      setNotes(reservation.notes || "");
    }
  }, [reservation]);

  // Real-time validation
  useEffect(() => {
    if (!resource || !startDate || !startTime || !endDate || !endTime) {
      setValidationError(null);
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    // Check duration
    const durationMinutes =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
    if (durationMinutes <= 0) {
      setValidationError(
        "La date de fin doit être postérieure à la date de début",
      );
      return;
    }

    // Note: On ne valide pas les durées min/max côté client pour l'édition
    // car la réservation existante pourrait avoir été faite sous d'anciennes règles.
    // La validation sera effectuée côté backend lors de la soumission.

    // Check day of week
    if (resource.availability?.daysOfWeek) {
      const dayOfWeek = startDateTime.getDay();
      if (!resource.availability.daysOfWeek.includes(dayOfWeek)) {
        const dayNames = [
          "Dimanche",
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
        ];
        const allowedDays = resource.availability.daysOfWeek
          .map((d) => dayNames[d])
          .join(", ");
        setValidationError(
          `Cette ressource n'est disponible que les jours suivants: ${allowedDays}`,
        );
        return;
      }
    }

    // Check time ranges
    if (resource.availability?.timeRanges) {
      const startHour =
        startDateTime.getHours() + startDateTime.getMinutes() / 60;
      const endHour = endDateTime.getHours() + endDateTime.getMinutes() / 60;

      const isWithinRanges = resource.availability.timeRanges.some((range) =>
        isWithinTimeRange(startHour, endHour, range),
      );

      if (!isWithinRanges) {
        const allowedRanges = resource.availability.timeRanges
          .map((range) => formatTimeRange(range))
          .join(", ");
        setValidationError(
          `Cette ressource n'est disponible que pendant: ${allowedRanges}`,
        );
        return;
      }
    }

    setValidationError(null);
  }, [startDate, startTime, endDate, endTime, resource]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateReservationRequest) =>
      reservationsService.update(id!, data),
    onSuccess: () => {
      toast.success("Réservation modifiée avec succès");
      navigate(`/reservations/${id}`);
    },
    onError: () => {
      toast.error(
        "Une erreur est survenue lors de la modification. Veuillez réessayer.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!resource) {
      toast.error("Les informations de la ressource sont manquantes");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    updateMutation.mutate({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes: notes || undefined,
    });
  };

  if (isLoadingReservation || isLoadingResource) {
    return <Loading fullScreen />;
  }

  if (reservationError || resourceError) {
    return (
      <ErrorState
        message="Impossible de charger les données"
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!reservation || !resource) {
    return (
      <ErrorState
        message="Réservation ou ressource introuvable"
        onRetry={() => navigate("/reservations")}
      />
    );
  }

  // Check if reservation can be edited (must be at least 24h before start time)
  const canEdit = () => {
    if (reservation.status === "cancelled") {
      return false;
    }
    const startDateTime = new Date(reservation.startTime);
    const now = new Date();
    const hoursUntilStart =
      (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilStart >= 24;
  };

  const getCannotEditReason = () => {
    if (reservation.status === "cancelled") {
      return "Cette réservation a été annulée et ne peut plus être modifiée.";
    }
    const startDateTime = new Date(reservation.startTime);
    const now = new Date();
    if (startDateTime < now) {
      return "Cette réservation est passée et ne peut plus être modifiée.";
    }
    return "Les modifications doivent être effectuées au moins 24 heures avant le début de la réservation.";
  };

  if (!canEdit()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-lg font-semibold text-yellow-900">
              Modification impossible
            </h2>
          </div>
          <p className="text-yellow-800 mb-4">{getCannotEditReason()}</p>
          <button
            onClick={() => navigate(`/reservations/${id}`)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Retour aux détails
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/reservations/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux détails
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Modifier la réservation
        </h1>
        <p className="text-gray-600">{resource.name}</p>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 mb-1">
                Impossible de réserver
              </h3>
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resource Info */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">
          Informations sur la ressource
        </h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-600">Nom:</span>{" "}
            <span className="font-medium">{resource.name}</span>
          </p>
          <p>
            <span className="text-gray-600">Localisation:</span>{" "}
            <span className="font-medium">{resource.location}</span>
          </p>
          {resource.capacity && (
            <p>
              <span className="text-gray-600">Capacité:</span>{" "}
              <span className="font-medium">{resource.capacity} personnes</span>
            </p>
          )}
          {resource.availability?.daysOfWeek && (
            <p>
              <span className="text-gray-600">Jours disponibles:</span>{" "}
              <span className="font-medium">
                {resource.availability.daysOfWeek
                  .map(
                    (d) => ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][d],
                  )
                  .join(", ")}
              </span>
            </p>
          )}
          {resource.availability?.timeRanges &&
            resource.availability.timeRanges.length > 0 && (
              <p>
                <span className="text-gray-600">Horaires:</span>{" "}
                <span className="font-medium">
                  {resource.availability.timeRanges
                    .map((range) => formatTimeRange(range))
                    .join(", ")}
                </span>
              </p>
            )}
          {(resource.rules || resource.availabilityRules) && (
            <>
              {getMinDuration(
                resource.rules || resource.availabilityRules || {},
              ) && (
                <p>
                  <span className="text-gray-600">Durée minimale:</span>{" "}
                  <span className="font-medium">
                    {getMinDuration(
                      resource.rules || resource.availabilityRules || {},
                    )}{" "}
                    minutes
                  </span>
                </p>
              )}
              {getMaxDuration(
                resource.rules || resource.availabilityRules || {},
              ) && (
                <p>
                  <span className="text-gray-600">Durée maximale:</span>{" "}
                  <span className="font-medium">
                    {getMaxDuration(
                      resource.rules || resource.availabilityRules || {},
                    )}{" "}
                    minutes
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="space-y-6">
          {/* Start Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heure de début
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heure de fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ajoutez des notes sur votre réservation..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={updateMutation.isPending || !!validationError}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {updateMutation.isPending
                ? "Modification en cours..."
                : "Modifier la réservation"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/reservations/${id}`)}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
