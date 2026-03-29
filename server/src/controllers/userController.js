import Post from "../models/Post.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notificationService.js";
import { serializePost, serializeUser } from "../utils/serializers.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAvatar(username) {
  return `https://i.pravatar.cc/200?u=${encodeURIComponent(username)}`;
}

async function getProfilePosts(userId, viewerId) {
  const posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "username avatar bio followers following")
    .populate({
      path: "comments",
      options: { sort: { createdAt: 1 } },
      populate: {
        path: "author",
        select: "username avatar",
      },
    });

  return posts.map((post) => serializePost(post, viewerId));
}

export async function getProfile(req, res) {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select("-refreshTokens");

  if (!user) {
    return res.status(404).json({ message: "Profile not found." });
  }

  const posts = await getProfilePosts(user._id, req.user?._id || null);
  const isFollowing = req.user ? user.followers.some((id) => String(id) === String(req.user._id)) : false;

  return res.json({
    user: {
      ...serializeUser(user),
      isFollowing,
      isCurrentUser: req.user ? String(user._id) === String(req.user._id) : false,
      postsCount: posts.length,
    },
    posts,
  });
}

export async function searchUsers(req, res) {
  const query = (req.query.q || "").trim();
  const limit = Math.min(Number(req.query.limit || 8), 20);
  const currentUserId = String(req.user._id);

  const userQuery = query
    ? {
        _id: { $ne: req.user._id },
        $or: [
          { username: { $regex: escapeRegex(query), $options: "i" } },
          { bio: { $regex: escapeRegex(query), $options: "i" } },
        ],
      }
    : { _id: { $ne: req.user._id } };

  const [users, posts] = await Promise.all([
    User.find(userQuery)
      .sort(query ? { username: 1 } : { createdAt: -1 })
      .limit(limit)
      .select("-refreshTokens"),
    query
      ? Post.find({
          caption: { $regex: escapeRegex(query), $options: "i" },
        })
          .sort({ createdAt: -1 })
          .limit(6)
          .populate("author", "username avatar bio followers following")
          .populate({
            path: "comments",
            options: { sort: { createdAt: 1 } },
            populate: {
              path: "author",
              select: "username avatar",
            },
          })
      : [],
  ]);

  return res.json({
    users: users.map((user) => ({
      ...serializeUser(user),
      isFollowing: Array.isArray(user.followers)
        ? user.followers.some((id) => String(id) === currentUserId)
        : false,
    })),
    posts: posts.map((post) => serializePost(post, req.user._id)),
  });
}

export async function updateProfile(req, res) {
  const nextUsername = req.body.username?.trim().toLowerCase();
  const nextBio = typeof req.body.bio === "string" ? req.body.bio.trim() : req.user.bio || "";
  const nextAvatar = typeof req.body.avatar === "string" ? req.body.avatar.trim() : req.user.avatar || "";
  const avatarFile = req.files?.avatarFile?.[0] || req.file;

  if (nextUsername && nextUsername !== req.user.username) {
    const existingUser = await User.findOne({
      username: nextUsername,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({ message: "That username is already taken." });
    }

    req.user.username = nextUsername;
  }

  req.user.bio = nextBio;

  if (avatarFile) {
    if (!avatarFile.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Profile pictures must be image files." });
    }

    req.user.avatar = `${req.protocol}://${req.get("host")}/uploads/${avatarFile.filename}`;
  } else if (nextAvatar) {
    req.user.avatar = nextAvatar;
  } else if (!req.user.avatar || req.user.avatar.includes("i.pravatar.cc/200?u=")) {
    req.user.avatar = buildAvatar(req.user.username);
  }

  await req.user.save();

  return res.json({
    message: "Profile updated successfully.",
    user: serializeUser(req.user),
  });
}

export async function toggleFollow(req, res) {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res.status(404).json({ message: "User not found." });
  }

  if (String(targetUser._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot follow your own account." });
  }

  const alreadyFollowing = targetUser.followers.some((id) => String(id) === String(req.user._id));

  if (alreadyFollowing) {
    targetUser.followers = targetUser.followers.filter((id) => String(id) !== String(req.user._id));
    req.user.following = req.user.following.filter((id) => String(id) !== String(targetUser._id));
  } else {
    targetUser.followers.push(req.user._id);
    req.user.following.push(targetUser._id);
  }

  await Promise.all([targetUser.save(), req.user.save()]);

  if (!alreadyFollowing) {
    await createNotification({
      userId: targetUser._id,
      actorId: req.user._id,
      type: "follow",
      message: `${req.user.username} started following you.`,
    });
  }

  return res.json({
    message: alreadyFollowing ? "User unfollowed." : "User followed.",
    following: !alreadyFollowing,
    followerCount: targetUser.followers.length,
  });
}
