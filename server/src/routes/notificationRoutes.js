import { Router } from "express";
import { param } from "express-validator";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listNotifications));
router.post("/read-all", asyncHandler(markAllNotificationsRead));
router.post(
  "/:id/read",
  [param("id").isMongoId().withMessage("A valid notification id is required."), validateRequest],
  asyncHandler(markNotificationRead),
);

export default router;
