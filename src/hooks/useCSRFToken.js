"use client";

import { useEffect, useState } from "react";

/**
 * Hook para obter o token CSRF automaticamente
 *
 * Uso:
 * const { token, loading, error } = useCSRFToken();
 */
export function useCSRFToken() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch("/api/csrf-token", {
          credentials: "include",
        });

        if (!response.ok) {
          logEventError({
            step: "useCSRFToken",
            operation: "fetch token",
            error: new Error("Falha ao obter token CSRF"),
          });

          throw new Error("Falha ao obter token CSRF");
        }

        const data = await response.json();
        setToken(data.csrfToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        logEventError({
          step: "useCSRFToken",
          operation: "fetch token",
          error: err,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return { token, loading, error };
}
