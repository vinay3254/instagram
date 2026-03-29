import { BookmarkSimple, CaretLeft, ChatCircle, Heart, PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import api from "../api/client";
import PostMedia from "../components/PostMedia";
import StatusView from "../components/StatusView";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { sharePost as sharePostToSystem } from "../utils/sharePost";
import { formatCount, formatFullDate, formatTimestamp } from "../utils/formatters";

export default function PostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const outletContext = useOutletContext() || {};
  const { isAuthenticated } = useAuth();
  const [localSavedPostIds, setLocalSavedPostIds] = useLocalStorage("instagram-saved-posts", []);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [toast, setToast] = useState("");
  const commentInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const savedPostIds = outletContext.savedPostIds ?? localSavedPostIds;

  const showToast =
    outletContext.showToast ??
    ((message) => {
      setToast(message);

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = setTimeout(() => {
        setToast("");
      }, 1800);
    });

  const toggleSaved =
    outletContext.toggleSaved ??
    ((targetPostId) => {
      setLocalSavedPostIds((current) =>
        current.includes(targetPostId)
          ? current.filter((id) => id !== targetPostId)
          : [...current, targetPostId],
      );
    });

  const sharePost =
    outletContext.sharePost ??
    (async (targetPost) => {
      const message = await sharePostToSystem(targetPost);
      if (message) {
        showToast(message);
      }
    });

  const loadPost = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/posts/${postId}`);
      setPost(data.post);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load the post.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      showToast("Log in to like posts");
      navigate("/login");
      return;
    }

    const { data } = await api.post(`/posts/${post.id}/like`);
    setPost(data.post || post);
  };

  const handleCommentSubmit = async () => {
    const text = draft.trim();
    if (!text) return;

    if (!isAuthenticated) {
      showToast("Log in to comment on posts");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      setCommentError("");
      const { data } = await api.post(`/posts/${post.id}/comments`, { text });
      setPost(data.post || post);
      setDraft("");
      showToast("Comment posted");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to add comment.";
      setCommentError(message);
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !post) {
    return (
      <div className="mx-auto w-full max-w-[935px] px-4 md:px-8 lg:px-0">
        <StatusView loading title="Loading post" copy="Fetching the full detail view and comment thread." />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="mx-auto w-full max-w-[935px] px-4 md:px-8 lg:px-0">
        <StatusView title="Post unavailable" copy={error} actionLabel="Try again" onAction={loadPost} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[935px] px-0 pt-4 md:px-4 md:pt-8 lg:px-0">
      <div className="mb-4 px-4 md:px-0">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-[#a8a8a8] transition hover:text-white"
        >
          <CaretLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="overflow-hidden border-y border-border bg-surface md:rounded-lg md:border">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_405px]">
          <div className="flex min-h-[420px] items-center justify-center bg-black">
            <PostMedia
              post={post}
              className="h-full"
              controls={post.mediaType === "video"}
              muted={post.mediaType === "video"}
              autoPlay={post.mediaType === "video"}
              loop={post.mediaType === "video"}
            />
          </div>

          <div className="flex min-h-[620px] flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <img src={post.author.avatar} alt={post.author.username} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <Link to={`/profile/${post.author.username}`} className="text-sm font-semibold text-white">
                  {post.author.username}
                </Link>
                <p className="text-xs text-[#a8a8a8]">{formatFullDate(post.createdAt)}</p>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
              <div className="flex items-start gap-3">
                <img src={post.author.avatar} alt={post.author.username} className="h-8 w-8 rounded-full object-cover" />
                <div>
                  <p className="text-sm leading-6 text-white">
                    <span className="mr-2 font-semibold">{post.author.username}</span>
                    <span className="text-[#f5f5f5]">{post.caption}</span>
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#737373]">
                    {formatTimestamp(post.createdAt)}
                  </p>
                </div>
              </div>

              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <p className="text-sm leading-6 text-white">
                    <span className="mr-2 font-semibold">{comment.author.username}</span>
                    <span className="text-[#f5f5f5]">{comment.text}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={handleLikeToggle} className="action-button -ml-2 p-1.5">
                    <Heart
                      size={26}
                      className={post.isLiked ? "text-[#ff3040]" : "text-white"}
                      weight={post.isLiked ? "fill" : "regular"}
                    />
                  </button>
                  <button onClick={() => commentInputRef.current?.focus()} className="action-button p-1.5">
                    <ChatCircle size={26} />
                  </button>
                  <button onClick={() => sharePost(post)} className="action-button p-1.5">
                    <PaperPlaneTilt size={26} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      showToast("Log in to save posts");
                      navigate("/login");
                      return;
                    }

                    toggleSaved(post.id);
                  }}
                  className="action-button -mr-2 p-1.5"
                >
                  <BookmarkSimple size={24} weight={savedPostIds.includes(post.id) ? "fill" : "regular"} />
                </button>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">{formatCount(post.likesCount)} likes</p>
              <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#737373]">
                {formatFullDate(post.createdAt)}
              </p>

              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <input
                  ref={commentInputRef}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    if (commentError) {
                      setCommentError("");
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#737373]"
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={!draft.trim() || submitting}
                  className="text-sm font-semibold text-accent transition hover:text-accentSoft disabled:text-[#4f4f4f]"
                >
                  Post
                </button>
              </div>
              {commentError ? <p className="mt-2 text-xs text-[#ff7d91]">{commentError}</p> : null}
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-[#1f1f1f] px-4 py-2 text-sm font-medium text-white shadow-lifted">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
