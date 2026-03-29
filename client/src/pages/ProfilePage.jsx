import { FilmSlate, GridFour, TagSimple } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import api from "../api/client";
import EditProfileModal from "../components/EditProfileModal";
import PostGrid from "../components/PostGrid";
import StatusView from "../components/StatusView";
import { useAuth } from "../context/AuthContext";
import { formatCount } from "../utils/formatters";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: currentUser, refreshProfile } = useAuth();
  const { username } = useParams();
  const { openComposer, composerTick, showToast } = useOutletContext();
  const targetUsername = username || currentUser?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/users/${targetUsername}`);
      setProfile(data.user);
      setPosts(data.posts);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load the profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetUsername) {
      loadProfile();
    }
  }, [targetUsername, composerTick]);

  useEffect(() => {
    setActiveTab("posts");
  }, [targetUsername]);

  const handleFollowToggle = async () => {
    if (!profile || profile.isCurrentUser) return;

    try {
      setSubmitting(true);
      const { data } = await api.post(`/users/${profile.id}/follow`);
      setProfile((current) => ({
        ...current,
        isFollowing: data.following,
        followersCount: data.followerCount,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSave = async (nextProfile) => {
    try {
      setSubmitting(true);
      setEditError("");

      const formData = new FormData();
      formData.append("username", nextProfile.username.trim());
      formData.append("bio", nextProfile.bio.trim());
      formData.append("avatar", nextProfile.avatar.trim());

      if (nextProfile.avatarFile) {
        formData.append("avatarFile", nextProfile.avatarFile);
      }

      const { data } = await api.patch("/users/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUser = data.user;

      setProfile((current) => ({
        ...current,
        ...updatedUser,
        isCurrentUser: true,
      }));
      setPosts((current) =>
        current.map((post) => ({
          ...post,
          author: {
            ...post.author,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
          },
        })),
      );

      await refreshProfile();
      setEditOpen(false);
      showToast?.("Profile updated");

      if (updatedUser.username && updatedUser.username !== username) {
        navigate(`/profile/${updatedUser.username}`, { replace: true });
      }
    } catch (requestError) {
      setEditError(requestError.response?.data?.message || "Unable to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const reels = useMemo(() => posts.filter((post) => post.mediaType === "video"), [posts]);
  const visiblePosts = activeTab === "posts" ? posts : activeTab === "reels" ? reels : [];

  const tabs = [
    { id: "posts", label: "POSTS", icon: GridFour },
    { id: "reels", label: "REELS", icon: FilmSlate },
    { id: "tagged", label: "TAGGED", icon: TagSimple },
  ];

  if (loading && !profile) {
    return (
      <div className="mx-auto w-full max-w-[935px] px-4 md:px-8 lg:px-0">
        <StatusView loading title="Loading profile" copy="Fetching the user and post grid." />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto w-full max-w-[935px] px-4 md:px-8 lg:px-0">
        <StatusView title="Profile unavailable" copy={error} actionLabel="Try again" onAction={loadProfile} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[935px] px-4 pb-10 pt-6 md:px-8 md:pt-10 lg:px-0">
      <section>
        <div className="flex flex-col gap-8 md:grid md:grid-cols-[291px_minmax(0,1fr)] md:gap-4">
          <div className="flex justify-center md:justify-start md:pl-[34px]">
            <div className="story-ring p-[4px]">
              <div className="rounded-full bg-black p-[4px]">
                <img
                  src={profile?.avatar}
                  alt={profile?.username}
                  className="h-[96px] w-[96px] rounded-full object-cover md:h-[150px] md:w-[150px]"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-5 md:mt-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <h1 className="text-[28px] font-normal text-white">{profile?.username}</h1>
                <div className="flex flex-wrap gap-2">
                  {profile?.isCurrentUser ? (
                    <>
                      <button
                        onClick={() => {
                          setEditError("");
                          setEditOpen(true);
                        }}
                        className="ig-secondary-button"
                      >
                        Edit profile
                      </button>
                      <button className="ig-secondary-button">View archive</button>
                      <button onClick={openComposer} className="ig-secondary-button">
                        New post
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleFollowToggle}
                        disabled={submitting}
                        className={profile?.isFollowing ? "ig-secondary-button" : "ig-primary-button"}
                      >
                        {profile?.isFollowing ? "Following" : "Follow"}
                      </button>
                      <button className="ig-secondary-button">Message</button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-8 text-sm md:text-base">
                <span>
                  <strong className="mr-1 font-semibold text-white">{posts.length}</strong>
                  <span className="text-white">posts</span>
                </span>
                <span>
                  <strong className="mr-1 font-semibold text-white">
                    {formatCount(profile?.followersCount || 0)}
                  </strong>
                  <span className="text-white">followers</span>
                </span>
                <span>
                  <strong className="mr-1 font-semibold text-white">
                    {formatCount(profile?.followingCount || 0)}
                  </strong>
                  <span className="text-white">following</span>
                </span>
              </div>

              <div className="max-w-[420px] space-y-1">
                <p className="text-sm font-semibold text-white">{profile?.username}</p>
                <p className="text-sm leading-6 text-[#f5f5f5]">{profile?.bio || "No bio yet."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EditProfileModal
        open={editOpen}
        initialProfile={profile}
        submitting={submitting}
        error={editError}
        onClose={() => {
          if (!submitting) {
            setEditOpen(false);
            setEditError("");
          }
        }}
        onSave={handleProfileSave}
      />

      <section className="mt-10 border-t border-border">
        <div className="flex items-center justify-center gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-[0.08em] transition ${
                  active
                    ? "border-white text-white"
                    : "border-transparent text-[#a8a8a8] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" weight={active ? "fill" : "regular"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4">
          {visiblePosts.length ? (
            <PostGrid posts={visiblePosts} showPlay={activeTab === "reels"} />
          ) : (
            <StatusView
              title={
                activeTab === "reels"
                  ? "No reels yet"
                  : activeTab === "tagged"
                    ? "No tagged posts"
                    : "No posts yet"
              }
              copy={
                profile?.isCurrentUser
                  ? activeTab === "reels"
                    ? "Share your first video to start filling the reels tab."
                    : activeTab === "tagged"
                      ? "Tagged posts from other people would appear here."
                      : "Share your first image or video to start building the grid."
                  : activeTab === "tagged"
                    ? "This account has no tagged posts yet."
                    : "This profile has not shared anything yet."
              }
              actionLabel={profile?.isCurrentUser && activeTab !== "tagged" ? "Create a post" : undefined}
              onAction={profile?.isCurrentUser && activeTab !== "tagged" ? openComposer : undefined}
            />
          )}
        </div>
      </section>
    </div>
  );
}
