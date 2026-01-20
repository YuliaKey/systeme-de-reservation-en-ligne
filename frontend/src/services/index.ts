/// <reference types="../vite-env.d.ts" />

// Exporte les services en fonction du mode (mock ou réel)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

import { roomsService as roomsServiceReal } from "./roomsService";
import { reservationsService as reservationsServiceReal } from "./reservationsService";
import { roomsServiceMock } from "./roomsService.mock";
import { reservationsServiceMock } from "./reservationsService.mock";

// Exporter le bon service selon le mode
export const roomsService = USE_MOCK ? roomsServiceMock : roomsServiceReal;
export const reservationsService = USE_MOCK
  ? reservationsServiceMock
  : reservationsServiceReal;

if (import.meta.env.DEV) {
  console.log(
    `Services en mode: ${USE_MOCK ? "MOCK" : "REAL"} (VITE_USE_MOCK=${import.meta.env.VITE_USE_MOCK})`,
  );
}
