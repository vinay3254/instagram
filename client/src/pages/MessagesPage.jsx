import { MagnifyingGlass, PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import api from "../api/client";
import StatusView from "../components/StatusView";
import { formatTimestamp } from "../utils/formatters";

function sortConversations(items) {
  return [...items].sort((left, right) => {
    return new Date(right.lastMessageAt || 0).getTime() - new Date(left.lastMessageAt || 0).getTime();
  });
}

export default function MessagesPage() {
  const { showToast, refreshChrome } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const upsertConversation = (conversation) => {
    setConversations((current) => {
      const next = current.filter((entry) => entry.id !== conversation.id);
      next.unshift(conversation);
      return sortConversations(next);
    });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/messages/conversations");
      const nextConversations = sortConversations(data.conversations || []);
      setConversations(nextConversations);

      const requestedConversation = searchParams.get("conversation");
      const initialConversationId =
        requestedConversation && nextConversations.some((conversation) => conversation.id === requestedConversation)
          ? requestedConversation
          : nextConversations[0]?.id || "";

      setSelectedConversationId(initialConversationId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      const { data } = await api.get(`/messages/conversations/${conversationId}`);
      setSelectedConversation(data.conversation);
      setMessages(data.messages || []);
      upsertConversation(data.conversation);
      refreshChrome?.();
    } catch (requestError) {
      showToast(requestError.response?.data?.message || "Unable to open this conversation.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const requestedConversation = searchParams.get("conversation");

    if (requestedConversation && requestedConversation !== selectedConversationId) {
      setSelectedConversationId(requestedConversation);
    }
  }, [searchParams, selectedConversationId]);

  useEffect(() => {
    loadMessages(selectedConversationId);
    if (selectedConversationId) {
      setSearchParams({ conversation: selectedConversationId });
    }
  }, [selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return undefined;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const { data } = await api.get("/users/search", {
          params: { q: trimmedQuery, limit: 6 },
        });
        setSearchResults(data.users || []);
      } catch (requestError) {
        showToast(requestError.response?.data?.message || "Unable to search users.");
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleStartConversation = async (user) => {
    try {
      const { data } = await api.post("/messages/conversations", {
        participantId: user.id,
      });
      upsertConversation(data.conversation);
      setSelectedConversationId(data.conversation.id);
      setSearchQuery("");
      setSearchResults([]);
    } catch (requestError) {
      showToast(requestError.response?.data?.message || "Unable to start conversation.");
    }
  };

  const handleSendMessage = async () => {
    const text = messageDraft.trim();
    if (!text || !selectedConversationId) return;

    try {
      setSending(true);
      const { data } = await api.post(`/messages/conversations/${selectedConversationId}/messages`, { text });
      setMessages((current) => [...current, data.entry]);
      setMessageDraft("");
      upsertConversation(data.conversation);
      setSelectedConversation(data.conversation);
      refreshChrome?.();
    } catch (requestError) {
      showToast(requestError.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 lg:px-0">
        <StatusView loading title="Loading messages" copy="Pulling your conversations and unread state." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 lg:px-0">
        <StatusView title="Messages unavailable" copy={error} actionLabel="Try again" onAction={loadConversations} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-4 md:px-6 md:pt-8 lg:px-0">
      <div className="grid min-h-[calc(100dvh-140px)] overflow-hidden rounded-[28px] border border-border bg-surface lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="border-b border-border px-5 py-4">
            <h1 className="text-xl font-semibold text-white">Messages</h1>
            <div className="relative mt-4">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#737373]" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Start a conversation"
                className="ig-input pl-10"
              />
            </div>
          </div>

          {(searching || searchResults.length) && (
            <div className="border-b border-border px-3 py-3">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#737373]">
                New message
              </p>
              {searching ? (
                <p className="px-2 py-3 text-sm text-[#a8a8a8]">Searching users...</p>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartConversation(user)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-black/20"
                    >
                      <img src={user.avatar} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{user.username}</p>
                        <p className="truncate text-xs text-[#a8a8a8]">{user.bio || "Curated user"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="max-h-[680px] overflow-y-auto px-2 py-2">
            {conversations.length ? (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    selectedConversationId === conversation.id ? "bg-black/30" : "hover:bg-black/20"
                  }`}
                >
                  <img
                    src={conversation.counterpart?.avatar}
                    alt={conversation.counterpart?.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {conversation.counterpart?.username || "Conversation"}
                      </p>
                      <span className="text-xs text-[#737373]">{formatTimestamp(conversation.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-sm text-[#a8a8a8]">
                      {conversation.lastMessageText || "Say hello to start the thread."}
                    </p>
                  </div>
                  {conversation.unreadCount ? (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <StatusView
                title="No conversations yet"
                copy="Use the search field above to start a message thread."
              />
            )}
          </div>
        </aside>

        <section className="flex min-h-[560px] flex-col">
          {selectedConversation ? (
            <>
              <div className="border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConversation.counterpart?.avatar}
                    alt={selectedConversation.counterpart?.username}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {selectedConversation.counterpart?.username || "Conversation"}
                    </p>
                    <p className="text-sm text-[#a8a8a8]">
                      {selectedConversation.counterpart?.bio || "Direct thread"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {loadingMessages ? (
                  <StatusView loading title="Opening thread" copy="Fetching the latest messages." />
                ) : messages.length ? (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-[22px] px-4 py-3 text-sm ${
                            message.isOwn ? "bg-accent text-white" : "bg-black/30 text-[#f5f5f5]"
                          }`}
                        >
                          <p>{message.text}</p>
                          <p className={`mt-1 text-[11px] ${message.isOwn ? "text-white/70" : "text-[#a8a8a8]"}`}>
                            {formatTimestamp(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <StatusView title="No messages yet" copy="Send the first message to start the conversation." />
                )}
              </div>

              <div className="border-t border-border px-5 py-4">
                <div className="flex items-center gap-3 rounded-full border border-border bg-black/20 px-4 py-2">
                  <input
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Message..."
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#737373]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageDraft.trim() || sending}
                    className="rounded-full bg-accent p-2 text-white transition hover:bg-accentSoft disabled:opacity-60"
                  >
                    <PaperPlaneTilt className="h-5 w-5" weight="fill" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <StatusView
              title="Select a conversation"
              copy="Choose an existing thread or search for a user to start messaging."
            />
          )}
        </section>
      </div>
    </div>
  );
}
