import type { Request, Response } from "express";

import {
  loginSchema,
  registerSchema
} from "./auth.validation.js";

import {
  getUserById,
  loginUser,
  registerUser
} from "./auth.service.js";

import {
  clearAuthCookie,
  setAuthCookie
} from "../../utils/auth-cookie.js";

export async function register(
  request: Request,
  response: Response
): Promise<void> {
  const input = registerSchema.parse(request.body);

  const result = await registerUser(input);

  setAuthCookie(response, result.token);

  response.status(201).json({
    success: true,
    data: {
      user: result.user
    }
  });
}

export async function login(
  request: Request,
  response: Response
): Promise<void> {
  const input = loginSchema.parse(request.body);

  const result = await loginUser(input);

  setAuthCookie(response, result.token);

  response.status(200).json({
    success: true,
    data: {
      user: result.user
    }
  });
}

export async function logout(
  _request: Request,
  response: Response
): Promise<void> {
  clearAuthCookie(response);

  response.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
}

export async function me(
  request: Request,
  response: Response
): Promise<void> {
  const userId = request.userId;

  const user = await getUserById(userId);

  if (!user) {
    response.status(404).json({
      success: false,
      message: "User not found"
    });

    return;
  }

  response.status(200).json({
    success: true,
    data: {
      user
    }
  });
}