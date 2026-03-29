import { Router } from "express";
import { body, param, query } from "express-validator";
import { getProfile, searchUsers, toggleFollow, updateProfile } from "../controllers/userController.js";
import { attachUserIfPresent, requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validateRequest } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/search",
  requireAuth,
  [query("q").optional().isLength({ max: 60 }).withMessage("Search query must be 60 characters or fewer."), validateRequest],
  asyncHandler(searchUsers),
);
router.patch(
  "/me",
  requireAuth,
  upload.fields([{ name: "avatarFile", maxCount: 1 }]),
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 24 })
      .withMessage("Username must be 3-24 characters."),
    body("bio")
      .optional()
      .isLength({ max: 180 })
      .withMessage("Bio must be 180 characters or fewer."),
    body("avatar")
      .optional()
      .custom((value) => !value || /^https?:\/\/.+/i.test(value))
      .withMessage("Avatar must be a valid http(s) URL."),
    validateRequest,
  ],
  asyncHandler(updateProfile),
);
router.get(
  "/:username",
  attachUserIfPresent,
  [param("username").trim().isLength({ min: 3, max: 24 }).withMessage("A valid username is required."), validateRequest],
  asyncHandler(getProfile),
);
router.post(
  "/:id/follow",
  requireAuth,
  [param("id").isMongoId().withMessage("A valid user id is required."), validateRequest],
  asyncHandler(toggleFollow),
);

export default router;
