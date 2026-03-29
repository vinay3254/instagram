import { Router } from "express";
import { body } from "express-validator";
import { getCurrentUser, login, logout, refresh, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3, max: 24 }).withMessage("Username must be 3-24 characters."),
    body("email").trim().isEmail().withMessage("A valid email address is required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
    body("bio").optional().isLength({ max: 180 }).withMessage("Bio must be 180 characters or fewer."),
    validateRequest,
  ],
  asyncHandler(register),
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("A valid email address is required."),
    body("password").notEmpty().withMessage("Password is required."),
    validateRequest,
  ],
  asyncHandler(login),
);

router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required."), validateRequest],
  asyncHandler(refresh),
);

router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(getCurrentUser));

export default router;
