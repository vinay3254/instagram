import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notificationService.js";
import { serializeConversation, serializeMessage } from "../utils/serializers.js";

async function hydrateConversation(conversationId, viewerId) {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: viewerId,
  }).populate("participants", "username avatar bio");

  if (!conversation) {
    return null;
  }

  const unreadCount = await Message.countDocuments({
    conversation: conversation._id,
    sender: { $ne: viewerId },
    readBy: { $ne: viewerId },
  });

  conversation.unreadCount = unreadCount;
  return conversation;
}

export async function listConversations(req, res) {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "username avatar bio");

  const hydratedConversations = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await Message.countDocuments({
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      });

      conversation.unreadCount = unreadCount;
      return conversation;
    }),
  );

  return res.json({
    conversations: hydratedConversations.map((conversation) => serializeConversation(conversation, req.user._id)),
  });
}

export async function startConversation(req, res) {
  const username = req.body.username?.trim().toLowerCase();
  const participantId = req.body.participantId;

  const participant = participantId
    ? await User.findById(participantId)
    : await User.findOne({ username });

  if (!participant) {
    return res.status(404).json({ message: "User not found." });
  }

  if (String(participant._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot message yourself." });
  }

  let conversation = await Conversation.findOne({
    $and: [
      { participants: { $all: [req.user._id, participant._id] } },
      { participants: { $size: 2 } },
    ],
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, participant._id],
      lastMessageText: "",
      lastMessageAt: new Date(),
    });
  }

  const hydratedConversation = await hydrateConversation(conversation._id, req.user._id);

  return res.status(201).json({
    message: "Conversation ready.",
    conversation: serializeConversation(hydratedConversation, req.user._id),
  });
}

export async function getConversationMessages(req, res) {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user._id,
  }).populate("participants", "username avatar bio");

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found." });
  }

  await Message.updateMany(
    {
      conversation: conversation._id,
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    },
    {
      $addToSet: { readBy: req.user._id },
    },
  );

  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .populate("sender", "username avatar bio");

  const hydratedConversation = await hydrateConversation(conversation._id, req.user._id);

  return res.json({
    conversation: serializeConversation(hydratedConversation, req.user._id),
    messages: messages.map((message) => serializeMessage(message, req.user._id)),
  });
}

export async function sendMessage(req, res) {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user._id,
  }).populate("participants", "username avatar bio");

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found." });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: req.body.text,
    readBy: [req.user._id],
  });

  conversation.lastMessageText = message.text;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  const recipients = conversation.participants.filter((participant) => String(participant._id) !== String(req.user._id));

  await Promise.all(
    recipients.map((recipient) =>
      createNotification({
        userId: recipient._id,
        actorId: req.user._id,
        type: "message",
        conversationId: conversation._id,
        message: `${req.user.username}: ${message.text.slice(0, 80)}`,
      }),
    ),
  );

  const hydratedMessage = await Message.findById(message._id).populate("sender", "username avatar bio");
  const hydratedConversation = await hydrateConversation(conversation._id, req.user._id);

  return res.status(201).json({
    message: "Message sent.",
    conversation: serializeConversation(hydratedConversation, req.user._id),
    entry: serializeMessage(hydratedMessage, req.user._id),
  });
}
