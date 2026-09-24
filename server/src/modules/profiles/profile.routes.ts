import { Router } from "express";

import {
  getProfile,
} from "./profile.controller.js";

import {
  requireAuth,
} from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  getProfile,
);

export default router;