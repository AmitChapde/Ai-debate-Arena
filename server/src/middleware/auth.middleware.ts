import type { NextFunction, Request, Response } from "express";

import {
  COOKIE_NAME
} from "../utils/auth-cookie.js";

import {
  verifyAccessToken
} from "../utils/jwt.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const token = request.cookies[COOKIE_NAME];

  if (!token) {
    response.status(401).json({
      success: false,
      message: "Authentication required"
    });

    return;
  }

  try {
    const payload = verifyAccessToken(token);

    request.userId = payload.userId;

    next();
  } catch {
    response.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }
}