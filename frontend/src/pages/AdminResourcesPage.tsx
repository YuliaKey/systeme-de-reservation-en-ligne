import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Edit, Trash2, MapPin, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { resourcesService } from "../services";
import { Loading, ErrorState, EmptyState } from "../components/ui";
import { ResourceForm } from "../components/forms/ResourceForm";
import type { Resource, CreateResourceRequest } from "../types";

export function AdminResourcesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(
    null,
  );

  const {
    data: resources,
    isLoading,
    error,
    refetch,
  } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => resourcesService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resourcesService.delete(id),
    onSuccess: () => {
      toast.success("Salle supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setDeletingResource(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la salle");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateResourceRequest) => resourcesService.create(data),
    onSuccess: () => {
      toast.success("Salle créée avec succès");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || "Erreur lors de la création de la salle";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateResourceRequest }) =>
      resourcesService.update(id, data),
    onSuccess: () => {
      toast.success("Salle mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setEditingResource(null);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        "Erreur lors de la mise à jour de la salle";
      toast.error(message);
    },
  });

  if (isLoading) {
    return <Loading message="Chargement des salles..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Erreur lors du chargement des salles"
        details="Impossible de récupérer la liste des salles"
        onRetry={refetch}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des salles</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle salle
        </button>
      </div>

      {!resources || resources.length === 0 ? (
        <EmptyState
          icon="resources"
          title="Aucune salle"
          description="Créez votre première salle pour commencer"
          action={{
            label: "Créer une salle",
            onClick: () => setShowCreateModal(true),
          }}
        />
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {resource.name}
                    </h3>
                    <span
                      className={`badge ${resource.active ? "badge-green" : "badge-gray"}`}
                    >
                      {resource.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {resource.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {resource.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {resource.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {resource.location}
                      </div>
                    )}
                    {resource.capacity && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {resource.capacity} personnes
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingResource(resource)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingResource(resource)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deletingResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Supprimer la salle
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer "{deletingResource.name}" ?
              Cette action supprimera également toutes les réservations
              associées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingResource(null)}
                className="btn btn-secondary flex-1"
                disabled={deleteMutation.isPending}
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingResource.id)}
                className="btn btn-danger flex-1"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Nouvelle salle
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <ResourceForm
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setShowCreateModal(false)}
                isSubmitting={createMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Modifier la salle
              </h2>
              <button
                onClick={() => setEditingResource(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <ResourceForm
                resource={editingResource}
                onSubmit={(data) =>
                  updateMutation.mutate({ id: editingResource.id, data })
                }
                onCancel={() => setEditingResource(null)}
                isSubmitting={updateMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
