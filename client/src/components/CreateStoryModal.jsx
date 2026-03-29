import { Camera, SpinnerGap, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import PostMedia from "./PostMedia";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

export default function CreateStoryModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCaption("");
      setPreview("");
      setFile(null);
      setMediaType("image");
      setError("");
      setSubmitting(false);
      setDragActive(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFile = (nextFile) => {
    if (!nextFile || (!nextFile.type.startsWith("image/") && !nextFile.type.startsWith("video/"))) {
      setError("Choose a valid image or video file.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setMediaType(nextFile.type.startsWith("video/") ? "video" : "image");
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Add an image or video before sharing your story.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("media", file);
      formData.append("caption", caption);

      const { data } = await api.post("/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onCreated(data.story);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create story.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[820px] overflow-hidden rounded-2xl border border-border bg-surface shadow-lifted"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="w-10" />
          <h2 className="text-sm font-semibold text-white">Create story</h2>
          <button onClick={onClose} className="action-button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">
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
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex min-h-[420px] items-center justify-center border-b border-border bg-black md:border-b-0 md:border-r",
              dragActive && "bg-[#090909]",
            )}
          >
            {preview ? (
              <PostMedia
                post={{ mediaUrl: preview, mediaType }}
                className="aspect-[9/16] max-h-[560px] rounded-[26px]"
                controls={mediaType === "video"}
                muted={mediaType === "video"}
                autoPlay={mediaType === "video"}
                loop={mediaType === "video"}
              />
            ) : (
              <div className="flex max-w-[280px] flex-col items-center px-8 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Share to your story</h3>
                <p className="mt-3 text-sm leading-7 text-[#a8a8a8]">
                  Drop a photo or video to create a story that disappears after 24 hours.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accentSoft active:scale-[0.98]"
                >
                  Select media
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <img src={user?.avatar} alt={user?.username} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-white">{user?.username}</p>
                  <p className="text-xs text-[#a8a8a8]">Visible for 24 hours</p>
                </div>
              </div>
            </div>

            <div className="flex-1 px-5 py-5">
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#737373]">
                Story caption
              </label>
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Say something..."
                className="ig-input h-[180px] resize-none rounded-xl bg-black px-4 py-3 leading-7"
              />

              <div className="mt-4 flex items-center justify-between text-xs text-[#737373]">
                <span>{caption.length}/180</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent transition hover:text-accentSoft"
                >
                  {preview ? "Replace media" : "Choose media"}
                </button>
              </div>

              {error ? <p className="mt-4 text-sm text-[#ff7d91]">{error}</p> : null}
            </div>

            <div className="border-t border-border px-5 py-4">
              <button
                onClick={handleSubmit}
                disabled={submitting || !file}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentSoft disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? <SpinnerGap className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Sharing..." : "Share story"}
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
    </div>
  );
}
