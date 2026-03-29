import Story from "../models/Story.js";
import { serializeStory } from "../utils/serializers.js";

function buildStoryUrl(req, file) {
  return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
}

function getStoryExpiration() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

async function populateStories(query) {
  return query.populate("author", "username avatar bio followers following");
}

export async function getStoryFeed(req, res) {
  const authorIds = [...new Set([String(req.user._id), ...req.user.following.map((id) => String(id))])];
  const stories = await populateStories(
    Story.find({
      author: { $in: authorIds },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }),
  );

  const groupsMap = new Map();

  stories.forEach((story) => {
    const authorId = String(story.author?._id || story.author);

    if (!groupsMap.has(authorId)) {
      groupsMap.set(authorId, {
        id: authorId,
        author: {
          id: story.author?._id,
          username: story.author?.username,
          avatar: story.author?.avatar,
          bio: story.author?.bio,
        },
        stories: [],
        latestCreatedAt: story.createdAt,
      });
    }

    groupsMap.get(authorId).stories.push(serializeStory(story, req.user._id));
  });

  const storyGroups = [...groupsMap.values()]
    .map((group) => ({
      ...group,
      stories: [...group.stories].sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      ),
    }))
    .map((group) => ({
      ...group,
      hasUnviewed: group.stories.some((story) => !story.isViewed),
    }))
    .sort((left, right) => new Date(right.latestCreatedAt).getTime() - new Date(left.latestCreatedAt).getTime());

  return res.json({ storyGroups });
}

export async function createStory(req, res) {
  const uploadedFile = req.files?.media?.[0] || req.file;

  if (!uploadedFile) {
    return res.status(400).json({ message: "An image or video upload is required for stories." });
  }

  const mediaType = uploadedFile.mimetype.startsWith("video/") ? "video" : "image";

  const story = await Story.create({
    author: req.user._id,
    mediaUrl: buildStoryUrl(req, uploadedFile),
    mediaType,
    caption: req.body.caption || "",
    expiresAt: getStoryExpiration(),
  });

  const hydratedStory = await populateStories(Story.findById(story._id));

  return res.status(201).json({
    message: "Story created successfully.",
    story: serializeStory(hydratedStory, req.user._id),
  });
}

export async function markStoryViewed(req, res) {
  const story = await populateStories(
    Story.findOne({
      _id: req.params.id,
      expiresAt: { $gt: new Date() },
    }),
  );

  if (!story) {
    return res.status(404).json({ message: "Story not found." });
  }

  const alreadyViewed = story.viewers.some((entry) => String(entry.user) === String(req.user._id));

  if (!alreadyViewed) {
    story.viewers.push({
      user: req.user._id,
      viewedAt: new Date(),
    });
    await story.save();
  }

  return res.json({
    message: "Story view recorded.",
    story: serializeStory(story, req.user._id),
  });
}
