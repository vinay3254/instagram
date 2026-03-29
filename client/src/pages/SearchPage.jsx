import { MagnifyingGlass } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import PostGrid from "../components/PostGrid";
import StatusView from "../components/StatusView";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResults = async (nextQuery = "") => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/users/search", {
        params: nextQuery ? { q: nextQuery } : {},
      });
      setUsers(data.users || []);
      setPosts(data.posts || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to search right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadResults(query.trim());
    }, query.trim() ? 260 : 0);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-10 pt-4 md:px-6 md:pt-8 lg:px-0">
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h1 className="text-xl font-semibold text-white">Search</h1>
            <div className="relative mt-4">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#737373]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users or captions"
                className="ig-input pl-10"
              />
            </div>
          </div>

          <div className="max-h-[620px] overflow-y-auto px-3 py-3">
            {loading && !users.length ? (
              <StatusView loading title="Searching" copy="Looking through users and recent activity." />
            ) : error ? (
              <StatusView title="Search unavailable" copy={error} actionLabel="Try again" onAction={() => loadResults(query.trim())} />
            ) : users.length ? (
              <div className="space-y-1">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-black/20"
                  >
                    <img src={user.avatar} alt={user.username} className="h-12 w-12 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user.username}</p>
                      <p className="truncate text-sm text-[#a8a8a8]">{user.bio || "Instagram user"}</p>
                    </div>
                    {user.isFollowing ? (
                      <span className="ml-auto rounded-full bg-black px-3 py-1 text-xs font-semibold text-[#a8a8a8]">
                        Following
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <StatusView
                title={query.trim() ? "No matches yet" : "Start searching"}
                copy={
                  query.trim()
                    ? "Try a different username or caption keyword."
                    : "Search the people and posts already in your database."
                }
              />
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {query.trim() ? "Matching posts" : "Suggested posts"}
              </h2>
              <p className="mt-1 text-sm text-[#a8a8a8]">
                {query.trim()
                  ? "Caption matches from the current post library."
                  : "Recent posts to help you jump back into the feed."}
              </p>
            </div>
          </div>

          {loading && !posts.length ? (
            <div className="rounded-2xl border border-border bg-surface p-8">
              <StatusView loading title="Loading posts" copy="Pulling related posts for this search." />
            </div>
          ) : posts.length ? (
            <PostGrid posts={posts} />
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-8">
              <StatusView
                title={query.trim() ? "No post matches" : "Posts will appear here"}
                copy={
                  query.trim()
                    ? "Try a broader keyword to find more captions."
                    : "Enter a search term to surface matching posts."
                }
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
