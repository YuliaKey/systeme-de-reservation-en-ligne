import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser, UserProfile } from "@clerk/clerk-react";
import { useState } from "react";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { usersService } from "../services";
import { Loading, ErrorState } from "../components/ui";
import { formatDateTime } from "../utils";
import type { User } from "../types";

export function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: dbUser,
    isLoading,
    error,
    refetch,
  } = useQuery<User>({
    queryKey: ["user", "me"],
    queryFn: () => usersService.getMe(),
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersService.deleteMe(),
    onSuccess: () => {
      toast.success("Compte supprimé avec succès");
      window.location.href = "/";
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du compte");
    },
  });

  if (isLoading) {
    return <Loading message="Chargement du profil..." />;
  }

  if (error || !dbUser) {
    return (
      <ErrorState
        message="Erreur lors du chargement du profil"
        details="Impossible de récupérer vos informations"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon profil</h1>

      {/* User info card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4 mb-6">
          {clerkUser?.imageUrl ? (
            <img
              src={clerkUser.imageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {dbUser.fullName || dbUser.username || "Utilisateur"}
            </h2>
            {dbUser.role === "admin" && (
              <span className="badge badge-blue">
                <Shield className="h-3 w-3 mr-1" />
                Administrateur
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium text-gray-900">{dbUser.email}</div>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Membre depuis</div>
              <div className="font-medium text-gray-900">
                {formatDateTime(dbUser.createdAt)}
              </div>
            </div>
          </div>
          {dbUser.username && (
            <div className="flex items-start">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Nom d'utilisateur</div>
                <div className="font-medium text-gray-900">
                  {dbUser.username}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Authentication */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Sécurité & Authentification
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Gérez votre authentification, activez la double authentification (2FA)
          et sécurisez votre compte.
        </p>
        <div className="bg-gray-50 rounded-lg p-1">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
              },
            }}
          />
        </div>
      </div>

      {/* Account management */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Gestion du compte
        </h2>
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Zone de danger
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              La suppression de votre compte est définitive et supprimera toutes
              vos données.
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="btn btn-danger"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette
              action est irréversible et supprimera toutes vos données incluant
              vos réservations.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="btn btn-secondary flex-1"
                disabled={deleteMutation.isPending}
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                className="btn btn-danger flex-1"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? "Suppression..."
                  : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
