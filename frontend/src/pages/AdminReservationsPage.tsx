import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Filter, User, Edit2, XCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminService } from "../services";
import { Loading, ErrorState, EmptyState } from "../components/ui";
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from "../utils";
import type { ReservationStatus } from "../types";

export function AdminReservationsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | "all">(
    "all",
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "reservations", filterStatus],
    queryFn: () =>
      adminService.getAllReservations({
        status: filterStatus === "all" ? undefined : filterStatus,
        limit: 100,
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminService.cancelReservation(id),
    onSuccess: () => {
      toast.success("Réservation annulée avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin", "reservations"] });
      setCancellingId(null);
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation de la réservation");
      setCancellingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteReservation(id),
    onSuccess: () => {
      toast.success("Réservation supprimée définitivement");
      queryClient.invalidateQueries({ queryKey: ["admin", "reservations"] });
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la réservation");
      setDeletingId(null);
    },
  });

  if (isLoading) {
    return <Loading message="Chargement des réservations..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Erreur lors du chargement des réservations"
        details="Impossible de récupérer la liste des réservations"
        onRetry={refetch}
      />
    );
  }

  const reservations = data?.reservations || [];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des réservations
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {data?.total || 0} réservation(s) au total
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as ReservationStatus | "all")
            }
            className="input"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="cancelled">Annulées</option>
            <option value="passed">Passées</option>
          </select>
        </div>
      </div>

      {reservations.length === 0 ? (
        <EmptyState
          icon="reservations"
          title="Aucune réservation"
          description={
            filterStatus === "all"
              ? "Il n'y a aucune réservation sur la plateforme"
              : `Aucune réservation avec le statut "${getStatusLabel(filterStatus)}"`
          }
        />
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.resource?.name || "Salle"}
                    </h3>
                    <span
                      className={`badge ${getStatusBadgeClass(reservation.status)}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Utilisateur:</span>
                      <span className="ml-1">
                        {reservation.user?.fullName ||
                          reservation.user?.email ||
                          reservation.userId}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Du {formatDateTime(reservation.startTime)} au{" "}
                      {formatDateTime(reservation.endTime)}
                    </div>
                  </div>

                  {reservation.notes && (
                    <p className="text-sm text-gray-500 mt-3 italic">
                      Note: {reservation.notes}
                    </p>
                  )}

                  <div className="text-xs text-gray-400 mt-2">
                    ID: {reservation.id}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Link
                    to={`/reservations/${reservation.id}/edit`}
                    className="btn btn-sm btn-secondary"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Modifier
                  </Link>

                  {reservation.status === "active" && (
                    <button
                      onClick={() => setCancellingId(reservation.id)}
                      className="btn btn-sm btn-secondary"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Annuler
                    </button>
                  )}

                  <button
                    onClick={() => setDeletingId(reservation.id)}
                    className="btn btn-sm btn-danger"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Annuler la réservation
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler cette réservation ? L'utilisateur
              recevra un email de notification.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancellingId(null)}
                className="btn btn-secondary flex-1"
                disabled={cancelMutation.isPending}
              >
                Non, garder
              </button>
              <button
                onClick={() => cancelMutation.mutate(cancellingId)}
                className="btn btn-danger flex-1"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Annulation..." : "Oui, annuler"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Supprimer définitivement
            </h3>
            <p className="text-gray-600 mb-6">
              <strong>Attention !</strong> Cette action est irréversible. La
              réservation sera supprimée définitivement de la base de données.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="btn btn-secondary flex-1"
                disabled={deleteMutation.isPending}
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                className="btn btn-danger flex-1"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? "Suppression..."
                  : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
