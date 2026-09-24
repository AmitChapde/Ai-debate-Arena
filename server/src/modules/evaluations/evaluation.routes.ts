import { Router } from "express";

import {
  list,
  getOne,
  getByDebate
} from "./evaluation.controller.js";

import {
  requireAuth
} from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  list
);

router.get(
  "/debate/:debateId",
  getByDebate
);

router.get(
  "/:id",
  getOne
);

export default router;