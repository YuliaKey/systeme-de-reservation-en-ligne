import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { reservationsService } from "../services";
import { Loading, ErrorState } from "../components/ui";
import {
  formatDateTime,
  getStatusBadgeClass,
  getStatusLabel,
  calculateDuration,
  formatDuration,
} from "../utils";
import type { Reservation } from "../types";

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    data: reservation,
    isLoading,
    error,
    refetch,
  } = useQuery<Reservation>({
    queryKey: ["reservation", id],
    queryFn: () => reservationsService.getById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => reservationsService.cancel(id!),
    onSuccess: () => {
      toast.success("Réservation annulée avec succès");
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      navigate("/reservations");
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation de la réservation");
    },
  });

  if (isLoading) {
    return <Loading message="Chargement de la réservation..." />;
  }

  if (error || !reservation) {
    return (
      <ErrorState
        message="Réservation introuvable"
        details="La réservation demandée n'existe pas ou n'est plus disponible"
        onRetry={refetch}
      />
    );
  }

  const duration = calculateDuration(
    reservation.startTime,
    reservation.endTime,
  );

  // Calculer les heures restantes avant le début
  const startDateTime = new Date(reservation.startTime);
  const now = new Date();
  const hoursUntilStart =
    (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Peut modifier si status est active ou modified (pour les anciennes réservations) ET qu'il reste au moins 24h
  const canModify =
    (reservation.status === "active" || reservation.status === "modified") &&
    hoursUntilStart >= 24;

  // Peut annuler si status n'est pas cancelled ou passed
  const canCancel =
    reservation.status !== "cancelled" && reservation.status !== "passed";

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/reservations")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux réservations
      </button>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Détails de la réservation
            </h1>
            <span
              className={`badge ${getStatusBadgeClass(reservation.status)}`}
            >
              {getStatusLabel(reservation.status)}
            </span>
          </div>
        </div>

        {/* Resource info */}
        {reservation.resource && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Salle</div>
                <div className="font-semibold text-gray-900">
                  {reservation.resource.name}
                </div>
                {reservation.resource.location && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {reservation.resource.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Time details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">
                Date et heure de début
              </div>
              <div className="font-medium text-gray-900">
                {formatDateTime(reservation.startTime)}
              </div>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Date et heure de fin</div>
              <div className="font-medium text-gray-900">
                {formatDateTime(reservation.endTime)}
              </div>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Durée</div>
              <div className="font-medium text-gray-900">
                {formatDuration(duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {reservation.notes && (
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="text-sm text-gray-500 mb-2">Notes</div>
            <p className="text-gray-700">{reservation.notes}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
          <div>Créée le {formatDateTime(reservation.createdAt)}</div>
          {reservation.updatedAt !== reservation.createdAt && (
            <div>Modifiée le {formatDateTime(reservation.updatedAt)}</div>
          )}
        </div>

        {/* Actions */}
        {(canModify || canCancel) && (
          <div className="border-t border-gray-200 pt-6 mt-6 flex gap-3">
            {canModify && (
              <button
                onClick={() => navigate(`/reservations/${id}/edit`)}
                className="btn btn-secondary flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="btn btn-danger flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Annuler
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer l'annulation
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler cette réservation ? Cette action
              est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="btn btn-secondary flex-1"
                disabled={cancelMutation.isPending}
              >
                Retour
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                className="btn btn-danger flex-1"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Annulation..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
