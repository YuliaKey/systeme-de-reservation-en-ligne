import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";
import { reservationsService } from "../services";
import {
  ErrorState,
  EmptyState,
  ReservationCardSkeleton,
} from "../components/ui";
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from "../utils";
import type { Reservation } from "../types";

export function ReservationsPage() {
  const {
    data: reservations,
    isLoading,
    error,
    refetch,
  } = useQuery<Reservation[]>({
    queryKey: ["reservations"],
    queryFn: () => reservationsService.getMy(),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Mes réservations
        </h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <ReservationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Erreur lors du chargement des réservations"
        details="Impossible de récupérer vos réservations"
        onRetry={refetch}
      />
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Mes réservations
        </h1>
        <EmptyState
          icon="reservations"
          title="Aucune réservation active"
          description="Vous n'avez aucune réservation en cours. Explorez nos salles pour faire une réservation."
          action={{
            label: "Voir les salles",
            onClick: () => (window.location.href = "/rooms"),
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mes réservations</h1>
        <Link to="/rooms" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </Link>
      </div>

      <div className="space-y-4">
        {reservations.map((reservation) => (
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
                      {reservation.resource?.name || "Salle"}
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

                {reservation.notes && (
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {reservation.notes}
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-500 md:text-right">
                Créée le {formatDateTime(reservation.createdAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
