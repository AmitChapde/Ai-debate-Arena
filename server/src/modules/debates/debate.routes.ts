import { Router } from "express";

import {
  create,
  list,
  getOne,
  start
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

export default router;