import Notification from "../models/Notification.js";

export async function createNotification({
  userId,
  actorId,
  type,
  postId = null,
  conversationId = null,
  message = "",
}) {
  if (!userId || !actorId || String(userId) === String(actorId)) {
    return null;
  }

  return Notification.create({
    user: userId,
    actor: actorId,
    type,
    post: postId,
    conversation: conversationId,
    message,
  });
}
