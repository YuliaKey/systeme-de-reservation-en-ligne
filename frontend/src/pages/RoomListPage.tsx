import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, Users, Building2 } from "lucide-react";
import { resourcesService } from "../services";
import { ErrorState, EmptyState, ResourceCardSkeleton } from "../components/ui";
import { RoomFilters } from "../components/metier";
import type { Resource } from "../types";

export function RoomListPage() {
  const [searchParams, setSearchParams] = useState<{
    city: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  const {
    data: salles,
    isLoading,
    error,
    refetch,
  } = useQuery<Resource[]>({
    queryKey: ["resources", "search", searchParams],
    queryFn: async () => {
      if (
        searchParams &&
        searchParams.city &&
        searchParams.startDate &&
        searchParams.endDate
      ) {
        // Full search: city + dates
        const startTime = new Date(
          `${searchParams.startDate}T00:00:00`,
        ).toISOString();
        const endTime = new Date(
          `${searchParams.endDate}T23:59:59`,
        ).toISOString();
        return resourcesService.searchAvailable(
          searchParams.city,
          startTime,
          endTime,
        );
      }
      // Show all resources and filter client-side if needed
      const allResources = await resourcesService.getAll();

      // Apply city filter if provided
      if (searchParams?.city) {
        return allResources.filter(
          (r: Resource) => r.city === searchParams.city,
        );
      }

      return allResources;
    },
  });

  const handleFilter = (city: string, startDate: string, endDate: string) => {
    setSearchParams({ city, startDate, endDate });
  };

  const handleClearFilters = () => {
    setSearchParams(null);
  };

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Salles disponibles
      </h1>

      <RoomFilters
        onFilter={handleFilter}
        onClear={handleClearFilters}
        isLoading={isLoading}
        hasActiveFilters={!!searchParams}
        initialCity={searchParams?.city || ""}
        initialStartDate={searchParams?.startDate || ""}
        initialEndDate={searchParams?.endDate || ""}
      />

      {isLoading && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ResourceCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6">
          <ErrorState
            message="Erreur lors du chargement des salles"
            details="Impossible de récupérer la liste des salles de réunion"
            onRetry={refetch}
          />
        </div>
      )}

      {!isLoading && !error && (!salles || salles.length === 0) && (
        <div className="mt-6">
          <EmptyState
            icon="resources"
            title={searchParams ? "Aucune salle disponible" : "Aucune salle"}
            description={
              searchParams
                ? `Aucune salle n'est disponible à ${searchParams.city} pour ces dates`
                : "Il n'y a actuellement aucune salle de réunion à réserver"
            }
          />
        </div>
      )}

      {!isLoading && !error && salles && salles.length > 0 && (
        <div className="mt-6">
          <div className="mb-6">
            <p className="text-gray-600">
              {salles.length} salle{salles.length > 1 ? "s" : ""}{" "}
              {searchParams
                ? `disponible${salles.length > 1 ? "s" : ""} à ${searchParams.city}`
                : "au total"}
            </p>
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

                {salle.availability && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {salle.availability.minDuration && (
                        <span className="mr-3">
                          Min: {salle.availability.minDuration} min
                        </span>
                      )}
                      {salle.availability.maxDuration && (
                        <span>Max: {salle.availability.maxDuration} min</span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
