import { Router } from "express";
import { body, param } from "express-validator";
import {
  getConversationMessages,
  listConversations,
  sendMessage,
  startConversation,
} from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/conversations", asyncHandler(listConversations));
router.post(
  "/conversations",
  [
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 24 })
      .withMessage("Username must be 3-24 characters."),
    body("participantId")
      .optional()
      .isMongoId()
      .withMessage("Participant id must be valid."),
    body().custom((value) => {
      if (!value.username && !value.participantId) {
        throw new Error("A username or participant id is required.");
      }

      return true;
    }),
    validateRequest,
  ],
  asyncHandler(startConversation),
);
router.get(
  "/conversations/:id",
  [param("id").isMongoId().withMessage("A valid conversation id is required."), validateRequest],
  asyncHandler(getConversationMessages),
);
router.post(
  "/conversations/:id/messages",
  [
    param("id").isMongoId().withMessage("A valid conversation id is required."),
    body("text").trim().isLength({ min: 1, max: 1000 }).withMessage("Message must be 1-1000 characters."),
    validateRequest,
  ],
  asyncHandler(sendMessage),
);

export default router;
