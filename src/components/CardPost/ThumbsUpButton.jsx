"use client";

import { IconButton } from "../IconButton";
import { Spinner } from "../Spinner";
import { ThumbsUp } from "../icons/ThumbsUp";

export const ThumbsUpButton = ({ onClick, disabled, isLoading }) => {
  return (
    <IconButton onClick={onClick} disabled={disabled}>
      {isLoading ? <Spinner /> : <ThumbsUp />}
    </IconButton>
  );
};