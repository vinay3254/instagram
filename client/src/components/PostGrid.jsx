import { ChatCircle, Heart, Play } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import PostMedia from "./PostMedia";
import { formatCount } from "../utils/formatters";

export default function PostGrid({ posts = [], showPlay = false }) {
  if (!posts.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-[3px] md:gap-1">
      {posts.map((post) => (
        <Link key={post.id} to={`/p/${post.id}`} className="group relative overflow-hidden bg-[#0a0a0a]">
          <PostMedia
            post={post}
            className="aspect-square"
            autoPlay={post.mediaType === "video"}
            muted={post.mediaType === "video"}
            loop={post.mediaType === "video"}
          />
          <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/40" />
          <div className="absolute right-3 top-3 text-white">
            {showPlay || post.mediaType === "video" ? (
              <Play className="h-5 w-5 fill-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" weight="fill" />
            ) : null}
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition duration-300 group-hover:opacity-100">
            <div className="flex items-center gap-6 text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" weight="fill" />
                {formatCount(post.likesCount)}
              </span>
              <span className="flex items-center gap-1.5">
                <ChatCircle className="h-4 w-4" weight="fill" />
                {post.commentsCount}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
