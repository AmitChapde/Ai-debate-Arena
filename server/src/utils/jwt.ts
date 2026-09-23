import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
  userId: string;
}

export function generateAccessToken(userId: string): string {
  return jwt.sign(
    {
      userId
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    }
  );
}

export function verifyAccessToken(
  token: string
): JwtPayload {
  return jwt.verify(
    token,
    env.JWT_SECRET
  ) as JwtPayload;
}