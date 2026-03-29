import { ChatCircle, FilmSlate, Heart } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import PostMedia from "../components/PostMedia";
import StatusView from "../components/StatusView";
import { formatCount } from "../utils/formatters";

const spans = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-2",
];

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadExplore = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      const { data } = await api.get(`/posts/explore?page=${page}&limit=18`);
      setPosts((current) => (append ? [...current, ...data.posts] : data.posts));
      setPagination(data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load explore.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadExplore();
  }, []);

  if (loading && !posts.length) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-4 lg:px-0">
        <StatusView loading title="Loading explore" copy="Pulling the public grid from the API." />
      </div>
    );
  }

  if (error && !posts.length) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-4 lg:px-0">
        <StatusView title="Explore unavailable" copy={error} actionLabel="Try again" onAction={() => loadExplore()} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[935px] px-0 pt-4 md:px-4 md:pt-8 lg:px-0">
      <div className="grid grid-cols-3 auto-rows-[116px] gap-[3px] sm:auto-rows-[140px] md:auto-rows-[180px] lg:auto-rows-[210px]">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            to={`/p/${post.id}`}
            className={`group relative overflow-hidden bg-[#0a0a0a] ${spans[index % spans.length]}`}
          >
            <PostMedia
              post={post}
              className="h-full transition duration-500 group-hover:scale-[1.04]"
              autoPlay={post.mediaType === "video"}
              muted={post.mediaType === "video"}
              loop={post.mediaType === "video"}
            />
            <div className="absolute right-3 top-3 text-white">
              {post.mediaType === "video" ? (
                <FilmSlate className="h-5 w-5 drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]" weight="fill" />
              ) : null}
            </div>
            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/55" />
            <div className="absolute inset-0 hidden items-center justify-center gap-7 text-white opacity-0 transition duration-300 group-hover:flex group-hover:opacity-100">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Heart className="h-5 w-5" weight="fill" />
                {formatCount(post.likesCount)}
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <ChatCircle className="h-5 w-5" weight="fill" />
                {post.commentsCount}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {pagination?.hasMore ? (
        <button
          onClick={() => loadExplore((pagination?.page || 1) + 1, true)}
          className="mt-6 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
          disabled={loadingMore}
        >
          {loadingMore ? "Loading more..." : "Load more from explore"}
        </button>
      ) : null}
    </div>
  );
}
