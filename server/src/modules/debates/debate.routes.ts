import { Router } from "express";

import {
  create,
  list,
  getOne,
  start,
  respond
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

export default router;
