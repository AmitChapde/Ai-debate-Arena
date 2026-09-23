import type { Response } from "express";
import { env } from "../config/env.js";

const COOKIE_NAME = "access_token";

export function setAuthCookie(
  response: Response,
  token: string
): void {
  response.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production"
      ? "none"
      : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
}

export function clearAuthCookie(
  response: Response
): void {
  response.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production"
      ? "none"
      : "lax",
    path: "/"
  });
}

export { COOKIE_NAME };