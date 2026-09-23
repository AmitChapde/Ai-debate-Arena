import type { RequestHandler } from "express";
export const rateLimit: RequestHandler = (_req, _res, next) => next();
