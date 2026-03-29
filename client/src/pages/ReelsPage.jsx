import { BookmarkSimple, ChatCircle, Heart, PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import api from "../api/client";
import PostMedia from "../components/PostMedia";
import StatusView from "../components/StatusView";
import { useAuth } from "../context/AuthContext";
import { formatCount, formatTimestamp } from "../utils/formatters";

export default function ReelsPage() {
  const { user } = useAuth();
  const { savedPostIds, toggleSaved, sharePost, showToast } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadReels = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      const { data } = await api.get(`/posts/reels?page=${page}&limit=6`);
      setPosts((current) => (append ? [...current, ...data.posts] : data.posts));
      setPagination(data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load reels.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadReels();
  }, []);

  const handleLikeToggle = async (postId) => {
    const { data } = await api.post(`/posts/${postId}/like`);
    setPosts((current) => current.map((post) => (post.id === postId ? data.post : post)));
  };

  if (loading && !posts.length) {
    return (
      <div className="mx-auto w-full max-w-[980px] px-4 md:px-6 lg:px-0">
        <StatusView loading title="Loading reels" copy="Pulling the latest video posts from the API." />
      </div>
    );
  }

  if (error && !posts.length) {
    return (
      <div className="mx-auto w-full max-w-[980px] px-4 md:px-6 lg:px-0">
        <StatusView title="Reels unavailable" copy={error} actionLabel="Try again" onAction={() => loadReels()} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[980px] px-4 pb-10 pt-4 md:px-6 md:pt-8 lg:px-0">
      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-lifted"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)]">
              <div className="bg-black">
                <PostMedia
                  post={post}
                  className="aspect-[9/16] w-full"
                  autoPlay
                  muted
                  controls
                  loop
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                  <img src={post.author.avatar} alt={post.author.username} className="h-11 w-11 rounded-full object-cover" />
                  <div className="min-w-0">
                    <Link to={`/profile/${post.author.username}`} className="truncate text-sm font-semibold text-white">
                      {post.author.username}
                    </Link>
                    <p className="truncate text-sm text-[#a8a8a8]">
                      {post.author.username === user?.username ? "Your reel" : "Video post"} · {formatTimestamp(post.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 px-5 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleLikeToggle(post.id)} className="action-button -ml-2 p-1.5">
                        <Heart
                          size={28}
                          className={post.isLiked ? "text-[#ff3040]" : "text-white"}
                          weight={post.isLiked ? "fill" : "regular"}
                        />
                      </button>
                      <Link to={`/p/${post.id}`} className="action-button p-1.5">
                        <ChatCircle size={28} />
                      </Link>
                      <button onClick={() => sharePost(post)} className="action-button p-1.5">
                        <PaperPlaneTilt size={28} />
                      </button>
                    </div>

                    <button onClick={() => toggleSaved(post.id)} className="action-button -mr-2 p-1.5">
                      <BookmarkSimple size={26} weight={savedPostIds.includes(post.id) ? "fill" : "regular"} />
                    </button>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-white">{formatCount(post.likesCount)} likes</p>
                  <p className="mt-2 text-sm leading-6 text-[#f5f5f5]">
                    <Link to={`/profile/${post.author.username}`} className="mr-2 font-semibold text-white">
                      {post.author.username}
                    </Link>
                    {post.caption}
                  </p>

                  <div className="mt-4 rounded-2xl border border-border bg-black/20 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Comments</h3>
                      <Link to={`/p/${post.id}`} className="text-xs font-semibold text-accent hover:text-accentSoft">
                        Open thread
                      </Link>
                    </div>

                    {post.comments?.length ? (
                      <div className="space-y-3">
                        {post.comments.slice(-2).map((comment) => (
                          <div key={comment.id} className="text-sm text-[#f5f5f5]">
                            <span className="mr-2 font-semibold text-white">{comment.author.username}</span>
                            {comment.text}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#a8a8a8]">
                        No comments yet. Start the thread from the post detail view.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {pagination?.hasMore ? (
        <button
          onClick={() => loadReels((pagination?.page || 1) + 1, true)}
          className="mt-6 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a1a] disabled:opacity-60"
          disabled={loadingMore}
        >
          {loadingMore ? "Loading more..." : "Load more reels"}
        </button>
      ) : null}
    </div>
  );
}
