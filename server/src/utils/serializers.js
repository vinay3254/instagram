export function serializeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    followersCount: Array.isArray(user.followers) ? user.followers.length : user.followersCount || 0,
    followingCount: Array.isArray(user.following) ? user.following.length : user.followingCount || 0,
    followers: user.followers,
    following: user.following,
    createdAt: user.createdAt,
  };
}

function serializeMinimalUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
  };
}

export function serializeComment(comment) {
  return {
    id: comment._id,
    text: comment.text,
    createdAt: comment.createdAt,
    author: comment.author
      ? {
          id: comment.author._id,
          username: comment.author.username,
          avatar: comment.author.avatar,
        }
      : null,
  };
}

export function serializePost(post, viewerId = null) {
  const viewer = viewerId ? String(viewerId) : null;
  const likes = Array.isArray(post.likes) ? post.likes.map((like) => String(like)) : [];
  const mediaUrl = post.mediaUrl || post.imageUrl || "";
  const mediaType = post.mediaType || "image";

  return {
    id: post._id,
    imageUrl: mediaUrl,
    mediaUrl,
    mediaType,
    caption: post.caption,
    createdAt: post.createdAt,
    likesCount: likes.length,
    commentsCount: Array.isArray(post.comments) ? post.comments.length : post.commentsCount || 0,
    isLiked: viewer ? likes.includes(viewer) : false,
    author: post.author
      ? {
          id: post.author._id,
          username: post.author.username,
          avatar: post.author.avatar,
          bio: post.author.bio,
          followersCount: Array.isArray(post.author.followers) ? post.author.followers.length : 0,
          followingCount: Array.isArray(post.author.following) ? post.author.following.length : 0,
        }
      : null,
    comments: Array.isArray(post.comments)
      ? post.comments.map((comment) => serializeComment(comment))
      : [],
  };
}

export function serializeConversation(conversation, viewerId = null) {
  const viewer = viewerId ? String(viewerId) : null;
  const participants = Array.isArray(conversation.participants)
    ? conversation.participants.map((participant) => serializeMinimalUser(participant))
    : [];

  return {
    id: conversation._id,
    participants,
    counterpart: viewer
      ? participants.find((participant) => String(participant?.id) !== viewer) || participants[0] || null
      : participants[0] || null,
    lastMessageText: conversation.lastMessageText || "",
    lastMessageAt: conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt,
    unreadCount: conversation.unreadCount || 0,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export function serializeMessage(message, viewerId = null) {
  const viewer = viewerId ? String(viewerId) : null;
  const senderId = message.sender?._id || message.sender;

  return {
    id: message._id,
    text: message.text,
    createdAt: message.createdAt,
    conversationId: message.conversation?._id || message.conversation,
    isOwn: viewer ? String(senderId) === viewer : false,
    sender: serializeMinimalUser(message.sender),
    readBy: Array.isArray(message.readBy) ? message.readBy.map((entry) => String(entry)) : [],
  };
}

export function serializeNotification(notification) {
  return {
    id: notification._id,
    type: notification.type,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
    actor: serializeMinimalUser(notification.actor),
    post: notification.post
      ? {
          id: notification.post._id,
          mediaUrl: notification.post.mediaUrl || notification.post.imageUrl || "",
          mediaType: notification.post.mediaType || "image",
          caption: notification.post.caption || "",
        }
      : null,
    conversationId: notification.conversation?._id || notification.conversation || null,
  };
}

export function serializeStory(story, viewerId = null) {
  const viewer = viewerId ? String(viewerId) : null;
  const viewers = Array.isArray(story.viewers) ? story.viewers : [];

  return {
    id: story._id,
    mediaUrl: story.mediaUrl,
    mediaType: story.mediaType || "image",
    caption: story.caption || "",
    createdAt: story.createdAt,
    expiresAt: story.expiresAt,
    viewedCount: viewers.length,
    isViewed: viewer
      ? viewers.some((entry) => String(entry.user?._id || entry.user) === viewer)
      : false,
    author: serializeMinimalUser(story.author),
  };
}
