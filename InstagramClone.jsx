"use client";

import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  Aperture,
  Bookmark,
  Clapperboard,
  Compass,
  Film,
  Grid3X3,
  Heart,
  Home,
  ImagePlus,
  MessageCircle,
  MoreHorizontal,
  Play,
  Search,
  Send,
  SquarePlus,
  Tag,
  User,
  X,
} from "lucide-react";

const CURRENT_USER = {
  username: "aria.rain",
  name: "Aria Rain Mercer",
  bio: "Creative direction, after-hours film stills, and too much espresso. Based in Brooklyn.",
  avatar: "https://i.pravatar.cc/150?img=32",
};

const INITIAL_POSTS = [
  {
    id: "post-1",
    user: {
      username: "noor.vas",
      name: "Noor Vasquez",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    location: "SoHo, New York",
    image: "https://picsum.photos/seed/ig-noor-soho/1200/1200",
    caption: "Late light on Mercer Street and a little quiet before the city gets loud again.",
    likes: 18342,
    isLiked: false,
    isSaved: false,
    timestamp: "42 MINUTES AGO",
    comments: [
      { id: "c-1", username: "ivyharlow", text: "The shadows here are perfect." },
      { id: "c-2", username: "milo.hale", text: "Every frame feels like a campaign shoot." },
      { id: "c-3", username: "sable.ito", text: "That storefront glow is unreal." },
    ],
  },
  {
    id: "post-2",
    user: {
      username: "aria.rain",
      name: "Aria Rain Mercer",
      avatar: CURRENT_USER.avatar,
    },
    location: "Williamsburg, Brooklyn",
    image: "https://picsum.photos/seed/ig-aria-rooftop/1200/1200",
    caption: "Blueprints, coffee rings, and one clean skyline before the edit suite calls.",
    likes: 9467,
    isLiked: true,
    isSaved: true,
    timestamp: "1 HOUR AGO",
    comments: [
      { id: "c-4", username: "julesmarlow", text: "This feels like a magazine cover." },
      { id: "c-5", username: "keon.patch", text: "Need the full set from this roof." },
    ],
  },
  {
    id: "post-3",
    user: {
      username: "sable.ito",
      name: "Sable Ito",
      avatar: "https://i.pravatar.cc/150?img=21",
    },
    location: "Shinjuku, Tokyo",
    image: "https://picsum.photos/seed/ig-sable-neon/1200/1500",
    caption: "Neon reflections, midnight ramen, and the kind of rain that turns the street into a screen.",
    likes: 27481,
    isLiked: false,
    isSaved: false,
    timestamp: "3 HOURS AGO",
    comments: [
      { id: "c-6", username: "noor.vas", text: "The color grading here is wild." },
      { id: "c-7", username: "lina.halberg", text: "You always find the perfect corner." },
      { id: "c-8", username: "aria.rain", text: "Bookmarking this mood forever." },
    ],
  },
  {
    id: "post-4",
    user: {
      username: "julesmarlow",
      name: "Jules Marlow",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    location: "Silver Lake, Los Angeles",
    image: "https://picsum.photos/seed/ig-jules-palm/1200/1400",
    caption: "A striped umbrella, a warm curb, and five minutes of sunlight worth keeping.",
    likes: 8125,
    isLiked: false,
    isSaved: true,
    timestamp: "5 HOURS AGO",
    comments: [
      { id: "c-9", username: "mae.carr", text: "This palette is all I want for summer." },
      { id: "c-10", username: "aria.rain", text: "The diagonal lines are so good." },
    ],
  },
  {
    id: "post-5",
    user: {
      username: "keon.patch",
      name: "Keon Patch",
      avatar: "https://i.pravatar.cc/150?img=48",
    },
    location: "Design District, Miami",
    image: "https://picsum.photos/seed/ig-keon-concrete/1200/1200",
    caption: "Brutalist corners and a little heat shimmer across the concrete.",
    likes: 12488,
    isLiked: false,
    isSaved: false,
    timestamp: "7 HOURS AGO",
    comments: [
      { id: "c-11", username: "ivyharlow", text: "That texture is doing all the work." },
      { id: "c-12", username: "noor.vas", text: "This is so clean it hurts." },
      { id: "c-13", username: "aria.rain", text: "You made gray feel expensive." },
    ],
  },
  {
    id: "post-6",
    user: {
      username: "mae.carr",
      name: "Mae Carrington",
      avatar: "https://i.pravatar.cc/150?img=44",
    },
    location: "Le Marais, Paris",
    image: "https://picsum.photos/seed/ig-mae-window/1200/1500",
    caption: "Morning table, paper stack, one crooked tulip. Enough said.",
    likes: 22190,
    isLiked: true,
    isSaved: false,
    timestamp: "9 HOURS AGO",
    comments: [
      { id: "c-14", username: "sable.ito", text: "You always know when to leave space." },
      { id: "c-15", username: "julesmarlow", text: "The tulip tilt is perfect." },
    ],
  },
  {
    id: "post-7",
    user: {
      username: "aria.rain",
      name: "Aria Rain Mercer",
      avatar: CURRENT_USER.avatar,
    },
    location: "Chelsea, New York",
    image: "https://picsum.photos/seed/ig-aria-studio/1200/1200",
    caption: "Print wall getting louder, which usually means the final cut is close.",
    likes: 13305,
    isLiked: false,
    isSaved: false,
    timestamp: "12 HOURS AGO",
    comments: [
      { id: "c-16", username: "keon.patch", text: "That print wall is a work of art itself." },
      { id: "c-17", username: "mae.carr", text: "Would frame this whole studio." },
    ],
  },
  {
    id: "post-8",
    user: {
      username: "lina.halberg",
      name: "Lina Halberg",
      avatar: "https://i.pravatar.cc/150?img=30",
    },
    location: "Gamla Stan, Stockholm",
    image: "https://picsum.photos/seed/ig-lina-stone/1200/1500",
    caption: "Old stone, cold sky, and the kind of blue hour that stays with you all week.",
    likes: 16892,
    isLiked: false,
    isSaved: false,
    timestamp: "15 HOURS AGO",
    comments: [
      { id: "c-18", username: "aria.rain", text: "This one stopped me mid-scroll." },
      { id: "c-19", username: "julesmarlow", text: "The depth here is unreal." },
    ],
  },
  {
    id: "post-9",
    user: {
      username: "dominiccosta",
      name: "Dominic Costa",
      avatar: "https://i.pravatar.cc/150?img=54",
    },
    location: "North End, Boston",
    image: "https://picsum.photos/seed/ig-dominic-night/1200/1200",
    caption: "Night market noise, blurred headlights, and enough grain to keep it honest.",
    likes: 7316,
    isLiked: false,
    isSaved: true,
    timestamp: "18 HOURS AGO",
    comments: [
      { id: "c-20", username: "lina.halberg", text: "The motion blur is beautiful." },
      { id: "c-21", username: "noor.vas", text: "Feels like a scene from the second act." },
      { id: "c-22", username: "aria.rain", text: "This noise texture is so good." },
    ],
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: "n-1",
    avatar: "https://i.pravatar.cc/150?img=21",
    text: "sable.ito liked your post.",
    time: "5m",
    postId: "post-2",
  },
  {
    id: "n-2",
    avatar: "https://i.pravatar.cc/150?img=12",
    text: "noor.vas started following you.",
    time: "18m",
    postId: "post-1",
  },
  {
    id: "n-3",
    avatar: "https://i.pravatar.cc/150?img=8",
    text: "julesmarlow mentioned you in a comment.",
    time: "1h",
    postId: "post-4",
  },
  {
    id: "n-4",
    avatar: "https://i.pravatar.cc/150?img=48",
    text: "keon.patch saved your reel to a collection.",
    time: "4h",
    postId: "post-7",
  },
  {
    id: "n-5",
    avatar: "https://i.pravatar.cc/150?img=44",
    text: "mae.carr liked a comment from you.",
    time: "9h",
    postId: "post-6",
  },
];

const MOCK_THREADS = [
  {
    id: "t-1",
    user: {
      username: "noor.vas",
      name: "Noor Vasquez",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    time: "2m",
    unread: 2,
    lastMessage: "Still thinking about that SoHo frame.",
    messages: [
      { id: "m-1", from: "them", text: "Still thinking about that SoHo frame." },
      { id: "m-2", from: "me", text: "Same. The light did all the heavy lifting." },
      { id: "m-3", from: "them", text: "Send the full contact sheet when you can." },
    ],
  },
  {
    id: "t-2",
    user: {
      username: "julesmarlow",
      name: "Jules Marlow",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    time: "46m",
    unread: 0,
    lastMessage: "The print wall looks incredible.",
    messages: [
      { id: "m-4", from: "them", text: "The print wall looks incredible." },
      { id: "m-5", from: "me", text: "Wait until you see the final sequence." },
    ],
  },
  {
    id: "t-3",
    user: {
      username: "lina.halberg",
      name: "Lina Halberg",
      avatar: "https://i.pravatar.cc/150?img=30",
    },
    time: "3h",
    unread: 1,
    lastMessage: "Blue hour tomorrow again if you're out early.",
    messages: [
      { id: "m-6", from: "them", text: "Blue hour tomorrow again if you're out early." },
      { id: "m-7", from: "me", text: "Set an alarm already. I am not missing it." },
      { id: "m-8", from: "them", text: "Meet by the bridge at 6:12?" },
    ],
  },
];

const REEL_SPANS = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
];

const PROFILE_TABS = [
  { id: "posts", label: "Posts", icon: Grid3X3 },
  { id: "reels", label: "Reels", icon: Film },
  { id: "tagged", label: "Tagged", icon: Tag },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");

const compactNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value % 1000000 >= 100000 ? 1 : 0)}m`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 >= 100 ? 1 : 0)}k`;
  }

  return value.toLocaleString();
};

const postsReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_LIKE":
      return state.map((post) => {
        if (post.id !== action.postId) return post;
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likes: isLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      });
    case "SET_LIKED":
      return state.map((post) => {
        if (post.id !== action.postId || post.isLiked) return post;
        return {
          ...post,
          isLiked: true,
          likes: post.likes + 1,
        };
      });
    case "TOGGLE_SAVE":
      return state.map((post) => {
        if (post.id !== action.postId) return post;
        return {
          ...post,
          isSaved: !post.isSaved,
        };
      });
    case "ADD_COMMENT":
      return state.map((post) => {
        if (post.id !== action.postId) return post;
        return {
          ...post,
          comments: [...post.comments, action.comment],
        };
      });
    case "ADD_POST":
      return [action.post, ...state];
    default:
      return state;
  }
};

function SidebarButton({ icon: Icon, label, active, collapsed, avatar, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "group flex w-full items-center rounded-2xl px-3 py-3 text-left text-white transition-all duration-300 hover:bg-white/[0.06] active:scale-[0.985]",
        active && "bg-white/[0.08]",
      )}
    >
      <div className="flex h-7 w-7 items-center justify-center">
        {avatar ? (
          <img
            src={avatar}
            alt={label}
            className={cx(
              "h-7 w-7 rounded-full object-cover ring-2 transition-all duration-300",
              active ? "ring-white" : "ring-white/15",
            )}
          />
        ) : (
          <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 2} />
        )}
      </div>
      {!collapsed ? (
        <span className={cx("ml-4 text-[16px]", active ? "font-semibold" : "font-normal")}>
          {label}
        </span>
      ) : null}
    </button>
  );
}

function StoryBubble({ story, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex min-w-[76px] flex-col items-center gap-2 text-center active:scale-[0.98]"
    >
      <div className="rounded-full bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976] p-[2px] transition duration-300 group-hover:scale-[1.03]">
        <div className="rounded-full bg-black p-[2px]">
          <img
            src={story.avatar}
            alt={story.username}
            className="h-[60px] w-[60px] rounded-full object-cover"
          />
        </div>
      </div>
      <span className="max-w-[76px] truncate text-[12px] text-white/80">{story.username}</span>
    </button>
  );
}

function EmptyState({ title, copy }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[#121212] px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black">
        <Aperture className="h-7 w-7 text-white/80" strokeWidth={1.8} />
      </div>
      <h3 className="text-[22px] font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/55">{copy}</p>
    </div>
  );
}

function ProfileTabButton({ tab, active, onClick }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex items-center gap-2 border-t px-4 py-3 text-xs uppercase tracking-[0.18em] transition-all duration-300",
        active
          ? "border-white text-white"
          : "border-transparent text-white/45 hover:text-white/80",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.9} />
      <span>{tab.label}</span>
    </button>
  );
}

