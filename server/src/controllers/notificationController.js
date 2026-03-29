import Notification from "../models/Notification.js";
import { serializeNotification } from "../utils/serializers.js";

function buildNotificationQuery(userId, unreadOnly = false) {
  const query = { user: userId };

  if (unreadOnly) {
    query.read = false;
  }

  return Notification.find(query)
    .sort({ createdAt: -1 })
    .populate("actor", "username avatar bio")
    .populate("conversation")
    .populate({
      path: "post",
      select: "mediaUrl imageUrl mediaType caption author",
      populate: {
        path: "author",
        select: "username avatar",
      },
    });
}

export async function listNotifications(req, res) {
  const unreadOnly = req.query.unreadOnly === "true";
  const limit = Math.min(Number(req.query.limit || 30), 100);
  const [notifications, unreadCount] = await Promise.all([
    buildNotificationQuery(req.user._id, unreadOnly).limit(limit),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);

  return res.json({
    notifications: notifications.map((notification) => serializeNotification(notification)),
    unreadCount,
  });
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ message: "Notification not found." });
  }

  notification.read = true;
  await notification.save();

  return res.json({
    message: "Notification marked as read.",
  });
}

export async function markAllNotificationsRead(req, res) {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } },
  );

  return res.json({
    message: "Notifications marked as read.",
  });
}
