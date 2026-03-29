import {
  Bell,
  Compass,
  FilmSlate,
  House,
  MagnifyingGlass,
  MessengerLogo,
  PlusSquare,
  SignOut,
} from "@phosphor-icons/react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import CreatePostModal from "../components/CreatePostModal";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { cn } from "../utils/cn";
import { sharePost as sharePostToSystem } from "../utils/sharePost";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerTick, setComposerTick] = useState(0);
  const [savedPostIds, setSavedPostIds] = useLocalStorage("instagram-saved-posts", []);
  const [toast, setToast] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const toastTimeoutRef = useRef(null);

  const toggleSaved = (postId) => {
    setSavedPostIds((current) =>
      current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId],
    );
  };

  const showToast = (message) => {
    setToast(message);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToast("");
    }, 1800);
  };

  const sharePost = async (post) => {
    try {
      const message = await sharePostToSystem(post);
      if (message) {
        showToast(message);
      }
    } catch (error) {
      showToast("Unable to share post");
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUnreadNotifications(0);
    setUnreadMessages(0);
    navigate("/login", { replace: true });
  };

  const handlePostCreated = () => {
    setComposerTick((current) => current + 1);
    setComposerOpen(false);
    navigate("/");
  };

  const refreshChrome = async () => {
    try {
      const [notificationResponse, messageResponse] = await Promise.all([
        api.get("/notifications", { params: { limit: 1, unreadOnly: true } }),
        api.get("/messages/conversations"),
      ]);

      setUnreadNotifications(notificationResponse.data.unreadCount || 0);
      setUnreadMessages(
        (messageResponse.data.conversations || []).reduce(
          (total, conversation) => total + (conversation.unreadCount || 0),
          0,
        ),
      );
    } catch (error) {
      void error;
    }
  };

  useEffect(() => {
    if (user) {
      refreshChrome();
    }
  }, [user, location.pathname, composerTick]);

  const navItems = [
    { type: "route", to: "/", label: "Home", icon: House, end: true },
    { type: "route", to: "/search", label: "Search", icon: MagnifyingGlass },
    { type: "route", to: "/explore", label: "Explore", icon: Compass },
    { type: "route", to: "/reels", label: "Reels", icon: FilmSlate },
    { type: "route", to: "/messages", label: "Messages", icon: MessengerLogo, badge: unreadMessages },
    { type: "route", to: "/notifications", label: "Notifications", icon: Bell, badge: unreadNotifications },
  ];

  const navItemBaseClasses =
    "group flex h-12 items-center gap-4 rounded-xl px-3 text-[16px] text-white transition hover:bg-[#1a1a1a] lg:justify-center xl:justify-start";

  const profileClasses = ({ isActive }) =>
    cn(navItemBaseClasses, isActive && "font-semibold");

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1280px]">
        <aside className="sticky top-0 hidden h-[100dvh] shrink-0 border-r border-border lg:flex lg:w-[72px] lg:flex-col lg:px-2 xl:w-[244px] xl:px-3">
          <div className="px-3 pb-8 pt-10">
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-full items-center justify-center xl:justify-start"
            >
              <p className="hidden [font-family:'Segoe_Script',cursive] text-[34px] tracking-tight text-white xl:block">
                Instagram
              </p>
              <span className="text-xl font-semibold tracking-tight xl:hidden">IG</span>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={profileClasses}
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative shrink-0">
                        <Icon className="h-7 w-7" weight={isActive ? "fill" : "regular"} />
                        {item.badge ? (
                          <span className="absolute -right-2 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                            {item.badge > 9 ? "9+" : item.badge}
                          </span>
                        ) : null}
                      </span>
                      <span className="hidden xl:block">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            <button
              onClick={() => setComposerOpen(true)}
              className={navItemBaseClasses}
              aria-label="Create"
            >
              <PlusSquare className="h-7 w-7 shrink-0" />
              <span className="hidden xl:block">Create</span>
            </button>

            <NavLink to={`/profile/${user?.username}`} className={profileClasses}>
              {({ isActive }) => (
                <>
                  <img
                    src={user?.avatar}
                    alt={user?.username}
                    className={cn(
                      "h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/10",
                      isActive && "ring-2 ring-white",
                    )}
                  />
                  <span className="hidden xl:block">Profile</span>
                </>
              )}
            </NavLink>
          </nav>

          <div className="space-y-2 pb-6 pt-4">
            <div className="hidden items-center gap-3 rounded-xl px-3 py-2 text-sm text-white xl:flex">
              <img src={user?.avatar} alt={user?.username} className="h-11 w-11 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user?.username}</p>
                <p className="truncate text-[#a8a8a8]">{user?.bio || "instagram clone"}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex h-12 w-full items-center gap-4 rounded-xl px-3 text-[16px] text-white transition hover:bg-[#1a1a1a] lg:justify-center xl:justify-start"
            >
              <SignOut className="h-6 w-6 shrink-0" />
              <span className="hidden xl:block">Log out</span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-border bg-black/90 px-4 backdrop-blur lg:hidden">
            <p className="[font-family:'Segoe_Script',cursive] text-[31px] tracking-tight text-white">
              Instagram
            </p>
            <div className="flex items-center gap-1">
              <NavLink to="/notifications" className="relative rounded-full p-2 text-white">
                <Bell className="h-6 w-6" weight={location.pathname === "/notifications" ? "fill" : "regular"} />
                {unreadNotifications ? (
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                ) : null}
              </NavLink>
              <NavLink to="/messages" className="relative rounded-full p-2 text-white">
                <MessengerLogo className="h-6 w-6" weight={location.pathname === "/messages" ? "fill" : "regular"} />
                {unreadMessages ? (
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                ) : null}
              </NavLink>
              <button onClick={() => setComposerOpen(true)} className="rounded-full p-2 text-white">
                <PlusSquare className="h-6 w-6" />
              </button>
            </div>
          </header>

          <main className="flex-1 pb-[63px] lg:pb-0">
            <Outlet
              context={{
                openComposer: () => setComposerOpen(true),
                composerTick,
                savedPostIds,
                toggleSaved,
                sharePost,
                showToast,
                refreshChrome,
              }}
            />
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-black/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between">
              <NavLink to="/" end className="rounded-full p-2 text-white">
                {({ isActive }) => <House className="h-7 w-7" weight={isActive ? "fill" : "regular"} />}
              </NavLink>
              <NavLink to="/search" className="rounded-full p-2 text-white">
                {({ isActive }) => <MagnifyingGlass className="h-7 w-7" weight={isActive ? "fill" : "regular"} />}
              </NavLink>
              <NavLink to="/explore" className="rounded-full p-2 text-white">
                {({ isActive }) => <Compass className="h-7 w-7" weight={isActive ? "fill" : "regular"} />}
              </NavLink>
              <button onClick={() => setComposerOpen(true)} className="rounded-full p-2 text-white">
                <PlusSquare className="h-7 w-7" />
              </button>
              <NavLink to="/reels" className="rounded-full p-2 text-white">
                {({ isActive }) => <FilmSlate className="h-7 w-7" weight={isActive ? "fill" : "regular"} />}
              </NavLink>
              <NavLink to={`/profile/${user?.username}`} className="rounded-full p-2 text-white">
                <img src={user?.avatar} alt={user?.username} className="h-7 w-7 rounded-full object-cover" />
              </NavLink>
            </div>
          </nav>
        </div>
      </div>

      <CreatePostModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={handlePostCreated}
      />

      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-[#1f1f1f] px-4 py-2 text-sm font-medium text-white shadow-lifted lg:bottom-8">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
