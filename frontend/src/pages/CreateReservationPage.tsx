import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { reservationsService, resourcesService } from "../services";
import { Loading, ErrorState } from "../components/ui";
import type { CreateReservationRequest, TimeRange } from "../types";

const parseTimeToDecimal = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
};

const formatTimeRange = (range: TimeRange): string => {
  // Data comes as strings like "08:00" and "20:00"
  return `${range.start} - ${range.end}`;
};

const isWithinTimeRange = (
  startHour: number,
  endHour: number,
  range: TimeRange,
): boolean => {
  const rangeStart = parseTimeToDecimal(range.start);
  const rangeEnd = parseTimeToDecimal(range.end);
  return startHour >= rangeStart && endHour <= rangeEnd;
};

export function CreateReservationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const resourceId = searchParams.get("resourceId");

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: resource, isLoading: loadingResource } = useQuery({
    queryKey: ["resource", resourceId],
    queryFn: () => resourcesService.getById(resourceId!),
    enabled: !!resourceId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateReservationRequest) =>
      reservationsService.create(data),
    onSuccess: () => {
      toast.success("Réservation créée avec succès !");
      // Invalider les caches pour mettre à jour les listes
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "statistics"] });
      navigate("/reservations");
    },
    onError: (error: any) => {
      console.log("Full error:", error);
      console.log("Error response:", error.response);
      console.log("Error response data:", error.response?.data);

      const errorData = error.response?.data?.error;
      const errorMessage =
        errorData?.message ||
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création de la réservation";

      // Show validation details if available
      if (errorData?.details && Object.keys(errorData.details).length > 0) {
        const detailsStr = Object.entries(errorData.details)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        toast.error(`${errorMessage}\n${detailsStr}`);
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Validation côté client en temps réel
  useEffect(() => {
    if (!resource || !startDate || !startTime || !endDate || !endTime) {
      setValidationError(null);
      return;
    }

    // Debug: log resource availability structure
    console.log("Resource availability:", resource.availability);
    console.log("Time ranges:", resource.availability?.timeRanges);

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    // Vérifier les dates de base
    if (startDateTime >= endDateTime) {
      setValidationError("La date de fin doit être après la date de début");
      return;
    }

    if (startDateTime < new Date()) {
      setValidationError("Impossible de réserver dans le passé");
      return;
    }

    const durationMinutes =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);

    if (resource.availability) {
      const minDuration = resource.availability.minDuration;

      if (minDuration && durationMinutes < minDuration) {
        const hours = Math.floor(minDuration / 60);
        const mins = minDuration % 60;
        setValidationError(
          `La durée minimale est de ${minDuration} minutes (${hours}h${mins > 0 ? mins.toString().padStart(2, "0") : ""})`,
        );
        return;
      }

      const maxDuration = resource.availability.maxDuration;

      if (maxDuration && durationMinutes > maxDuration) {
        const hours = Math.floor(maxDuration / 60);
        const mins = maxDuration % 60;
        setValidationError(
          `La durée maximale est de ${maxDuration} minutes (${hours}h${mins > 0 ? mins.toString().padStart(2, "0") : ""})`,
        );
        return;
      }
    }

    // Vérifier le jour de la semaine
    if (
      resource.availability?.daysOfWeek &&
      resource.availability.daysOfWeek.length > 0
    ) {
      const dayOfWeek = startDateTime.getDay();
      if (!resource.availability.daysOfWeek.includes(dayOfWeek)) {
        const daysNames = [
          "Dimanche",
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
        ];
        const allowedDays = resource.availability.daysOfWeek
          .map((d: number) => daysNames[d])
          .join(", ");
        setValidationError(
          `Cette salle n'est disponible que les jours suivants: ${allowedDays}`,
        );
        return;
      }
    }

    // Vérifier les plages horaires
    if (
      resource.availability?.timeRanges &&
      resource.availability.timeRanges.length > 0
    ) {
      const startHour =
        startDateTime.getHours() + startDateTime.getMinutes() / 60;
      const endHour = endDateTime.getHours() + endDateTime.getMinutes() / 60;

      let withinRange = false;
      for (const range of resource.availability.timeRanges) {
        if (isWithinTimeRange(startHour, endHour, range)) {
          withinRange = true;
          break;
        }
      }

      if (!withinRange) {
        const ranges = resource.availability.timeRanges
          .map(formatTimeRange)
          .join(", ");
        setValidationError(
          `Cette salle n'est disponible que pendant: ${ranges}`,
        );
        return;
      }
    }

    // Vérifier le nombre de personnes
    if (numberOfPeople < 1) {
      setValidationError("Le nombre de personnes doit être au moins 1");
      return;
    }

    if (resource.capacity && numberOfPeople > resource.capacity) {
      setValidationError(
        `Le nombre de personnes ne peut pas dépasser la capacité de ${resource.capacity} personnes`,
      );
      return;
    }

    setValidationError(null);
  }, [startDate, startTime, endDate, endTime, numberOfPeople, resource]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resourceId || !startDate || !startTime || !endDate || !endTime) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    // Vérifier la validation côté client
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${endDate}T${endTime}:00`;

    createMutation.mutate({
      resourceId: resourceId,
      startTime: startDateTime,
      endTime: endDateTime,
      numberOfPeople: numberOfPeople,
      notes: notes || undefined,
    });
  };

  if (!resourceId) {
    return (
      <ErrorState
        message="Salle non spécifiée"
        details="Veuillez sélectionner une salle à réserver"
      />
    );
  }

  if (loadingResource) {
    return <Loading message="Chargement de la salle..." />;
  }

  if (!resource) {
    return (
      <ErrorState
        message="Salle introuvable"
        details="La salle demandée n'existe pas"
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Nouvelle réservation
        </h1>
        <p className="text-gray-600 mb-6">
          Réserver : <strong>{resource.name}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date et heure de début */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de début *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Date et heure de fin */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fin *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Number of People */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de personnes *
            </label>
            <input
              type="number"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
              min={1}
              max={resource.capacity || undefined}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {resource.capacity && (
              <p className="text-xs text-gray-500 mt-1">
                Capacité maximale : {resource.capacity} personnes
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ajoutez des notes ou des détails sur votre réservation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Duration info */}
          {resource.availability && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Règles de réservation
              </p>
              {resource.availability.minDuration && (
                <p className="text-sm text-blue-700">
                  • Durée minimale : {resource.availability.minDuration} minutes
                </p>
              )}
              {resource.availability.maxDuration && (
                <p className="text-sm text-blue-700">
                  • Durée maximale : {resource.availability.maxDuration} minutes
                </p>
              )}
              {resource.availability.daysOfWeek && (
                <p className="text-sm text-blue-700">
                  • Jours disponibles :{" "}
                  {resource.availability.daysOfWeek
                    .map(
                      (d: number) =>
                        ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][d],
                    )
                    .join(", ")}
                </p>
              )}
              {resource.availability.timeRanges &&
                resource.availability.timeRanges.length > 0 && (
                  <p className="text-sm text-blue-700">
                    • Horaires :{" "}
                    {resource.availability.timeRanges
                      .map(formatTimeRange)
                      .join(", ")}
                  </p>
                )}
            </div>
          )}

          {/* Validation error banner */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  Réservation invalide
                </p>
                <p className="text-sm text-red-700 mt-1">{validationError}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary flex-1"
              disabled={createMutation.isPending}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={createMutation.isPending || !!validationError}
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Création...
                </>
              ) : (
                "Confirmer la réservation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
