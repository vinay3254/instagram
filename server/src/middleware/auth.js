import jwt from "jsonwebtoken";
import User from "../models/User.js";

async function resolveUserFromHeader(header) {
  const [, token] = (header || "").split(" ");

  if (!token) {
    return null;
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.sub).select("-password -refreshTokens");
  return user || null;
}

export async function requireAuth(req, res, next) {
  try {
    const user = await resolveUserFromHeader(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export async function attachUserIfPresent(req, _res, next) {
  try {
    const user = await resolveUserFromHeader(req.headers.authorization || "");
    if (user) {
      req.user = user;
    }
  } catch (error) {
    void error;
  }

  next();
}
