import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  MapPin,
  Users,
  Package,
  Wifi,
  Coffee,
  Printer,
  Euro,
} from "lucide-react";
import { resourcesService } from "../services";
import { ErrorState, EmptyState, ResourceCardSkeleton } from "../components/ui";
import type { Resource } from "../types";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  cafe: Coffee,
  imprimante: Printer,
  ecran: Package,
  visio: Package,
  tableau: Package,
  projecteur: Package,
  casiers: Package,
};

export function ResourcesListPage() {
  const {
    data: resources,
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
          Ressources disponibles
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
        message="Erreur lors du chargement des ressources"
        details="Impossible de récupérer la liste des ressources"
        onRetry={refetch}
      />
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <EmptyState
        icon="resources"
        title="Aucune ressource disponible"
        description="Il n'y a actuellement aucune ressource à réserver"
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Ressources disponibles
        </h1>
        <div className="text-sm text-gray-600">
          {resources.length} ressource{resources.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Link
            key={resource.id}
            to={`/resources/${resource.id}`}
            className="card hover:shadow-lg transition-shadow group"
          >
            {resource.images && resource.images.length > 0 && (
              <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={resource.images[0]}
                  alt={resource.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                  {resource.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${resource.active ? "badge-green" : "badge-gray"}`}
                  >
                    {resource.active ? "Disponible" : "Indisponible"}
                  </span>
                  {resource.pricePerHour !== undefined && (
                    <span className="flex items-center text-sm font-semibold text-primary-600">
                      <Euro className="h-4 w-4 mr-1" />
                      {resource.pricePerHour}€/h
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
            </div>

            {resource.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {resource.description}
              </p>
            )}

            <div className="space-y-2">
              {resource.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  {resource.location}
                </div>
              )}
              {resource.capacity && (
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  Capacité: {resource.capacity} personnes
                </div>
              )}
            </div>

            {/* Équipements / Amenities */}
            {resource.amenities && resource.amenities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2">
                  Équipements disponibles:
                </div>
                <div className="flex flex-wrap gap-2">
                  {resource.amenities.map((amenity, index) => {
                    const Icon = amenityIcons[amenity.toLowerCase()] || Package;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs"
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {amenity}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Règles de réservation */}
            {(resource.rules || resource.availabilityRules) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  {resource.rules?.minDurationMinutes && (
                    <div>
                      Durée min: {resource.rules.minDurationMinutes} min
                    </div>
                  )}
                  {resource.rules?.maxDurationMinutes && (
                    <div>
                      Durée max: {resource.rules.maxDurationMinutes} min
                    </div>
                  )}
                  {/* Fallback vers availabilityRules pour compatibilité */}
                  {!resource.rules &&
                    resource.availabilityRules?.minDuration && (
                      <div>
                        Durée min: {resource.availabilityRules.minDuration} min
                      </div>
                    )}
                  {!resource.rules &&
                    resource.availabilityRules?.maxDuration && (
                      <div>
                        Durée max: {resource.availabilityRules.maxDuration} min
                      </div>
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
