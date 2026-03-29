import { ArrowClockwise } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api/client";
import StatusView from "../components/StatusView";
import { formatTimestamp } from "../utils/formatters";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { showToast, refreshChrome } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markReadLocally = (notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  };

  const handleMarkAllRead = async () => {
    try {
      setSubmitting(true);
      await api.post("/notifications/read-all");
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      setUnreadCount(0);
      refreshChrome?.();
      showToast("Notifications marked as read");
    } catch (requestError) {
      showToast(requestError.response?.data?.message || "Unable to mark notifications as read.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      try {
        await api.post(`/notifications/${notification.id}/read`);
        markReadLocally(notification.id);
        refreshChrome?.();
      } catch (requestError) {
        showToast(requestError.response?.data?.message || "Unable to update notification state.");
      }
    }

    if (notification.type === "message" && notification.conversationId) {
      navigate(`/messages?conversation=${notification.conversationId}`);
      return;
    }

    if (notification.post?.id) {
      navigate(`/p/${notification.post.id}`);
      return;
    }

    if (notification.actor?.username) {
      navigate(`/profile/${notification.actor.username}`);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[920px] px-4 md:px-6 lg:px-0">
        <StatusView loading title="Loading notifications" copy="Gathering follows, likes, comments, and messages." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[920px] px-4 md:px-6 lg:px-0">
        <StatusView title="Notifications unavailable" copy={error} actionLabel="Try again" onAction={loadNotifications} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 pb-10 pt-4 md:px-6 md:pt-8 lg:px-0">
      <section className="overflow-hidden rounded-[28px] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Notifications</h1>
            <p className="mt-1 text-sm text-[#a8a8a8]">
              {unreadCount ? `${unreadCount} unread updates` : "You're all caught up"}
            </p>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={!unreadCount || submitting}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/20 disabled:opacity-50"
          >
            <ArrowClockwise className="h-4 w-4" />
            Mark all read
          </button>
        </div>

        {notifications.length ? (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleOpenNotification(notification)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-black/20"
              >
                <div className="relative">
                  <img
                    src={notification.actor?.avatar}
                    alt={notification.actor?.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  {!notification.read ? (
                    <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-accent" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6 text-[#f5f5f5]">
                    <span className="mr-2 font-semibold text-white">{notification.actor?.username}</span>
                    {notification.message || "sent you an update."}
                  </p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#737373]">
                    {formatTimestamp(notification.createdAt)}
                  </p>
                </div>
                {notification.post ? (
                  notification.post.mediaType === "video" ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-[11px] font-semibold text-white">
                      Reel
                    </div>
                  ) : (
                    <img
                      src={notification.post.mediaUrl}
                      alt={notification.post.caption || "Notification post"}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  )
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8">
            <StatusView
              title="No notifications yet"
              copy="Likes, comments, follows, and direct messages will appear here."
            />
          </div>
        )}
      </section>
    </div>
  );
}
