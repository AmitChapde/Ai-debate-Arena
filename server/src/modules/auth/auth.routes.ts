import { Router } from "express";

import {
  register,
  login,
  me,
} from "./auth.controller.js";

import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

// Protected routes
router.get(
  "/me",
  requireAuth,
  me
);

export default router;