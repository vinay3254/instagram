import { Router } from "express";
import { body, param } from "express-validator";
import {
  addComment,
  createPost,
  getExplore,
  getFeed,
  getPostById,
  getReels,
  toggleLike,
} from "../controllers/postController.js";
import { attachUserIfPresent, requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validateRequest } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/explore", attachUserIfPresent, asyncHandler(getExplore));
router.get("/reels", attachUserIfPresent, asyncHandler(getReels));
router.get("/feed", requireAuth, asyncHandler(getFeed));
router.get(
  "/:id",
  attachUserIfPresent,
  [param("id").isMongoId().withMessage("A valid post id is required."), validateRequest],
  asyncHandler(getPostById),
);
router.post(
  "/",
  requireAuth,
  upload.fields([
    { name: "media", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  [body("caption").optional().isLength({ max: 2200 }).withMessage("Caption must be 2200 characters or fewer."), validateRequest],
  asyncHandler(createPost),
);
router.post(
  "/:id/like",
  requireAuth,
  [param("id").isMongoId().withMessage("A valid post id is required."), validateRequest],
  asyncHandler(toggleLike),
);
router.post(
  "/:id/comments",
  requireAuth,
  [
    param("id").isMongoId().withMessage("A valid post id is required."),
    body("text").trim().isLength({ min: 1, max: 500 }).withMessage("Comment must be 1-500 characters."),
    validateRequest,
  ],
  asyncHandler(addComment),
);

export default router;
