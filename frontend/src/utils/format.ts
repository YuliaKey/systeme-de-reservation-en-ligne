import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format status badges
export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "active":
    case "modified":
      return "badge-green";
    case "cancelled":
      return "badge-red";
    case "passed":
      return "badge-gray";
    case "available":
      return "badge-green";
    case "unavailable":
      return "badge-red";
    case "maintenance":
      return "badge-yellow";
    case "sent":
      return "badge-green";
    case "failed":
      return "badge-red";
    default:
      return "badge-gray";
  }
};

// Format status labels
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: "Active",
    cancelled: "Annulée",
    modified: "Active", // Afficher 'Active' au lieu de 'Modifiée'
    passed: "Passée",
    available: "Disponible",
    unavailable: "Indisponible",
    maintenance: "Maintenance",
    sent: "Envoyé",
    failed: "Échoué",
  };
  return labels[status] || status;
};

// Truncate text with ellipsis
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

// Capitalize first letter
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
