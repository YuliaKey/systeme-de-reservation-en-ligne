import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  Resource,
  CreateResourceRequest,
  AvailabilityRules,
} from "../../types";

interface ResourceFormProps {
  resource?: Resource;
  onSubmit: (data: CreateResourceRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" },
];

const CITIES = ["Paris", "Nice", "Lyon", "Bordeaux", "Marseille"];

export function ResourceForm({
  resource,
  onSubmit,
  onCancel,
  isSubmitting,
}: ResourceFormProps) {
  const [name, setName] = useState(resource?.name || "");
  const [description, setDescription] = useState(resource?.description || "");
  const [capacity, setCapacity] = useState(
    resource?.capacity?.toString() || "",
  );
  const [location, setLocation] = useState(resource?.location || "");
  const [city, setCity] = useState(resource?.city || "");
  const [pricePerHour, setPricePerHour] = useState(
    resource?.pricePerHour?.toString() || "",
  );
  const [amenities, setAmenities] = useState(
    resource?.amenities?.join(", ") || "",
  );
  const [images, setImages] = useState(resource?.images?.join(", ") || "");
  const [active, setActive] = useState(resource?.active ?? true);

  // Availability rules
  const [minDuration, setMinDuration] = useState(
    resource?.availability?.minDuration?.toString() || "",
  );
  const [maxDuration, setMaxDuration] = useState(
    resource?.availability?.maxDuration?.toString() || "",
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    resource?.availability?.daysOfWeek || [1, 2, 3, 4, 5],
  );
  const [timeRanges, setTimeRanges] = useState<
    { start: string; end: string }[]
  >(resource?.availability?.timeRanges || [{ start: "09:00", end: "18:00" }]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    );
  };

  const addTimeRange = () => {
    setTimeRanges([...timeRanges, { start: "09:00", end: "18:00" }]);
  };

  const removeTimeRange = (index: number) => {
    setTimeRanges(timeRanges.filter((_, i) => i !== index));
  };

  const updateTimeRange = (
    index: number,
    field: "start" | "end",
    value: string,
  ) => {
    const updated = [...timeRanges];
    updated[index][field] = value;
    setTimeRanges(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const availabilityRules: AvailabilityRules = {
      minDuration: minDuration ? parseInt(minDuration) : undefined,
      maxDuration: maxDuration ? parseInt(maxDuration) : undefined,
      daysOfWeek: selectedDays.length > 0 ? selectedDays : undefined,
      timeRanges: timeRanges.length > 0 ? timeRanges : undefined,
    };

    const data: CreateResourceRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      capacity: capacity ? parseInt(capacity) : undefined,
      location: location.trim() || undefined,
      city: city.trim(),
      pricePerHour: pricePerHour ? parseFloat(pricePerHour) : undefined,
      amenities: amenities.trim()
        ? amenities
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a.length > 0)
        : undefined,
      images: images.trim()
        ? images
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : undefined,
      active,
      availability: availabilityRules,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations de base
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la salle *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={255}
              placeholder="ex: Salle de réunion A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Décrivez la salle, ses équipements, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité (personnes)
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                placeholder="ex: 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ex: Bâtiment A, 2ème étage"
                maxLength={255}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ville *
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Sélectionnez une ville</option>
              {CITIES.map((cityOption) => (
                <option key={cityOption} value={cityOption}>
                  {cityOption}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix par heure (€)
              </label>
              <input
                type="number"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                min="0"
                step="0.01"
                placeholder="ex: 25.50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipements
              </label>
              <input
                type="text"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="WiFi, Projecteur, Tableau blanc (séparés par des virgules)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (URLs)
              </label>
              <input
                type="text"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg (séparées par des virgules)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Entrez les URLs des images séparées par des virgules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">
              Salle active (disponible pour réservation)
            </span>
          </div>
        </div>
      </div>

      {/* Règles de disponibilité */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Règles de disponibilité
        </h3>

        {/* Durée min/max */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Durée de réservation
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Durée minimale (minutes)
              </label>
              <input
                type="number"
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                min="1"
                placeholder="ex: 30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Durée maximale (minutes)
              </label>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                min="1"
                placeholder="ex: 480"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Si non renseigné, aucune limite ne sera appliquée
          </p>
        </div>

        {/* Jours de la semaine */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Jours disponibles
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDays.includes(day.value)
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plages horaires */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Plages horaires
            </label>
            <button
              type="button"
              onClick={addTimeRange}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Ajouter une plage
            </button>
          </div>
          <div className="space-y-3">
            {timeRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="time"
                  value={range.start}
                  onChange={(e) =>
                    updateTimeRange(index, "start", e.target.value)
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-gray-500">à</span>
                <input
                  type="time"
                  value={range.end}
                  onChange={(e) =>
                    updateTimeRange(index, "end", e.target.value)
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {timeRanges.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTimeRange(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn btn-secondary flex-1"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Enregistrement...
            </>
          ) : resource ? (
            "Mettre à jour"
          ) : (
            "Créer la salle"
          )}
        </button>
      </div>
    </form>
  );
}
