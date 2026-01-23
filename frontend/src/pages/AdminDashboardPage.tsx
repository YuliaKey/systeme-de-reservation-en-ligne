import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Package,
  Calendar,
  Users,
  Mail,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminService } from "../services";
import { Loading, ErrorState } from "../components/ui";
import type { AdminStatistics } from "../types";

export function AdminDashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<AdminStatistics>({
    queryKey: ["admin", "statistics"],
    queryFn: () => adminService.getStatistics(),
  });

  if (isLoading) {
    return <Loading message="Chargement des statistiques..." />;
  }

  if (error || !stats) {
    return (
      <ErrorState
        message="Erreur lors du chargement des statistiques"
        details="Impossible de récupérer les statistiques administrateur"
        onRetry={refetch}
      />
    );
  }

  const statCards = [
    {
      title: "Salles",
      value: stats.totalResources,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Réservations",
      value: stats.totalReservations,
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Emails envoyés",
      value: stats.totalEmailsSent,
      icon: Mail,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <BarChart3 className="h-8 w-8 text-primary-600" />
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/admin/resources"
          className="card hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              Gérer les salles
            </h3>
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">
            Créer, modifier et supprimer des salles. Gérer les règles de
            disponibilité.
          </p>
        </Link>

        <Link
          to="/admin/reservations"
          className="card hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              Gérer les réservations
            </h3>
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">
            Consulter et gérer toutes les réservations de la plateforme.
          </p>
        </Link>
      </div>

      {/* Top rooms */}
      {stats.topResources && stats.topResources.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Salles les plus réservées
            </h2>
          </div>
          <div className="space-y-3">
            {stats.topResources.map((resource, index) => (
              <div
                key={resource.resourceId}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-300 w-8">
                    {index + 1}
                  </span>
                  <span className="text-gray-900 font-medium ml-3">
                    {resource.resourceName}
                  </span>
                </div>
                <span className="badge badge-blue">
                  {resource.reservationCount} réservation
                  {resource.reservationCount > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top users */}
      {stats.topUsers && stats.topUsers.length > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Utilisateurs les plus actifs
            </h2>
          </div>
          <div className="space-y-3">
            {stats.topUsers.map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-300 w-8">
                    {index + 1}
                  </span>
                  <span className="text-gray-900 ml-3">{user.email}</span>
                </div>
                <span className="badge badge-green">
                  {user.reservationCount} réservation
                  {user.reservationCount > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
