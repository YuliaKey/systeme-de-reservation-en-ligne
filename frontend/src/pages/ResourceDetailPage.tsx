import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Users,
  Package,
  Clock,
  Calendar as CalendarIcon,
  ArrowLeft,
  Euro,
  Wifi,
  Coffee,
  Printer,
  Monitor,
} from "lucide-react";
import { resourcesService } from "../services";
import { Loading, ErrorState } from "../components/ui";
import type { Resource, DbTimeRange, TimeRange } from "../types";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  cafe: Coffee,
  imprimante: Printer,
  ecran: Monitor,
  visio: Monitor,
  tableau: Package,
  projecteur: Monitor,
  casiers: Package,
};

const formatTimeRange = (range: any): string => {
  if (range.start && range.end) {
    return `${range.start} - ${range.end}`;
  }
  return "N/A";
};

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: resource,
    isLoading,
    error,
    refetch,
  } = useQuery<Resource>({
    queryKey: ["resource", id],
    queryFn: () => resourcesService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <Loading message="Chargement de la salle..." />;
  }

  if (error || !resource) {
    return (
      <ErrorState
        message="Salle introuvable"
        details="La salle demandée n'existe pas ou n'est plus disponible"
        onRetry={refetch}
      />
    );
  }

  const canReserve = resource.active;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/rooms")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux salles
      </button>

      {/* Resource images */}
      {resource.images && resource.images.length > 0 && (
        <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
          <img
            src={resource.images[0]}
            alt={resource.name}
            className="w-full h-96 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Resource header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resource.name}
            </h1>
            <div className="flex items-center gap-3">
              <span
                className={`badge ${resource.active ? "badge-green" : "badge-gray"}`}
              >
                {resource.active ? "Disponible" : "Indisponible"}
              </span>
              {resource.pricePerHour !== undefined && (
                <span className="flex items-center text-lg font-bold text-primary-600">
                  <Euro className="h-5 w-5 mr-1" />
                  {resource.pricePerHour}€/h
                </span>
              )}
            </div>
          </div>
          <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
            <Package className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        {resource.description && (
          <p className="text-gray-700 mb-6">{resource.description}</p>
        )}

        {/* Resource details */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {resource.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Localisation</div>
                <div className="font-medium">{resource.location}</div>
              </div>
            </div>
          )}
          {resource.capacity && (
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Capacité</div>
                <div className="font-medium">{resource.capacity} personnes</div>
              </div>
            </div>
          )}
        </div>

        {/* Amenities / Équipements */}
        {resource.amenities && resource.amenities.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Équipements disponibles
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {resource.amenities.map((amenity, index) => {
                const Icon = amenityIcons[amenity.toLowerCase()] || Package;
                return (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-primary-50 rounded-lg"
                  >
                    <Icon className="h-5 w-5 mr-2 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {amenity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Availability rules */}
        {resource.availability && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Règles de disponibilité
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Durées min/max */}
              {(resource.availability.minDuration ||
                resource.availability.maxDuration) && (
                <div className="flex items-start text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">
                      Durée de réservation
                    </div>
                    <div className="font-medium">
                      {resource.availability.minDuration && (
                        <span>
                          Min: {resource.availability.minDuration} min
                        </span>
                      )}
                      {resource.availability.minDuration &&
                        resource.availability.maxDuration &&
                        " - "}
                      {resource.availability.maxDuration && (
                        <span>
                          Max: {resource.availability.maxDuration} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Jours disponibles */}
              {resource.availability.daysOfWeek &&
                resource.availability.daysOfWeek.length > 0 && (
                  <div className="flex items-start text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">
                        Jours disponibles
                      </div>
                      <div className="font-medium">
                        {resource.availability.daysOfWeek
                          .map((day: number) => {
                            const days = [
                              "Dimanche",
                              "Lundi",
                              "Mardi",
                              "Mercredi",
                              "Jeudi",
                              "Vendredi",
                              "Samedi",
                            ];
                            return days[day];
                          })
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Plages horaires */}
            {resource.availability.timeRanges &&
              resource.availability.timeRanges.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Plages horaires
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resource.availability.timeRanges.map(
                      (range: DbTimeRange | TimeRange, index: number) => (
                        <span key={index} className="badge badge-blue">
                          {formatTimeRange(range)}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Action button */}
        <div className="border-t border-gray-200 pt-6 mt-6 flex justify-center">
          {canReserve ? (
            <Link
              to={`/reservations/new?resourceId=${resource.id}`}
              className="btn btn-primary w-full md:w-auto"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Réserver cette salle
            </Link>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Cette salle n'est actuellement pas disponible à la réservation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
