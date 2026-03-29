import bcrypt from "bcrypt";
import User from "../models/User.js";
import { serializeUser } from "../utils/serializers.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

function buildAvatar(username) {
  return `https://i.pravatar.cc/200?u=${encodeURIComponent(username)}`;
}

async function issueTokensForUser(user) {
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  user.refreshTokens = [...(user.refreshTokens || []), hashedRefreshToken];
  await user.save();

  return { accessToken, refreshToken };
}

export async function register(req, res) {
  const { username, email, password, bio = "" } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    return res.status(409).json({ message: "A user with that email or username already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    bio,
    avatar: buildAvatar(username),
  });

  const tokens = await issueTokensForUser(user);
  const safeUser = await User.findById(user._id);

  return res.status(201).json({
    message: "Account created successfully.",
    ...tokens,
    user: serializeUser(safeUser),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const tokens = await issueTokensForUser(user);
  const safeUser = await User.findById(user._id);

  return res.json({
    message: "Logged in successfully.",
    ...tokens,
    user: serializeUser(safeUser),
  });
}

export async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required." });
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    return res.status(401).json({ message: "Refresh token is invalid or expired." });
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");

  if (!user || !Array.isArray(user.refreshTokens) || user.refreshTokens.length === 0) {
    return res.status(401).json({ message: "Refresh token is no longer valid." });
  }

  let matchedToken = null;

  for (const hashedToken of user.refreshTokens) {
    const match = await bcrypt.compare(refreshToken, hashedToken);
    if (match) {
      matchedToken = hashedToken;
      break;
    }
  }

  if (!matchedToken) {
    return res.status(401).json({ message: "Refresh token is no longer valid." });
  }

  user.refreshTokens = user.refreshTokens.filter((token) => token !== matchedToken);
  const tokens = await issueTokensForUser(user);

  return res.json({
    message: "Session refreshed.",
    ...tokens,
    user: serializeUser(user),
  });
}

export async function logout(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.json({ message: "Logged out." });
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    return res.json({ message: "Logged out." });
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");

  if (user?.refreshTokens?.length) {
    const remainingTokens = [];

    for (const hashedToken of user.refreshTokens) {
      const match = await bcrypt.compare(refreshToken, hashedToken);
      if (!match) {
        remainingTokens.push(hashedToken);
      }
    }

    user.refreshTokens = remainingTokens;
    await user.save();
  }

  return res.json({ message: "Logged out." });
}

export async function getCurrentUser(req, res) {
  return res.json({
    user: serializeUser(req.user),
  });
}
