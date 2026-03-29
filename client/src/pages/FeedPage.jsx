import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api/client";
import CreateStoryModal from "../components/CreateStoryModal";
import PostCard from "../components/PostCard";
import StatusView from "../components/StatusView";
import StoryViewerModal from "../components/StoryViewerModal";
import StoriesBar from "../components/StoriesBar";
import { useAuth } from "../context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();
  const { openComposer, composerTick, savedPostIds, toggleSaved, sharePost, showToast } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [storyGroups, setStoryGroups] = useState([]);
  const [storyComposerOpen, setStoryComposerOpen] = useState(false);
  const [activeStoryGroupId, setActiveStoryGroupId] = useState("");

  const loadFeed = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      const { data } = await api.get(`/posts/feed?page=${page}&limit=10`);
      setPosts((current) => (append ? [...current, ...data.posts] : data.posts));
      setPagination(data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load the feed.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadStories = async () => {
    try {
      const { data } = await api.get("/stories/feed");
      setStoryGroups(data.storyGroups || []);
    } catch (requestError) {
      void requestError;
    }
  };

  useEffect(() => {
    loadFeed();
    loadStories();
  }, [composerTick]);

  const stories = useMemo(() => {
    return storyGroups;
  }, [storyGroups]);

  const suggestions = useMemo(() => {
    const seen = new Set([user?.username]);

    return posts
      .map((post) => post.author)
      .filter((author) => {
        if (!author?.username || seen.has(author.username)) {
          return false;
        }

        seen.add(author.username);
        return true;
      })
      .slice(0, 5);
  }, [posts, user]);

  const handleLikeToggle = async (postId) => {
    const { data } = await api.post(`/posts/${postId}/like`);
    setPosts((current) => current.map((post) => (post.id === postId ? data.post : post)));
  };

  const handleCommentSubmit = async (postId, text) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setPosts((current) => current.map((post) => (post.id === postId ? data.post : post)));
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to add comment.";
      showToast(message);
      throw new Error(message);
    }
  };

  const handleStoryViewed = (storyId, groupId) => {
    setStoryGroups((current) =>
      current.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        const stories = group.stories.map((story) =>
          story.id === storyId ? { ...story, isViewed: true } : story,
        );

        return {
          ...group,
          stories,
          hasUnviewed: stories.some((story) => !story.isViewed),
        };
      }),
    );
  };

  const handleStoryCreated = () => {
    setStoryComposerOpen(false);
    showToast("Story shared");
    loadStories();
  };

  if (loading && !posts.length) {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-4 lg:px-0">
        <StatusView
          loading
          title="Loading feed"
          copy="Fetching the latest posts from people you follow."
        />
      </div>
    );
  }

  if (error && !posts.length) {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-4 lg:px-0">
        <StatusView title="Feed unavailable" copy={error} actionLabel="Try again" onAction={() => loadFeed()} />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-4 lg:px-0">
        <StatusView
          title="Your feed is quiet"
          copy="Follow another account or create your first post to start filling the timeline."
          actionLabel="Create a post"
          onAction={openComposer}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[975px] justify-center gap-8 px-0 md:px-4 lg:px-8 xl:px-0">
      <section className="w-full max-w-[470px] space-y-4 pt-4 md:space-y-6 md:pt-8">
        <StoriesBar
          storyGroups={stories}
          currentUser={user}
          onOpenStoryGroup={setActiveStoryGroupId}
          onOpenCreateStory={() => setStoryComposerOpen(true)}
        />

        <div className="space-y-4 md:space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isSaved={savedPostIds.includes(post.id)}
              currentUsername={user?.username}
              onToggleSave={toggleSaved}
              onToggleLike={handleLikeToggle}
              onSubmitComment={handleCommentSubmit}
              onShare={sharePost}
            />
          ))}
        </div>

        {pagination?.hasMore ? (
          <button
            onClick={() => loadFeed((pagination?.page || 1) + 1, true)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a1a] disabled:opacity-60"
            disabled={loadingMore}
          >
            {loadingMore ? "Loading more..." : "Load more posts"}
          </button>
        ) : null}
      </section>

      <aside className="hidden w-[319px] shrink-0 xl:block">
        <div className="sticky top-8 pt-8">
          <div className="flex items-center gap-3">
            <img src={user?.avatar} alt={user?.username} className="h-14 w-14 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
              <p className="truncate text-sm text-[#a8a8a8]">{user?.bio || "New to the grid."}</p>
            </div>
            <button className="ml-auto text-xs font-semibold text-accent hover:text-accentSoft">Switch</button>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#a8a8a8]">Suggested for you</p>
              <button className="text-xs font-semibold text-white hover:text-[#a8a8a8]">See All</button>
            </div>

            <div className="space-y-4">
              {suggestions.length ? (
                suggestions.map((suggestion) => (
                  <div key={suggestion.username} className="flex items-center gap-3">
                    <img
                      src={suggestion.avatar}
                      alt={suggestion.username}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{suggestion.username}</p>
                      <p className="truncate text-xs text-[#a8a8a8]">Suggested for you</p>
                    </div>
                    <button className="ml-auto text-xs font-semibold text-accent hover:text-accentSoft">
                      Follow
                    </button>
                  </div>
                ))
              ) : (
                <button
                  onClick={openComposer}
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
                >
                  Share your first post
                </button>
              )}
            </div>

            <p className="mt-8 text-xs leading-5 text-[#737373]">
              About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.06em] text-[#737373]">
              © 2026 Instagram from Meta
            </p>
          </div>
        </div>
      </aside>

      <CreateStoryModal
        open={storyComposerOpen}
        onClose={() => setStoryComposerOpen(false)}
        onCreated={handleStoryCreated}
      />

      <StoryViewerModal
        open={Boolean(activeStoryGroupId)}
        storyGroups={storyGroups}
        initialGroupId={activeStoryGroupId}
        onClose={() => setActiveStoryGroupId("")}
        onStoryViewed={handleStoryViewed}
      />
    </div>
  );
}
