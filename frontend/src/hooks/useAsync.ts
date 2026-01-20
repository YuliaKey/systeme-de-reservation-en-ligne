import { useReducer, useCallback } from "react";
import { DataState, UiError } from "../types/index";

export interface UseAsyncState<T> {
  data: T | null;
  state: DataState;
  error: UiError | null;
}

type UseAsyncAction<T> =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: T }
  | { type: "EMPTY" }
  | { type: "ERROR"; payload: UiError };

const initialState = <T>(): UseAsyncState<T> => ({
  data: null,
  state: "idle",
  error: null,
});

const reducer = <T>(
  state: UseAsyncState<T>,
  action: UseAsyncAction<T>,
): UseAsyncState<T> => {
  switch (action.type) {
    case "LOADING":
      return { ...state, state: "loading", error: null };
    case "SUCCESS":
      return { data: action.payload, state: "success", error: null };
    case "EMPTY":
      return { data: null, state: "empty", error: null };
    case "ERROR":
      return { data: null, state: "error", error: action.payload };
    default:
      return state;
  }
};

/**
 * Hook pour gérer les états de chargement asynchrone
 */
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
) => {
  const [state, dispatch] = useReducer(reducer, initialState<T>());

  const execute = useCallback(async () => {
    dispatch({ type: "LOADING" });
    try {
      const result = await asyncFunction();
      if (result === null || (Array.isArray(result) && result.length === 0)) {
        dispatch({ type: "EMPTY" });
      } else {
        dispatch({ type: "SUCCESS", payload: result });
      }
    } catch (err) {
      const error = err as UiError;
      dispatch({
        type: "ERROR",
        payload: error,
      });
    }
  }, [asyncFunction]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  if (immediate && state.state === "idle") {
    execute();
  }

  return { ...state, execute, retry };
};
