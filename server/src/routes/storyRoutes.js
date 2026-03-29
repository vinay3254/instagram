import { Router } from "express";
import { body, param } from "express-validator";
import { createStory, getStoryFeed, markStoryViewed } from "../controllers/storyController.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validateRequest } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/feed", asyncHandler(getStoryFeed));
router.post(
  "/",
  upload.fields([{ name: "media", maxCount: 1 }]),
  [body("caption").optional().isLength({ max: 180 }).withMessage("Story caption must be 180 characters or fewer."), validateRequest],
  asyncHandler(createStory),
);
router.post(
  "/:id/view",
  [param("id").isMongoId().withMessage("A valid story id is required."), validateRequest],
  asyncHandler(markStoryViewed),
);

export default router;
