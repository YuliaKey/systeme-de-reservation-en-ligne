import { useState, useEffect } from "react";
import { MapPin, Calendar, X } from "lucide-react";

interface RoomFiltersProps {
  onFilter: (city: string, startDate: string, endDate: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  hasActiveFilters: boolean;
  initialCity?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

const CITIES = ["Paris", "Nice", "Lyon", "Bordeaux", "Marseille"];

export function RoomFilters({
  onFilter,
  onClear,
  isLoading,
  hasActiveFilters,
  initialCity = "",
  initialStartDate = "",
  initialEndDate = "",
}: RoomFiltersProps) {
  const [city, setCity] = useState(initialCity);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Sync with initial values when they change
  useEffect(() => {
    setCity(initialCity);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [initialCity, initialStartDate, initialEndDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow filtering with at least city OR both dates
    if (city || (startDate && endDate)) {
      onFilter(city, startDate, endDate);
    }
  };

  const canFilter = city || (startDate && endDate);

  const handleClear = () => {
    setCity("");
    setStartDate("");
    setEndDate("");
    onClear();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Filtrer les salles
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* City Filter */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <MapPin className="w-4 h-4 inline mr-1" />
              Ville
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input w-full"
            >
              <option value="">Toutes les villes</option>
              {CITIES.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de début
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className="input w-full"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de fin
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              className="input w-full"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!canFilter || isLoading}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Recherche...
              </span>
            ) : (
              "Appliquer les filtres"
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
