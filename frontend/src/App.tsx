import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/transverse";
import {
  RoomsListPage,
  RoomDetailPage,
  BookingPage,
  ReservationConfirmationPage,
  MyReservationsPage,
} from "./pages";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<RoomsListPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
          <Route path="/rooms/:roomId/book" element={<BookingPage />} />
          <Route
            path="/reservations/:reservationId"
            element={<ReservationConfirmationPage />}
          />
          <Route path="/my-reservations" element={<MyReservationsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