function PostCard({
  post,
  isFollowing,
  onToggleFollow,
  onOpenPost,
  onImageClick,
  onImageDoubleClick,
  onToggleLike,
  onToggleSave,
  onShare,
  bursting,
}) {
  const previewComment = post.comments[0];

  return (
    <article className="border-b border-white/10 pb-6 md:rounded-[26px] md:border md:bg-[#121212] md:shadow-[0_0_0_1px_rgba(255,255,255,0.025)]">
      <div className="flex items-center justify-between px-3 py-3 md:px-4">
        <div className="flex items-center gap-3">
          <img
            src={post.user.avatar}
            alt={post.user.username}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-white">{post.user.username}</span>
              <span className="text-white/30">•</span>
              <span className="text-[12px] text-white/50">{post.location}</span>
            </div>
          </div>
        </div>

        {post.user.username !== CURRENT_USER.username ? (
          <button
            onClick={() => onToggleFollow(post.user.username)}
            className={cx(
              "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-300 active:scale-[0.98]",
              isFollowing
                ? "bg-white/[0.08] text-white/70 hover:bg-white/[0.12]"
                : "text-[#4ea8ff] hover:text-[#8cc8ff]",
            )}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        ) : (
          <button
            onClick={() => onOpenPost(post.id)}
            className="rounded-full p-2 text-white/70 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.96]"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <div
        className="relative cursor-pointer overflow-hidden bg-black"
        onClick={() => onImageClick(post.id)}
        onDoubleClick={() => onImageDoubleClick(post.id)}
      >
        <img src={post.image} alt={post.caption} className="aspect-square w-full object-cover" />

        <div
          className={cx(
            "pointer-events-none absolute inset-0 flex items-center justify-center transition duration-500",
            bursting ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="absolute h-28 w-28 rounded-full bg-white/10 animate-ping" />
          <div className="absolute h-20 w-20 rounded-full border border-white/25" />
          <Heart
            className={cx(
              "h-24 w-24 drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all duration-500",
              bursting ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
            fill="white"
            strokeWidth={1.9}
          />
        </div>
      </div>

      <div className="px-3 pt-3 md:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onToggleLike(post.id)}
              className="text-white transition duration-200 hover:opacity-75 active:scale-[0.96]"
            >
              <Heart
                className={cx(
                  "h-6 w-6",
                  post.isLiked ? "fill-[#ff3040] text-[#ff3040]" : "text-white",
                )}
                strokeWidth={2}
              />
            </button>
            <button
              onClick={() => onOpenPost(post.id)}
              className="text-white transition duration-200 hover:opacity-75 active:scale-[0.96]"
            >
              <MessageCircle className="h-6 w-6" strokeWidth={2} />
            </button>
            <button
              onClick={() => onShare(post)}
              className="text-white transition duration-200 hover:opacity-75 active:scale-[0.96]"
            >
              <Send className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>

          <button
            onClick={() => onToggleSave(post.id)}
            className="text-white transition duration-200 hover:opacity-75 active:scale-[0.96]"
          >
            <Bookmark
              className={cx("h-6 w-6", post.isSaved ? "fill-white text-white" : "text-white")}
              strokeWidth={2}
            />
          </button>
        </div>

        <p className="mt-3 text-[14px] font-semibold text-white">{post.likes.toLocaleString()} likes</p>

        <p className="mt-2 text-[14px] leading-6 text-white">
          <span className="mr-2 font-semibold">{post.user.username}</span>
          <span className="text-white/85">{post.caption}</span>
        </p>

        {post.comments.length > 0 ? (
          <button
            onClick={() => onOpenPost(post.id)}
            className="mt-2 block text-left text-[14px] text-white/55 transition hover:text-white/85"
          >
            View all {post.comments.length} comments
          </button>
        ) : null}

        {previewComment ? (
          <button
            onClick={() => onOpenPost(post.id)}
            className="mt-1 block text-left text-[14px] leading-6 text-white/70 transition hover:text-white"
          >
            <span className="mr-2 font-semibold text-white">{previewComment.username}</span>
            <span>{previewComment.text}</span>
          </button>
        ) : null}

        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">{post.timestamp}</p>
      </div>
    </article>
  );
}

export default function InstagramClone() {
  const [posts, dispatch] = useReducer(postsReducer, INITIAL_POSTS);
  const [currentPage, setCurrentPage] = useState("feed");
  const [activePanel, setActivePanel] = useState(null);
  const [profileTab, setProfileTab] = useState("posts");
  const [followingUsers, setFollowingUsers] = useState({
    "mae.carr": true,
    "julesmarlow": true,
  });
  const [postModalId, setPostModalId] = useState(null);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [createImage, setCreateImage] = useState(null);
  const [createCaption, setCreateCaption] = useState("");
  const [createError, setCreateError] = useState("");
  const [heartBursts, setHeartBursts] = useState({});
  const [toast, setToast] = useState("");
  const [activeThreadId, setActiveThreadId] = useState(MOCK_THREADS[0].id);
  const [activeReelId, setActiveReelId] = useState(INITIAL_POSTS[2].id);

  const fileInputRef = useRef(null);
  const postClickTimerRef = useRef(null);
  const modalTimeoutsRef = useRef({});
  const burstTimeoutsRef = useRef({});
  const toastTimeoutRef = useRef(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === postModalId) || null,
    [postModalId, posts],
  );

  const stories = useMemo(() => {
    const seen = new Set();
    const items = [];
    [CURRENT_USER, ...posts.map((post) => post.user)].forEach((user) => {
      if (!seen.has(user.username)) {
        seen.add(user.username);
        items.push(user);
      }
    });
    return items.slice(0, 8);
  }, [posts]);

  const suggestedCreators = useMemo(() => {
    const unique = [];
    const seen = new Set([CURRENT_USER.username]);
    posts.forEach((post) => {
      if (!seen.has(post.user.username)) {
        seen.add(post.user.username);
        unique.push(post.user);
      }
    });
    return unique.slice(0, 5);
  }, [posts]);

  const currentUserPosts = useMemo(
    () => posts.filter((post) => post.user.username === CURRENT_USER.username),
    [posts],
  );

  const taggedPosts = useMemo(
    () => posts.filter((post) => post.caption.toLowerCase().includes(`@${CURRENT_USER.username}`)),
    [posts],
  );

  const filteredSearchResults = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return posts.slice(0, 6);
    return posts.filter((post) => {
      return (
        post.user.username.toLowerCase().includes(term) ||
        post.user.name.toLowerCase().includes(term) ||
        post.caption.toLowerCase().includes(term) ||
        post.location.toLowerCase().includes(term)
      );
    });
  }, [posts, searchQuery]);

  const activeThread = useMemo(
    () => MOCK_THREADS.find((thread) => thread.id === activeThreadId) || MOCK_THREADS[0],
    [activeThreadId],
  );

  const reelPosts = useMemo(() => posts.slice(0, 6), [posts]);
  const activeReel = useMemo(
    () => reelPosts.find((post) => post.id === activeReelId) || reelPosts[0] || null,
    [activeReelId, reelPosts],
  );

  const profileStats = useMemo(
    () => ({
      posts: currentUserPosts.length,
      followers: 12842,
      following: 387,
    }),
    [currentUserPosts.length],
  );

  const isOverlayActive = Boolean(activePanel || postModalId || createModalOpen);

  const showToast = (message) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast("");
    }, 1600);
  };

  const openPostModal = (postId) => {
    if (!postId) return;
    if (modalTimeoutsRef.current.post) clearTimeout(modalTimeoutsRef.current.post);
    setPostModalId(postId);
    setActivePanel(null);
  };

  const closePostModal = () => {
    setPostModalVisible(false);
    modalTimeoutsRef.current.post = setTimeout(() => {
      setPostModalId(null);
    }, 180);
  };

  const resetCreateComposer = () => {
    setCreateCaption("");
    setCreateImage(null);
    setCreateError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateModal = () => {
    if (modalTimeoutsRef.current.create) clearTimeout(modalTimeoutsRef.current.create);
    setCreateModalOpen(true);
    setActivePanel(null);
    setDragActive(false);
    setCreateError("");
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
    modalTimeoutsRef.current.create = setTimeout(() => {
      setCreateModalOpen(false);
      resetCreateComposer();
    }, 180);
  };

  const triggerHeartBurst = (postId) => {
    setHeartBursts((current) => ({ ...current, [postId]: true }));
    if (burstTimeoutsRef.current[postId]) {
      clearTimeout(burstTimeoutsRef.current[postId]);
    }
    burstTimeoutsRef.current[postId] = setTimeout(() => {
      setHeartBursts((current) => {
        const next = { ...current };
        delete next[postId];
        return next;
      });
    }, 850);
  };

  const handleImageSingleClick = (postId) => {
    if (postClickTimerRef.current) clearTimeout(postClickTimerRef.current);
    postClickTimerRef.current = setTimeout(() => {
      openPostModal(postId);
    }, 220);
  };

  const handleImageDoubleClick = (postId) => {
    if (postClickTimerRef.current) clearTimeout(postClickTimerRef.current);
    dispatch({ type: "SET_LIKED", postId });
    triggerHeartBurst(postId);
  };

  const togglePanel = (panel) => {
    setCurrentPage((current) => (panel === "search" || panel === "notifications" ? current : "feed"));
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const handleNavAction = (item) => {
    if (item === "search" || item === "notifications") {
      togglePanel(item);
      return;
    }

    if (item === "create") {
      openCreateModal();
      return;
    }

    setActivePanel(null);

    if (item === "home") setCurrentPage("feed");
    if (item === "explore") setCurrentPage("explore");
    if (item === "reels") setCurrentPage("reels");
    if (item === "messages") setCurrentPage("messages");
    if (item === "profile") setCurrentPage("profile");
  };

  const handleShare = async (post) => {
    const link = `https://instagram.com/p/${post.id}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        showToast("Link copied");
        return;
      }
    } catch (error) {
      void error;
    }

    showToast("Share sheet ready");
  };

  const handleToggleFollow = (username) => {
    setFollowingUsers((current) => ({ ...current, [username]: !current[username] }));
  };

  const handleCommentSubmit = (postId) => {
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;

    dispatch({
      type: "ADD_COMMENT",
      postId,
      comment: {
        id: `${postId}-${Date.now()}`,
        username: CURRENT_USER.username,
        text,
      },
    });

    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    showToast("Comment added");
  };

  const loadImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setCreateError("Choose an image file to continue.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCreateImage({ name: file.name, preview: String(reader.result) });
      setCreateError("");
    };
    reader.readAsDataURL(file);
  };

  const handleComposerShare = () => {
    if (!createImage) {
      setCreateError("Add a photo before sharing.");
      return;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      user: {
        username: CURRENT_USER.username,
        name: CURRENT_USER.name,
        avatar: CURRENT_USER.avatar,
      },
      location: "Shared from Instagram Web",
      image: createImage.preview,
      caption: createCaption.trim() || "Freshly shared from the workspace.",
      likes: 0,
      isLiked: false,
      isSaved: false,
      timestamp: "JUST NOW",
      comments: [],
    };

    dispatch({ type: "ADD_POST", post: newPost });
    setCurrentPage("feed");
    closeCreateModal();
    showToast("Post shared");
  };

  const desktopNavItems = [
    { id: "home", label: "Home", icon: Home, active: currentPage === "feed" && !activePanel },
    { id: "search", label: "Search", icon: Search, active: activePanel === "search" },
    { id: "explore", label: "Explore", icon: Compass, active: currentPage === "explore" },
    { id: "reels", label: "Reels", icon: Clapperboard, active: currentPage === "reels" },
    { id: "messages", label: "Messages", icon: Send, active: currentPage === "messages" },
    {
      id: "notifications",
      label: "Notifications",
      icon: Heart,
      active: activePanel === "notifications",
    },
    { id: "create", label: "Create", icon: SquarePlus, active: createModalOpen },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      avatar: CURRENT_USER.avatar,
      active: currentPage === "profile",
    },
  ];

  const mobileNavItems = [
    { id: "home", icon: Home, active: currentPage === "feed" && !activePanel },
    { id: "search", icon: Search, active: activePanel === "search" },
    { id: "create", icon: SquarePlus, active: createModalOpen },
    { id: "reels", icon: Clapperboard, active: currentPage === "reels" },
    { id: "profile", icon: User, active: currentPage === "profile", avatar: CURRENT_USER.avatar },
  ];

  useEffect(() => {
    if (!postModalId) return;
    const frame = window.requestAnimationFrame(() => {
      setPostModalVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [postModalId]);

  useEffect(() => {
    if (!createModalOpen) return;
    const frame = window.requestAnimationFrame(() => {
      setCreateModalVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [createModalOpen]);

  useEffect(() => {
    if (activeReel) return;
    setActiveReelId(reelPosts[0]?.id || null);
  }, [activeReel, reelPosts]);

  useEffect(() => {
    document.body.style.overflow = isOverlayActive ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOverlayActive]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (postModalId) {
        closePostModal();
        return;
      }
      if (createModalOpen) {
        closeCreateModal();
        return;
      }
      if (activePanel) setActivePanel(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activePanel, createModalOpen, postModalId]);

  useEffect(() => {
    return () => {
      if (postClickTimerRef.current) clearTimeout(postClickTimerRef.current);
      if (modalTimeoutsRef.current.post) clearTimeout(modalTimeoutsRef.current.post);
      if (modalTimeoutsRef.current.create) clearTimeout(modalTimeoutsRef.current.create);
      Object.values(burstTimeoutsRef.current).forEach((timeout) => clearTimeout(timeout));
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const renderFeed = () => {
    return (
      <div className="mx-auto flex w-full max-w-[1180px] gap-8 px-0 md:px-6 xl:px-10">
        <section className="w-full max-w-[630px]">
          <div className="mb-4 border-b border-white/10 px-4 py-4 md:mb-6 md:rounded-[26px] md:border md:bg-[#121212] md:px-5">
            <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {stories.map((story) => (
                <StoryBubble
                  key={story.username}
                  story={story}
                  onClick={() => {
                    if (story.username === CURRENT_USER.username) {
                      openCreateModal();
                      return;
                    }
                    const post = posts.find((item) => item.user.username === story.username);
                    if (post) openPostModal(post.id);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isFollowing={Boolean(followingUsers[post.user.username])}
                onToggleFollow={handleToggleFollow}
                onOpenPost={openPostModal}
                onImageClick={handleImageSingleClick}
                onImageDoubleClick={handleImageDoubleClick}
                onToggleLike={(postId) => dispatch({ type: "TOGGLE_LIKE", postId })}
                onToggleSave={(postId) => dispatch({ type: "TOGGLE_SAVE", postId })}
                onShare={handleShare}
                bursting={Boolean(heartBursts[post.id])}
              />
            ))}
          </div>
        </section>

        <aside className="sticky top-0 hidden h-[100dvh] w-[320px] shrink-0 pt-10 xl:block">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.username}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <p className="text-[14px] font-semibold text-white">{CURRENT_USER.username}</p>
                <p className="text-[14px] text-white/50">{CURRENT_USER.name}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#121212] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-white/55">Suggested for you</h3>
                <button
                  onClick={() => setCurrentPage("explore")}
                  className="text-[12px] font-semibold text-white"
                >
                  See All
                </button>
              </div>

              <div className="space-y-4">
                {suggestedCreators.map((creator) => (
                  <div key={creator.username} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={creator.avatar}
                        alt={creator.username}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-[14px] font-semibold text-white">{creator.username}</p>
                        <p className="text-[12px] text-white/45">Suggested for you</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFollow(creator.username)}
                      className="text-[12px] font-semibold text-[#4ea8ff] transition hover:text-[#8cc8ff]"
                    >
                      {followingUsers[creator.username] ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs leading-6 text-white/25">
              About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language
              <br />
              <span className="mt-3 inline-block">© 2026 Instagram from Meta</span>
            </p>
          </div>
        </aside>
      </div>
    );
  };

  const renderExplore = () => {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-0 md:px-6 xl:px-10">
        <div className="grid grid-cols-3 auto-rows-[110px] gap-[3px] md:auto-rows-[170px]">
          {posts.map((post, index) => (
            <button
              key={post.id}
              onClick={() => openPostModal(post.id)}
              className={cx(
                "group relative overflow-hidden bg-[#121212] active:scale-[0.99]",
                REEL_SPANS[index % REEL_SPANS.length],
              )}
            >
              <img
                src={post.image}
                alt={post.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/55" />
              <div className="absolute inset-0 hidden items-center justify-center gap-8 text-white opacity-0 transition duration-300 group-hover:flex group-hover:opacity-100">
                <div className="flex items-center gap-2 text-[17px] font-semibold">
                  <Heart className="h-5 w-5 fill-white text-white" strokeWidth={2} />
                  <span>{compactNumber(post.likes)}</span>
                </div>
                <div className="flex items-center gap-2 text-[17px] font-semibold">
                  <MessageCircle className="h-5 w-5 fill-white text-white" strokeWidth={2} />
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderProfileGrid = (items, showPlay = false) => {
    if (!items.length) {
      return (
        <EmptyState
          title="Nothing here yet"
          copy="This tab is waiting for its first upload. Share a post, reel, or tagged moment and it will show up here."
        />
      );
    }

    return (
      <div className="grid grid-cols-3 gap-[3px] md:gap-1">
        {items.map((post) => (
          <button
            key={post.id}
            onClick={() => openPostModal(post.id)}
            className="group relative overflow-hidden bg-[#121212] active:scale-[0.99]"
          >
            <img src={post.image} alt={post.caption} className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/45" />
            <div className="absolute inset-0 flex items-start justify-between p-3 text-white opacity-0 transition duration-300 group-hover:opacity-100">
              {showPlay ? <Play className="h-5 w-5 fill-white text-white" strokeWidth={2} /> : <span />}
              <div className="flex items-center gap-5 text-sm font-semibold">
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 fill-white text-white" strokeWidth={2} />
                  {compactNumber(post.likes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 fill-white text-white" strokeWidth={2} />
                  {post.comments.length}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderProfile = () => {
    const tabContent =
      profileTab === "posts"
        ? renderProfileGrid(currentUserPosts)
        : profileTab === "reels"
          ? renderProfileGrid(currentUserPosts.slice(0, Math.max(1, currentUserPosts.length)), true)
          : renderProfileGrid(taggedPosts);

    return (
      <div className="mx-auto w-full max-w-[1024px] px-0 md:px-6 xl:px-10">
        <section className="px-4 pt-4 md:px-0 md:pt-8">
          <div className="flex flex-col gap-7 md:flex-row md:gap-16">
            <div className="flex justify-center md:w-[291px] md:justify-start">
              <div className="rounded-full bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976] p-[3px]">
                <div className="rounded-full bg-black p-[5px]">
                  <img
                    src={CURRENT_USER.avatar}
                    alt={CURRENT_USER.username}
                    className="h-[96px] w-[96px] rounded-full object-cover md:h-[150px] md:w-[150px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <h1 className="text-[28px] font-light text-white">{CURRENT_USER.username}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => showToast("Profile editor ready")}
                    className="rounded-lg bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12] active:scale-[0.98]"
                  >
                    Edit profile
                  </button>
                  <button
                    onClick={() => showToast("Archive ready")}
                    className="rounded-lg bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12] active:scale-[0.98]"
                  >
                    View archive
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-8 text-[16px]">
                <span>
                  <strong className="mr-1 text-white">{profileStats.posts}</strong>
                  <span className="text-white/70">posts</span>
                </span>
                <span>
                  <strong className="mr-1 text-white">{compactNumber(profileStats.followers)}</strong>
                  <span className="text-white/70">followers</span>
                </span>
                <span>
                  <strong className="mr-1 text-white">{profileStats.following}</strong>
                  <span className="text-white/70">following</span>
                </span>
              </div>

              <div className="mt-5 space-y-1">
                <p className="text-[15px] font-semibold text-white">{CURRENT_USER.name}</p>
                <p className="max-w-[520px] text-[15px] leading-6 text-white/80">{CURRENT_USER.bio}</p>
                <p className="text-[15px] text-[#e0f1ff]">aria.gallery</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-6 md:gap-12">
            {PROFILE_TABS.map((tab) => (
              <ProfileTabButton
                key={tab.id}
                tab={tab}
                active={profileTab === tab.id}
                onClick={() => setProfileTab(tab.id)}
              />
            ))}
          </div>

          <div className="mt-4">{tabContent}</div>
        </section>
      </div>
    );
  };

  const renderMessages = () => {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-0 md:px-6 xl:px-10">
        <div className="overflow-hidden border-y border-white/10 bg-[#121212] md:rounded-[28px] md:border">
          <div className="grid min-h-[72dvh] grid-cols-1 md:grid-cols-[340px_1fr]">
            <aside className="border-r border-white/10">
              <div className="flex items-center justify-between px-5 py-5">
                <div>
                  <h2 className="text-[20px] font-semibold text-white">{CURRENT_USER.username}</h2>
                  <p className="text-sm text-white/45">Messages</p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="rounded-full p-2 text-white transition hover:bg-white/[0.06] active:scale-[0.96]"
                >
                  <SquarePlus className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-1 px-2 pb-3">
                {MOCK_THREADS.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={cx(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 hover:bg-white/[0.05]",
                      activeThreadId === thread.id && "bg-white/[0.08]",
                    )}
                  >
                    <img
                      src={thread.user.avatar}
                      alt={thread.user.username}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[15px] font-semibold text-white">
                          {thread.user.username}
                        </p>
                        <span className="text-xs text-white/35">{thread.time}</span>
                      </div>
                      <p className="truncate text-sm text-white/50">{thread.lastMessage}</p>
                    </div>
                    {thread.unread ? (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0095f6] px-1.5 text-[11px] font-semibold text-white">
                        {thread.unread}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </aside>

            <section className="flex min-h-[500px] flex-col bg-black/30">
              <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
                <img
                  src={activeThread.user.avatar}
                  alt={activeThread.user.username}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-[15px] font-semibold text-white">{activeThread.user.username}</p>
                  <p className="text-sm text-white/45">{activeThread.user.name}</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {activeThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cx("flex", message.from === "me" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cx(
                        "max-w-[70%] rounded-[22px] px-4 py-3 text-sm leading-6",
                        message.from === "me"
                          ? "bg-[#3797f0] text-white"
                          : "bg-white/[0.08] text-white",
                      )}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 px-5 py-4">
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black px-4 py-3">
                  <input
                    value={commentDrafts[`thread-${activeThread.id}`] || ""}
                    onChange={(event) =>
                      setCommentDrafts((current) => ({
                        ...current,
                        [`thread-${activeThread.id}`]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        showToast("Message sent");
                        setCommentDrafts((current) => ({
                          ...current,
                          [`thread-${activeThread.id}`]: "",
                        }));
                      }
                    }}
                    placeholder="Message..."
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  />
                  <button
                    onClick={() => {
                      if ((commentDrafts[`thread-${activeThread.id}`] || "").trim()) {
                        showToast("Message sent");
                        setCommentDrafts((current) => ({
                          ...current,
                          [`thread-${activeThread.id}`]: "",
                        }));
                      }
                    }}
                    className="text-sm font-semibold text-[#4ea8ff] transition hover:text-[#8cc8ff]"
                  >
                    Send
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderReels = () => {
    if (!activeReel) {
      return (
        <div className="mx-auto w-full max-w-[1120px] px-4 md:px-6 xl:px-10">
          <EmptyState
            title="No reels to show"
            copy="Share a post and the reel rail will populate automatically."
          />
        </div>
      );
    }

    return (
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-4 md:px-6 xl:flex-row xl:px-10">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#121212]">
            <img
              src={activeReel.image}
              alt={activeReel.caption}
              className="aspect-[9/16] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={activeReel.user.avatar}
                    alt={activeReel.user.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{activeReel.user.username}</p>
                    <p className="text-xs text-white/60">{activeReel.location}</p>
                  </div>
                </div>
                <p className="max-w-[260px] text-sm leading-6 text-white/90">{activeReel.caption}</p>
              </div>

              <div className="flex flex-col items-center gap-5 text-white">
                <button
                  onClick={() => dispatch({ type: "TOGGLE_LIKE", postId: activeReel.id })}
                  className="flex flex-col items-center gap-1 active:scale-[0.96]"
                >
                  <Heart
                    className={cx(
                      "h-7 w-7",
                      activeReel.isLiked ? "fill-[#ff3040] text-[#ff3040]" : "text-white",
                    )}
                    strokeWidth={2}
                  />
                  <span className="text-xs font-semibold">{compactNumber(activeReel.likes)}</span>
                </button>

                <button
                  onClick={() => openPostModal(activeReel.id)}
                  className="flex flex-col items-center gap-1 active:scale-[0.96]"
                >
                  <MessageCircle className="h-7 w-7" strokeWidth={2} />
                  <span className="text-xs font-semibold">{activeReel.comments.length}</span>
                </button>

                <button
                  onClick={() => dispatch({ type: "TOGGLE_SAVE", postId: activeReel.id })}
                  className="active:scale-[0.96]"
                >
                  <Bookmark
                    className={cx(
                      "h-7 w-7",
                      activeReel.isSaved ? "fill-white text-white" : "text-white",
                    )}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-[24px] font-semibold text-white">Reels</h2>
            <p className="mt-1 text-sm text-white/50">Swipe the mood board and jump into any clip.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {reelPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setActiveReelId(post.id)}
                className={cx(
                  "group overflow-hidden rounded-[24px] border border-white/10 bg-[#121212] text-left transition-all duration-300 active:scale-[0.99]",
                  post.id === activeReel.id && "border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
                )}
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <Play
                    className="absolute right-3 top-3 h-5 w-5 fill-white text-white"
                    strokeWidth={2}
                  />
                </div>
                <div className="space-y-1 px-4 py-4">
                  <p className="text-sm font-semibold text-white">{post.user.username}</p>
                  <p className="max-h-[3rem] overflow-hidden text-sm leading-6 text-white/60">
                    {post.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentPage = () => {
    if (currentPage === "explore") return renderExplore();
    if (currentPage === "profile") return renderProfile();
    if (currentPage === "messages") return renderMessages();
    if (currentPage === "reels") return renderReels();
    return renderFeed();
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-0 hidden min-h-[100dvh] shrink-0 border-r border-white/10 bg-black md:flex md:w-[72px] md:flex-col md:px-2 xl:w-[245px] xl:px-3">
          <div>
            <div className="flex h-[92px] items-center px-3 xl:px-4">
              <div className="xl:hidden">
                <button
                  onClick={() => handleNavAction("home")}
                  className="rounded-2xl p-3 text-white transition hover:bg-white/[0.06]"
                >
                  <Aperture className="h-7 w-7" strokeWidth={2} />
                </button>
              </div>
              <div className="hidden xl:block">
                <p className="[font-family:Georgia,serif] text-[31px] tracking-tight text-white">
                  Instagram
                </p>
              </div>
            </div>

            <nav className="space-y-1 xl:hidden">
              {desktopNavItems.map((item) => (
                <SidebarButton
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={item.active}
                  collapsed={true}
                  avatar={item.avatar}
                  onClick={() => handleNavAction(item.id)}
                />
              ))}
            </nav>

            <nav className="hidden space-y-1 xl:block">
              {desktopNavItems.map((item) => (
                <SidebarButton
                  key={`${item.id}-expanded`}
                  icon={item.icon}
                  label={item.label}
                  active={item.active}
                  collapsed={false}
                  avatar={item.avatar}
                  onClick={() => handleNavAction(item.id)}
                />
              ))}
            </nav>
          </div>
        </aside>

        <div className="relative flex min-h-[100dvh] flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/95 px-4 py-4 backdrop-blur md:hidden">
            <p className="[font-family:Georgia,serif] text-[30px] tracking-tight text-white">Instagram</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => togglePanel("notifications")}
                className="rounded-full p-2 text-white transition hover:bg-white/[0.06] active:scale-[0.96]"
              >
                <Heart className="h-6 w-6" strokeWidth={2} />
              </button>
              <button
                onClick={openCreateModal}
                className="rounded-full p-2 text-white transition hover:bg-white/[0.06] active:scale-[0.96]"
              >
                <SquarePlus className="h-6 w-6" strokeWidth={2} />
              </button>
            </div>
          </header>

          <main className="flex-1 pb-[72px] pt-0 md:pb-0 md:pt-8">{renderCurrentPage()}</main>

          <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/95 px-6 py-3 backdrop-blur md:hidden">
            <div className="flex items-center justify-between">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavAction(item.id)}
                    className="rounded-full p-2 text-white transition active:scale-[0.96]"
                  >
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.id}
                        className={cx(
                          "h-7 w-7 rounded-full object-cover ring-2",
                          item.active ? "ring-white" : "ring-white/15",
                        )}
                      />
                    ) : (
                      <Icon className="h-7 w-7" strokeWidth={item.active ? 2.4 : 2} />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {activePanel ? (
        <div className="fixed inset-0 z-30 bg-black/75 backdrop-blur-[2px]" onClick={() => setActivePanel(null)}>
          <div
            className={cx(
              "absolute left-0 top-0 h-full w-full max-w-[430px] border-r border-white/10 bg-[#121212] shadow-[24px_0_60px_rgba(0,0,0,0.45)] transition-all duration-300 md:left-[72px] xl:left-[245px]",
              activePanel ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {activePanel === "search" ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 px-6 py-6">
                  <h2 className="text-2xl font-semibold text-white">Search</h2>
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-black px-4 py-3">
                    <Search className="h-5 w-5 text-white/35" strokeWidth={2} />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search"
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <div className="mb-4 flex items-center justify-between px-3">
                    <h3 className="text-[15px] font-semibold text-white">
                      {searchQuery.trim() ? "Results" : "Recent"}
                    </h3>
                    {searchQuery.trim() ? (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-sm text-[#4ea8ff] transition hover:text-[#8cc8ff]"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  {filteredSearchResults.length ? (
                    <div className="space-y-1">
                      {filteredSearchResults.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => {
                            setActivePanel(null);
                            if (post.user.username === CURRENT_USER.username) {
                              setCurrentPage("profile");
                              return;
                            }
                            openPostModal(post.id);
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.06] active:scale-[0.99]"
                        >
                          <img
                            src={post.user.avatar}
                            alt={post.user.username}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-white">
                              {post.user.username}
                            </p>
                            <p className="truncate text-sm text-white/45">{post.location}</p>
                          </div>
                          <img
                            src={post.image}
                            alt={post.caption}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No results found"
                      copy="Try another username, location, or caption keyword."
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 px-6 py-6">
                  <h2 className="text-2xl font-semibold text-white">Notifications</h2>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <div className="space-y-1">
                    {MOCK_NOTIFICATIONS.map((item) => {
                      const previewPost = posts.find((post) => post.id === item.postId);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActivePanel(null);
                            if (item.text.includes("following you")) {
                              setCurrentPage("profile");
                              return;
                            }
                            if (item.postId) openPostModal(item.postId);
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.06] active:scale-[0.99]"
                        >
                          <img
                            src={item.avatar}
                            alt={item.text}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-6 text-white/85">
                              {item.text} <span className="text-white/35">{item.time}</span>
                            </p>
                          </div>
                          {previewPost ? (
                            <img
                              src={previewPost.image}
                              alt={previewPost.caption}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {(postModalId || postModalVisible) && selectedPost ? (
        <div
          className={cx(
            "fixed inset-0 z-40 flex items-center justify-center bg-black/85 px-0 py-0 backdrop-blur-[2px] transition-all duration-200 md:px-8 md:py-6",
            postModalVisible ? "opacity-100" : "opacity-0",
          )}
          onClick={closePostModal}
        >
          <button
            onClick={closePostModal}
            className="absolute right-4 top-4 rounded-full p-2 text-white transition hover:bg-white/[0.08] active:scale-[0.96]"
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>

          <div
            className={cx(
              "flex h-full w-full max-w-[1220px] flex-col overflow-hidden bg-[#121212] transition-all duration-200 md:h-auto md:max-h-[90vh] md:flex-row md:rounded-[30px] md:border md:border-white/10",
              postModalVisible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative flex flex-1 items-center justify-center bg-black"
              onDoubleClick={() => handleImageDoubleClick(selectedPost.id)}
            >
              <img
                src={selectedPost.image}
                alt={selectedPost.caption}
                className="h-full w-full object-cover md:max-h-[90vh]"
              />

              <div
                className={cx(
                  "pointer-events-none absolute inset-0 flex items-center justify-center transition duration-500",
                  heartBursts[selectedPost.id] ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="absolute h-28 w-28 rounded-full bg-white/10 animate-ping" />
                <Heart
                  className={cx(
                    "h-24 w-24 drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all duration-500",
                    heartBursts[selectedPost.id] ? "scale-100 opacity-100" : "scale-50 opacity-0",
                  )}
                  fill="white"
                  strokeWidth={1.9}
                />
              </div>
            </div>

            <div className="flex w-full flex-col md:w-[420px]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPost.user.avatar}
                    alt={selectedPost.user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[14px] font-semibold text-white">{selectedPost.user.username}</p>
                    <p className="text-[12px] text-white/45">{selectedPost.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => showToast("More options soon")}
                  className="rounded-full p-2 text-white/70 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.96]"
                >
                  <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedPost.user.avatar}
                    alt={selectedPost.user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <p className="text-[14px] leading-6 text-white">
                    <span className="mr-2 font-semibold">{selectedPost.user.username}</span>
                    <span className="text-white/85">{selectedPost.caption}</span>
                  </p>
                </div>

                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <img
                      src={`https://i.pravatar.cc/100?u=${comment.username}`}
                      alt={comment.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <p className="text-[14px] leading-6 text-white">
                      <span className="mr-2 font-semibold">{comment.username}</span>
                      <span className="text-white/82">{comment.text}</span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => dispatch({ type: "TOGGLE_LIKE", postId: selectedPost.id })}
                      className="text-white transition hover:opacity-75 active:scale-[0.96]"
                    >
                      <Heart
                        className={cx(
                          "h-6 w-6",
                          selectedPost.isLiked ? "fill-[#ff3040] text-[#ff3040]" : "text-white",
                        )}
                        strokeWidth={2}
                      />
                    </button>
                    <button
                      onClick={() => showToast("Comments ready")}
                      className="text-white transition hover:opacity-75 active:scale-[0.96]"
                    >
                      <MessageCircle className="h-6 w-6" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleShare(selectedPost)}
                      className="text-white transition hover:opacity-75 active:scale-[0.96]"
                    >
                      <Send className="h-6 w-6" strokeWidth={2} />
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch({ type: "TOGGLE_SAVE", postId: selectedPost.id })}
                    className="text-white transition hover:opacity-75 active:scale-[0.96]"
                  >
                    <Bookmark
                      className={cx(
                        "h-6 w-6",
                        selectedPost.isSaved ? "fill-white text-white" : "text-white",
                      )}
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <p className="mt-3 text-[14px] font-semibold text-white">
                  {selectedPost.likes.toLocaleString()} likes
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/35">
                  {selectedPost.timestamp}
                </p>
              </div>

              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <input
                    value={commentDrafts[selectedPost.id] || ""}
                    onChange={(event) =>
                      setCommentDrafts((current) => ({
                        ...current,
                        [selectedPost.id]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleCommentSubmit(selectedPost.id);
                      }
                    }}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/35"
                  />
                  <button
                    onClick={() => handleCommentSubmit(selectedPost.id)}
                    className="text-sm font-semibold text-[#4ea8ff] transition hover:text-[#8cc8ff] disabled:text-white/25"
                    disabled={!(commentDrafts[selectedPost.id] || "").trim()}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {createModalOpen ? (
        <div
          className={cx(
            "fixed inset-0 z-40 flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-[2px] transition-all duration-200",
            createModalVisible ? "opacity-100" : "opacity-0",
          )}
          onClick={closeCreateModal}
        >
          <div
            className={cx(
              "w-full max-w-[760px] overflow-hidden rounded-[30px] border border-white/10 bg-[#121212] transition-all duration-200",
              createModalVisible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="w-10" />
              <h2 className="text-[16px] font-semibold text-white">Create new post</h2>
              <button
                onClick={closeCreateModal}
                className="rounded-full p-2 text-white transition hover:bg-white/[0.06] active:scale-[0.96]"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr]">
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  const file = event.dataTransfer.files?.[0];
                  loadImageFile(file);
                }}
                className={cx(
                  "flex min-h-[420px] items-center justify-center border-b border-white/10 bg-black md:border-b-0 md:border-r",
                  dragActive && "bg-[#0d0d0d]",
                )}
              >
                {createImage ? (
                  <img
                    src={createImage.preview}
                    alt={createImage.name}
                    className="h-full max-h-[560px] w-full object-cover"
                  />
                ) : (
                  <div className="flex max-w-[320px] flex-col items-center px-6 text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[#121212]">
                      <ImagePlus className="h-9 w-9 text-white" strokeWidth={1.8} />
                    </div>
                    <h3 className="text-[22px] font-semibold text-white">Drag photos here</h3>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                      Or choose from your computer to build a feed-ready post.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-6 rounded-lg bg-[#0095f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1686da] active:scale-[0.98]"
                    >
                      Select from computer
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={CURRENT_USER.avatar}
                      alt={CURRENT_USER.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <p className="text-[14px] font-semibold text-white">{CURRENT_USER.username}</p>
                  </div>
                </div>

                <div className="flex-1 px-5 py-4">
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                    Caption
                  </label>
                  <textarea
                    value={createCaption}
                    onChange={(event) => setCreateCaption(event.target.value)}
                    placeholder="Write a caption..."
                    className="h-[200px] w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35"
                  />

                  <div className="mt-4 flex items-center justify-between text-xs text-white/35">
                    <span>{createCaption.length}/2200</span>
                    {createImage ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#4ea8ff] transition hover:text-[#8cc8ff]"
                      >
                        Replace image
                      </button>
                    ) : null}
                  </div>

                  {createError ? <p className="mt-4 text-sm text-[#ff7d91]">{createError}</p> : null}
                </div>

                <div className="border-t border-white/10 px-5 py-4">
                  <button
                    onClick={handleComposerShare}
                    className="w-full rounded-xl bg-[#0095f6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1686da] active:scale-[0.985]"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => loadImageFile(event.target.files?.[0])}
            />
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:bottom-8">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
