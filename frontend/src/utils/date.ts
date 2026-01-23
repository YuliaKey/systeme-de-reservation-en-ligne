import {
  format,
  parseISO,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isValid,
} from "date-fns";
import { fr } from "date-fns/locale";

export const formatDate = (
  date: string | Date,
  pattern: string = "dd/MM/yyyy",
): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Date invalide";
    return format(dateObj, pattern, { locale: fr });
  } catch {
    return "Date invalide";
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, "dd/MM/yyyy à HH:mm");
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, "HH:mm");
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Date invalide";
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
  } catch {
    return "Date invalide";
  }
};

export const isDateInPast = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isBefore(dateObj, new Date());
  } catch {
    return false;
  }
};

export const isDateInFuture = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isAfter(dateObj, new Date());
  } catch {
    return false;
  }
};

// Calculate duration in minutes between two dates
export const calculateDuration = (
  startTime: string | Date,
  endTime: string | Date,
): number => {
  try {
    const start =
      typeof startTime === "string" ? parseISO(startTime) : startTime;
    const end = typeof endTime === "string" ? parseISO(endTime) : endTime;
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  } catch {
    return 0;
  }
};

// Format duration in minutes to human readable
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h${mins.toString().padStart(2, "0")}`;
};
