import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reservationsService } from "../services";
import { useAsync } from "../hooks/useAsync";
import {
  LoadingSkeleton,
  ErrorState,
  EmptyState,
  FeedbackBanner,
} from "../components/transverse";
import { ReservationCard } from "../components/metier";
import { PaginatedReservations } from "../types/index";
import "./MyReservationsPage.css";

export const MyReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: string;
    message: string;
  } | null>(null);

  // Récupérer mes réservations
  const {
    data: reservationsData,
    state: reservationState,
    error: reservationError,
    retry: retryReservations,
    execute: fetchReservations,
  } = useAsync<PaginatedReservations>(
    () =>
      reservationsService.listMyReservations({
        page: currentPage,
        pageSize: 10,
      }),
    true,
  );

  const reservations = reservationsData as PaginatedReservations;

  const handleViewReservation = (reservationId: string) => {
    navigate(`/reservations/${reservationId}`);
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
    ) {
      return;
    }

    try {
      await reservationsService.cancelReservation(reservationId);
      setFeedback({
        type: "success",
        message: "Réservation annulée avec succès",
      });
      fetchReservations();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erreur lors de l'annulation",
      });
    }
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="my-reservations-page">
      <div className="page-header">
        <h1 className="page-title">Mes Réservations</h1>
        <button className="btn btn--secondary" onClick={goHome}>
          ← Retour à l'accueil
        </button>
      </div>

      {feedback && (
        <FeedbackBanner
          type={feedback.type as any}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {reservationState === "loading" && (
        <LoadingSkeleton count={3} height="150px" />
      )}

      {reservationState === "error" && reservationError && (
        <ErrorState error={reservationError} onRetry={retryReservations} />
      )}

      {reservationState === "empty" && (
        <EmptyState
          title="Aucune réservation"
          message="Vous n'avez pas encore de réservation. Commencez par rechercher une salle."
          icon="📅"
          action={{
            label: "Rechercher une salle",
            onClick: goHome,
          }}
        />
      )}

      {reservationState === "success" && reservations && (
        <>
          <FeedbackBanner
            type="info"
            message={`${reservations.total} réservation(s) trouvée(s)`}
            autoClose={true}
          />

          <div className="reservations-list">
            {reservations.items.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onView={handleViewReservation}
                onCancel={handleCancelReservation}
              />
            ))}
          </div>

          {/* Pagination */}
          {reservations.total > reservations.pageSize && (
            <div className="pagination">
              <button
                className="btn btn--secondary"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              <span className="pagination-info">
                Page {reservations.page} sur{" "}
                {Math.ceil(reservations.total / reservations.pageSize)}
              </span>
              <button
                className="btn btn--secondary"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      Math.ceil(reservations.total / reservations.pageSize),
                      p + 1,
                    ),
                  )
                }
                disabled={
                  currentPage * reservations.pageSize >= reservations.total
                }
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
