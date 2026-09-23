import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  console.error(error);

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues
    });

    return;
  }

  if (
    error instanceof Error &&
    error.message === "User already exists"
  ) {
    response.status(409).json({
      success: false,
      message: error.message
    });

    return;
  }

  if (
    error instanceof Error &&
    error.message === "Invalid email or password"
  ) {
    response.status(401).json({
      success: false,
      message: error.message
    });

    return;
  }

  response.status(500).json({
    success: false,
    message: "Internal server error"
  });
};