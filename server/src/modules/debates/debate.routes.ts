import { Router } from "express";

import {
  create,
  list,
  getOne,
  start,
  respond,
  challenge,
  judge
} from "./debate.controller.js";

import {
  requireAuth
} from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  create
);

router.get(
  "/",
  list
);

router.get(
  "/:id",
  getOne
);

router.post(
  "/:id/start",
  start
);

router.post(
  "/:id/respond",
  respond
);

router.post(
  "/:id/challenge",
  challenge
);

router.post(
  "/:id/judge",
  judge
);

export default router;
