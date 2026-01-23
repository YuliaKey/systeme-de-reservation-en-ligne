import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, Users, Building2 } from "lucide-react";
import { resourcesService } from "../services";
import { ErrorState, EmptyState, ResourceCardSkeleton } from "../components/ui";
import type { Resource } from "../types";

export function SallesListPage() {
  const {
    data: salles,
    isLoading,
    error,
    refetch,
  } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => resourcesService.getAll(),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Salles disponibles
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ResourceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Erreur lors du chargement des salles"
        details="Impossible de récupérer la liste des salles de réunion"
        onRetry={refetch}
      />
    );
  }

  if (!salles || salles.length === 0) {
    return (
      <EmptyState
        icon="resources"
        title="Aucune salle disponible"
        description="Il n'y a actuellement aucune salle de réunion à réserver"
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Salles de réunion
          </h1>
          <p className="text-gray-600 mt-1">
            {salles.length} salle{salles.length > 1 ? "s" : ""} disponible
            {salles.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salles.map((salle: Resource) => (
          <Link
            key={salle.id}
            to={`/rooms/${salle.id}`}
            className="card hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                  {salle.name}
                </h3>
                <span
                  className={`badge ${salle.active ? "badge-green" : "badge-gray"}`}
                >
                  {salle.active ? "Disponible" : "Indisponible"}
                </span>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
            </div>

            {salle.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {salle.description}
              </p>
            )}

            <div className="space-y-2">
              {salle.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {salle.location}
                </div>
              )}
              {salle.capacity && (
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  Capacité: {salle.capacity} personne
                  {salle.capacity > 1 ? "s" : ""}
                </div>
              )}
            </div>

            {salle.availabilityRules && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {salle.availabilityRules.minDuration && (
                    <span className="mr-3">
                      Min: {salle.availabilityRules.minDuration} min
                    </span>
                  )}
                  {salle.availabilityRules.maxDuration && (
                    <span>Max: {salle.availabilityRules.maxDuration} min</span>
                  )}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
