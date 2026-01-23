import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Plus, TrendingUp } from "lucide-react";
import { reservationsService, resourcesService } from "../services";
import { Loading, EmptyState } from "../components/ui";
import {
  formatDateTime,
  getStatusBadgeClass,
  getStatusLabel,
  isDateInFuture,
} from "../utils";
import type { Reservation, Resource } from "../types";

export function DashboardPage() {
  const { data: reservations, isLoading: loadingReservations } = useQuery<
    Reservation[]
  >({
    queryKey: ["reservations"],
    queryFn: () => reservationsService.getMy(),
  });

  // Récupérer toutes les réservations (y compris annulées et terminées) pour le total
  const { data: allReservations } = useQuery<Reservation[]>({
    queryKey: ["reservations", "history"],
    queryFn: () => reservationsService.getHistory(),
  });

  const { data: salles, isLoading: loadingSalles } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => resourcesService.getAll(),
  });

  if (loadingReservations || loadingSalles) {
    return <Loading message="Chargement de votre tableau de bord..." />;
  }

  const upcomingReservations =
    reservations
      ?.filter(
        (r) =>
          (r.status === "active" || r.status === "modified") &&
          isDateInFuture(r.startTime),
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .slice(0, 3) || [];

  const availableSalles = salles || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Bienvenue ! Gérez vos réservations de salles en un coup d'œil.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Réservations actives</p>
              <p className="text-3xl font-bold text-gray-900">
                {reservations?.filter(
                  (r) => r.status === "active" || r.status === "modified",
                ).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Salles disponibles</p>
              <p className="text-3xl font-bold text-gray-900">
                {availableSalles.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total réservations</p>
              <p className="text-3xl font-bold text-gray-900">
                {allReservations?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/rooms"
          className="card hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              Réserver une salle
            </h3>
            <Plus className="h-6 w-6 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
          <p className="text-sm text-gray-600">
            Parcourez les salles disponibles et réservez celle qui correspond à
            vos besoins
          </p>
        </Link>

        <Link
          to="/reservations"
          className="card hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              Mes réservations
            </h3>
            <Calendar className="h-6 w-6 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
          <p className="text-sm text-gray-600">
            Consultez, modifiez ou annulez vos réservations en cours
          </p>
        </Link>
      </div>

      {/* Upcoming Reservations */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Prochaines réservations
          </h2>
          <Link
            to="/reservations"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Voir tout
          </Link>
        </div>

        {upcomingReservations.length === 0 ? (
          <EmptyState
            icon="reservations"
            title="Aucune réservation à venir"
            description="Vous n'avez pas de réservation prévue pour le moment"
            action={{
              label: "Réserver une salle",
              onClick: () => (window.location.href = "/rooms"),
            }}
          />
        ) : (
          <div className="space-y-4">
            {upcomingReservations.map((reservation) => (
              <Link
                key={reservation.id}
                to={`/reservations/${reservation.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {reservation.resource?.name || "Salle"}
                    </h3>
                    <span
                      className={`badge ${getStatusBadgeClass(reservation.status)}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDateTime(reservation.startTime)}
                  </div>
                  {reservation.resource?.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {reservation.resource.location}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
