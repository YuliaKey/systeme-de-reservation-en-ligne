import { Package, Calendar, Search, FileQuestion } from "lucide-react";

interface EmptyStateProps {
  icon?: "resources" | "reservations" | "search" | "generic";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  resources: Package,
  reservations: Calendar,
  search: Search,
  generic: FileQuestion,
};

export function EmptyState({
  icon = "generic",
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
