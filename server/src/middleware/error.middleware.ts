import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  console.error(error);

  response.status(500).json({
    success: false,
    message: "Internal server error"
  });
};