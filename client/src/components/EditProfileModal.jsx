import { CameraPlus, SpinnerGap, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

export default function EditProfileModal({
  open,
  initialProfile,
  submitting = false,
  error = "",
  onClose,
  onSave,
}) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    avatar: "",
    avatarFile: null,
  });
  const [previewAvatar, setPreviewAvatar] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        username: initialProfile?.username || "",
        bio: initialProfile?.bio || "",
        avatar: initialProfile?.avatar || "",
        avatarFile: null,
      });
      setPreviewAvatar("");
    }
  }, [open, initialProfile]);

  useEffect(() => {
    return () => {
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-border bg-surface shadow-lifted"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-white">Edit profile</h2>
          <button onClick={onClose} className="action-button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-black/20 p-4">
            <img
              src={previewAvatar || form.avatar || initialProfile?.avatar}
              alt={form.username || initialProfile?.username}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{form.username || initialProfile?.username}</p>
              <p className="truncate text-sm text-[#a8a8a8]">{form.bio || "No bio yet."}</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/30"
            >
              <CameraPlus className="h-4 w-4" />
              Change photo
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Username</label>
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="Username"
              className="ig-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Bio</label>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              placeholder="Bio"
              className="ig-input h-28 resize-none"
            />
            <p className="mt-2 text-xs text-[#737373]">{form.bio.length}/180</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Avatar URL</label>
            <input
              value={form.avatar}
              onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              className="ig-input"
            />
            <p className="mt-2 text-xs text-[#737373]">
              Upload a file with “Change photo”, or paste a direct image URL here.
            </p>
          </div>

          {error ? <p className="text-sm text-[#ff7d91]">{error}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
          <button onClick={onClose} className="ig-secondary-button">
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                username: form.username,
                bio: form.bio,
                avatar: form.avatar,
                avatarFile: form.avatarFile,
              })
            }
            disabled={submitting || !form.username.trim()}
            className="ig-primary-button inline-flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {submitting ? <SpinnerGap className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0];

            if (!nextFile || !nextFile.type.startsWith("image/")) {
              return;
            }

            if (previewAvatar) {
              URL.revokeObjectURL(previewAvatar);
            }

            setPreviewAvatar(URL.createObjectURL(nextFile));
            setForm((current) => ({
              ...current,
              avatarFile: nextFile,
            }));
          }}
        />
      </div>
    </div>
  );
}
