"use client";

import { useState, useCallback } from "react";
import { useCSRFToken } from "./useCSRFToken";
import { logEvent, logEventError } from "@/eventLogger";

export function useLike(postId, initialLikes) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState(null);
  const { token, loading: tokenLoading } = useCSRFToken();

  const handleLike = useCallback(async () => {
    // Validações
    if (!token) {
      logEventError({
        step: "useLike",
        operation: "token not available",
        userId: "anonymous",
        error: { message: "Token CSRF não disponível" },
      });

      setError("Token de segurança não disponível");

      return;
    }

    if (isLiking) {
      return;
    }

    setIsLiking(true);
    setError(null);

    try {
      logEvent({ step: "useLike", operation: "sending like with CSRF token" });

      const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": token, // ✅ Proteção CSRF
        },
        credentials: "include",
        body: JSON.stringify({ postId }),
      });

      const data = await response.json();

      // Tratamento de diferentes status
      if (response.ok) {
        logEvent({
          step: "useLike",
          operation: "like registered successfully",
        });
        setLikes((prev) => prev + 1);
      } else if (response.status === 403) {
        logEventError({
          step: "useLike",
          operation: "CSRF invalid - attack blocked",
          userId: "anonymous",
          error: { message: "CSRF inválido - Ataque bloqueado" },
        });

        setError("Erro de segurança: Token CSRF inválido");
      } else if (response.status === 401) {
        logEventError({
          step: "useLike",
          operation: "user not authenticated",
          userId: "anonymous",
          error: { message: "Usuário não autenticado" },
        });
        setError("Você precisa estar logado para dar like");
      } else {
        logEventError({
          step: "useLike",
          operation: "error processing like",
          userId: "anonymous",
          error: { message: data.error || "Erro ao processar like" },
        });

        setError(data.error || "Erro ao processar like");
      }
    } catch (err) {
      logEventError({
        step: "useLike",
        operation: "error requesting like",
        userId: "anonymous",
        error: err,
      });
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLiking(false);
    }
  }, [token, postId, isLiking]);

  return {
    likes,
    isLiking,
    handleLike,
    error,
    isDisabled: tokenLoading || isLiking || !token,
  };
}
