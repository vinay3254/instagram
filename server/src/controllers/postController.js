import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { createNotification } from "../utils/notificationService.js";
import { serializeComment, serializePost } from "../utils/serializers.js";

function buildPagination(page, limit, total) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

function populatePosts(query) {
  return query
    .populate("author", "username avatar bio followers following")
    .populate({
      path: "comments",
      options: { sort: { createdAt: 1 } },
      populate: {
        path: "author",
        select: "username avatar",
      },
    });
}

export async function getFeed(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 10), 20);
  const authorIds = [...new Set([String(req.user._id), ...req.user.following.map((id) => String(id))])];

  const query = { author: { $in: authorIds } };
  const total = await Post.countDocuments(query);
  const posts = await populatePosts(
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  );

  return res.json({
    posts: posts.map((post) => serializePost(post, req.user._id)),
    pagination: buildPagination(page, limit, total),
  });
}

export async function getExplore(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 18), 36);
  const total = await Post.countDocuments();
  const posts = await populatePosts(
    Post.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  );

  return res.json({
    posts: posts.map((post) => serializePost(post, req.user?._id || null)),
    pagination: buildPagination(page, limit, total),
  });
}

export async function getReels(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 8), 12);
  const query = { mediaType: "video" };
  const total = await Post.countDocuments(query);
  const posts = await populatePosts(
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  );

  return res.json({
    posts: posts.map((post) => serializePost(post, req.user?._id || null)),
    pagination: buildPagination(page, limit, total),
  });
}

export async function getPostById(req, res) {
  const post = await populatePosts(Post.findById(req.params.id).orFail(() => {
    const error = new Error("Post not found.");
    error.statusCode = 404;
    throw error;
  }));

  return res.json({
    post: serializePost(post, req.user?._id || null),
  });
}

export async function createPost(req, res) {
  const uploadedFile = req.files?.media?.[0] || req.files?.image?.[0] || req.file;

  if (!uploadedFile) {
    return res.status(400).json({ message: "An image or video upload is required." });
  }

  const mediaUrl = `${req.protocol}://${req.get("host")}/uploads/${uploadedFile.filename}`;
  const mediaType = uploadedFile.mimetype.startsWith("video/") ? "video" : "image";
  const post = await Post.create({
    author: req.user._id,
    imageUrl: mediaUrl,
    mediaUrl,
    mediaType,
    caption: req.body.caption || "",
  });

  const hydratedPost = await populatePosts(Post.findById(post._id));

  return res.status(201).json({
    message: "Post created successfully.",
    post: serializePost(hydratedPost, req.user._id),
  });
}

export async function toggleLike(req, res) {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  const userId = String(req.user._id);
  const existingLike = post.likes.find((id) => String(id) === userId);

  if (existingLike) {
    post.likes = post.likes.filter((id) => String(id) !== userId);
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();
  const hydratedPost = await populatePosts(Post.findById(post._id));

  if (!existingLike) {
    await createNotification({
      userId: post.author,
      actorId: req.user._id,
      type: "like",
      postId: post._id,
      message: `${req.user.username} liked your post.`,
    });
  }

  return res.json({
    message: existingLike ? "Like removed." : "Post liked.",
    liked: !existingLike,
    likesCount: hydratedPost.likes.length,
    post: serializePost(hydratedPost, req.user._id),
  });
}

export async function addComment(req, res) {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  const comment = await Comment.create({
    author: req.user._id,
    post: post._id,
    text: req.body.text,
  });

  post.comments.push(comment._id);
  await post.save();

  const hydratedComment = await Comment.findById(comment._id).populate("author", "username avatar");
  const hydratedPost = await populatePosts(Post.findById(post._id));

  await createNotification({
    userId: post.author,
    actorId: req.user._id,
    type: "comment",
    postId: post._id,
    message: `${req.user.username} commented on your post.`,
  });

  return res.status(201).json({
    message: "Comment added.",
    comment: serializeComment(hydratedComment),
    post: serializePost(hydratedPost, req.user._id),
  });
}
