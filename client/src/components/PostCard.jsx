import { BookmarkSimple, ChatCircle, DotsThree, Heart, PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PostMedia from "./PostMedia";
import { cn } from "../utils/cn";
import { formatCount, formatTimestamp } from "../utils/formatters";

export default function PostCard({
  post,
  isSaved,
  currentUsername,
  onToggleSave,
  onToggleLike,
  onSubmitComment,
  onShare,
}) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bursting, setBursting] = useState(false);
  const burstTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (burstTimeoutRef.current) {
        clearTimeout(burstTimeoutRef.current);
      }
    };
  }, []);

  const triggerHeartBurst = () => {
    setBursting(true);

    if (burstTimeoutRef.current) {
      clearTimeout(burstTimeoutRef.current);
    }

    burstTimeoutRef.current = setTimeout(() => {
      setBursting(false);
    }, 650);
  };

  const handleMediaDoubleClick = async () => {
    triggerHeartBurst();

    if (!post.isLiked) {
      try {
        await onToggleLike(post.id);
      } catch (requestError) {
        void requestError;
      }
    }
  };

  const handleSubmit = async () => {
    const text = draft.trim();
    if (!text) return;

    try {
      setSubmitting(true);
      setError("");
      await onSubmitComment(post.id, text);
      setDraft("");
    } catch (requestError) {
      setError(requestError.message || "Unable to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="border-b border-border bg-black md:rounded-lg md:border md:bg-surface">
      <header className="flex items-center justify-between px-3 py-3.5">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author.username}`}>
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="h-8 w-8 rounded-full object-cover"
            />
          </Link>
          <div className="flex items-center gap-1.5 text-sm">
            <Link to={`/profile/${post.author.username}`} className="font-semibold text-white">
              {post.author.username}
            </Link>
            {post.author.username !== currentUsername ? (
              <>
                <span className="text-[#737373]">&bull;</span>
                <button className="font-semibold text-accent hover:text-accentSoft">Follow</button>
              </>
            ) : null}
          </div>
        </div>
        <button className="action-button">
          <DotsThree className="h-5 w-5" weight="bold" />
        </button>
      </header>

      <div className="relative bg-black" onDoubleClick={handleMediaDoubleClick}>
        <Link to={`/p/${post.id}`} className="block bg-black">
          <PostMedia
            post={post}
            className="aspect-square"
            autoPlay={post.mediaType === "video"}
            muted={post.mediaType === "video"}
            loop={post.mediaType === "video"}
            controls={false}
          />
        </Link>

        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center transition duration-300",
            bursting ? "opacity-100" : "opacity-0",
          )}
        >
          <Heart
            size={94}
            weight="fill"
            className={cn(
              "text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition duration-500",
              bursting ? "scale-100" : "scale-50",
            )}
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onToggleLike(post.id)} className="action-button -ml-2 p-1.5">
              <Heart
                className={post.isLiked ? "text-[#ff3040]" : "text-white"}
                weight={post.isLiked ? "fill" : "regular"}
                size={26}
              />
            </button>
            <Link to={`/p/${post.id}`} className="action-button p-1.5">
              <ChatCircle size={26} />
            </Link>
            <button onClick={() => onShare(post)} className="action-button p-1.5">
              <PaperPlaneTilt size={26} />
            </button>
          </div>

          <button onClick={() => onToggleSave(post.id)} className="action-button -mr-2 p-1.5">
            <BookmarkSimple size={24} weight={isSaved ? "fill" : "regular"} />
          </button>
        </div>

        <p className="mt-2 text-sm font-semibold text-white">{formatCount(post.likesCount)} likes</p>

        <p className="mt-1.5 text-sm leading-5 text-white">
          <Link to={`/profile/${post.author.username}`} className="mr-2 font-semibold">
            {post.author.username}
          </Link>
          <span className="text-[#f5f5f5]">{post.caption}</span>
        </p>

        {post.comments?.length ? (
          <Link to={`/p/${post.id}`} className="mt-1.5 block text-sm text-[#a8a8a8] hover:text-white/80">
            View all {post.commentsCount} comments
          </Link>
        ) : null}

        {post.comments?.[post.comments.length - 1] ? (
          <p className="mt-1 text-sm text-[#f5f5f5]">
            <span className="mr-2 font-semibold text-white">
              {post.comments[post.comments.length - 1].author.username}
            </span>
            {post.comments[post.comments.length - 1].text}
          </p>
        ) : null}

        <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[#737373]">
          {formatTimestamp(post.createdAt)}
        </p>

        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) {
                setError("");
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#737373]"
          />
          <button
            onClick={handleSubmit}
            disabled={!draft.trim() || submitting}
            className="text-sm font-semibold text-accent transition hover:text-accentSoft disabled:text-[#4f4f4f]"
          >
            Post
          </button>
        </div>

        {error ? <p className="mt-2 text-xs text-[#ff7d91]">{error}</p> : null}
      </div>
    </article>
  );
}
