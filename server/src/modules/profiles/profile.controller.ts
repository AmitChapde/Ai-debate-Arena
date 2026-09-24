import type {
  Request,
  Response,
} from "express";

import {
  getUserProfile,
} from "./profile.service.js";

export async function getProfile(
  request: Request,
  response: Response,
): Promise<void> {
  const profile = await getUserProfile(
    request.userId,
  );

  response.status(200).json({
    success: true,
    data: {
      profile,
    },
  });
}