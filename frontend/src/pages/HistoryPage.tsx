import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Filter } from "lucide-react";
import { useState } from "react";
import { reservationsService } from "../services";
import { Loading, ErrorState, EmptyState } from "../components/ui";
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from "../utils";
import type { Reservation, ReservationStatus } from "../types";

export function HistoryPage() {
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | "all">(
    "all",
  );

  const {
    data: reservations,
    isLoading,
    error,
    refetch,
  } = useQuery<Reservation[]>({
    queryKey: ["reservations", "history"],
    queryFn: () => reservationsService.getHistory(),
  });

  if (isLoading) {
    return <Loading message="Chargement de l'historique..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Erreur lors du chargement de l'historique"
        details="Impossible de récupérer votre historique de réservations"
        onRetry={refetch}
      />
    );
  }

  const filteredReservations =
    reservations?.filter((r) =>
      filterStatus === "all" ? true : r.status === filterStatus,
    ) || [];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Historique</h1>

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

      {filteredReservations.length === 0 ? (
        <EmptyState
          icon="reservations"
          title="Aucune réservation"
          description={
            filterStatus === "all"
              ? "Vous n'avez aucune réservation dans votre historique"
              : `Aucune réservation avec le statut "${getStatusLabel(filterStatus)}"`
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Link
              key={reservation.id}
              to={`/reservations/${reservation.id}`}
              className="card hover:shadow-lg transition-shadow group block"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                        {reservation.resource?.name || "Ressource"}
                      </h3>
                      <span
                        className={`badge ${getStatusBadgeClass(reservation.status)}`}
                      >
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Du {formatDateTime(reservation.startTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Au {formatDateTime(reservation.endTime)}
                    </div>
                    {reservation.resource?.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {reservation.resource.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 md:text-right">
                  Créée le {formatDateTime(reservation.createdAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
