import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { roomsService } from "../services";
import { useAsync } from "../hooks/useAsync";
import {
  LoadingSkeleton,
  ErrorState,
  EmptyState,
  FeedbackBanner,
} from "../components/transverse";
import { RoomSearchForm, RoomCard } from "../components/metier";
import { PaginatedRooms } from "../types/index";
import "./RoomsListPage.css";

export const RoomsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: roomsData,
    state,
    error,
    execute,
    retry,
  } = useAsync<PaginatedRooms>(async () => {
    if (!searchParams) {
      return { items: [], page: 1, pageSize: 10, total: 0 };
    }
    return roomsService.listRooms({
      ...searchParams,
      page: currentPage,
      pageSize: 10,
    });
  }, false);

  const data = roomsData as PaginatedRooms;

  // Déclencher la recherche quand les paramètres changent
  useEffect(() => {
    if (searchParams) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentPage]);

  const handleSearch = (formData: any) => {
    setSearchParams(formData);
    setCurrentPage(1);
  };

  const handleSelectRoom = (roomId: string) => {
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div className="rooms-list-page">
      <RoomSearchForm onSearch={handleSearch} isLoading={state === "loading"} />

      {state === "loading" && (
        <div className="page-content">
          <LoadingSkeleton count={3} height="200px" />
        </div>
      )}

      {state === "error" && error && (
        <div className="page-content">
          <ErrorState error={error} onRetry={retry} />
        </div>
      )}

      {state === "empty" && searchParams && (
        <div className="page-content">
          <EmptyState
            title="Aucune salle disponible"
            message="Modifiez votre recherche pour trouver une salle qui correspond à vos critères."
            icon="🏢"
          />
        </div>
      )}

      {state === "success" && data && (
        <div className="page-content">
          {data.items.length === 0 ? (
            <EmptyState
              title="Aucune salle disponible"
              message="Modifiez votre recherche pour trouver une salle qui correspond à vos critères."
              icon="🏢"
            />
          ) : (
            <>
              <FeedbackBanner
                type="success"
                message={`${data.total} salle(s) trouvée(s)`}
                autoClose={true}
              />
              <div className="rooms-grid">
                {data.items.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onSelect={handleSelectRoom}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.total > data.pageSize && (
                <div className="pagination">
                  <button
                    className="btn btn--secondary"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </button>
                  <span className="pagination-info">
                    Page {data.page} sur {Math.ceil(data.total / data.pageSize)}
                  </span>
                  <button
                    className="btn btn--secondary"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(Math.ceil(data.total / data.pageSize), p + 1),
                      )
                    }
                    disabled={currentPage * data.pageSize >= data.total}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {state === "idle" && !searchParams && (
        <div className="page-content">
          <EmptyState
            title="Commencez votre recherche"
            message="Remplissez le formulaire ci-dessus pour trouver une salle adaptée à vos besoins."
            icon="🔍"
          />
        </div>
      )}
    </div>
  );
};
