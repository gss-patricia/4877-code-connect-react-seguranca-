"use client";

import { useState } from "react";
import { IconButton } from "../IconButton";
import { Spinner } from "../Spinner";
import { ThumbsUp } from "../icons/ThumbsUp";

export const ThumbsUpButton = ({ postId, onLikeSuccess }) => {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);

    try {
      const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ postId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Like registrado com sucesso!");
        if (onLikeSuccess) {
          onLikeSuccess();
        }
      } else {
        console.error("❌ Erro ao dar like:", data.error);
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <IconButton disabled={pending} onClick={handleClick}>
      {pending ? <Spinner /> : <ThumbsUp />}
    </IconButton>
  );
};
