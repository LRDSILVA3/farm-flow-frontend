import { useContext, useMemo } from "react";
import { QueryClient, QueryClientContext } from "@tanstack/react-query";

/**
 * Returns the shared QueryClient from React context when available,
 * falling back to an isolated client when components render standalone (e.g. unit tests).
 */
export const useSafeQueryClient = (): QueryClient => {
  const contextClient = useContext(QueryClientContext);
  const fallbackClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return contextClient ?? fallbackClient;
};

