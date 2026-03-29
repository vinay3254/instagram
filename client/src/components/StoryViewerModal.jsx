import { CaretLeft, CaretRight, Pause, Play, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/client";
import PostMedia from "./PostMedia";
import { formatTimestamp } from "../utils/formatters";

function buildInitialPosition(storyGroups, initialGroupId) {
  const groupIndex = Math.max(
    0,
    storyGroups.findIndex((group) => group.id === initialGroupId),
  );

  return {
    groupIndex: groupIndex === -1 ? 0 : groupIndex,
    storyIndex: 0,
  };
}

export default function StoryViewerModal({
  open,
  storyGroups = [],
  initialGroupId,
  onClose,
  onStoryViewed,
}) {
  const [{ groupIndex, storyIndex }, setPosition] = useState({ groupIndex: 0, storyIndex: 0 });
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const activeGroup = storyGroups[groupIndex] || null;
  const activeStory = activeGroup?.stories?.[storyIndex] || null;

  useEffect(() => {
    if (!open) {
      setPaused(false);
      return;
    }

    setPosition(buildInitialPosition(storyGroups, initialGroupId));
    setPaused(false);
  }, [open, initialGroupId, storyGroups]);

  useEffect(() => {
    if (!open || !activeStory) {
      return undefined;
    }

    const markViewed = async () => {
      try {
        await api.post(`/stories/${activeStory.id}/view`);
        onStoryViewed?.(activeStory.id, activeGroup?.id);
      } catch (error) {
        void error;
      }
    };

    markViewed();
  }, [open, activeStory?.id]);

  const goNext = () => {
    if (!activeGroup) {
      onClose();
      return;
    }

    if (storyIndex < activeGroup.stories.length - 1) {
      setPosition((current) => ({ ...current, storyIndex: current.storyIndex + 1 }));
      return;
    }

    if (groupIndex < storyGroups.length - 1) {
      setPosition((current) => ({ groupIndex: current.groupIndex + 1, storyIndex: 0 }));
      return;
    }

    onClose();
  };

  const goPrevious = () => {
    if (storyIndex > 0) {
      setPosition((current) => ({ ...current, storyIndex: current.storyIndex - 1 }));
      return;
    }

    if (groupIndex > 0) {
      const previousGroup = storyGroups[groupIndex - 1];
      setPosition({
        groupIndex: groupIndex - 1,
        storyIndex: Math.max(0, previousGroup.stories.length - 1),
      });
    }
  };

  useEffect(() => {
    if (!open || !activeStory || paused) {
      return undefined;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      goNext();
    }, activeStory.mediaType === "video" ? 9000 : 5500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [open, activeStory?.id, paused]);

  const progressItems = useMemo(() => activeGroup?.stories || [], [activeGroup]);

  if (!open || !activeGroup || !activeStory) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[460px] flex-col overflow-hidden rounded-[32px] border border-border bg-surface shadow-lifted">
        <div className="absolute inset-x-0 top-0 z-10 px-4 pt-4">
          <div className="flex gap-1.5">
            {progressItems.map((story, index) => (
              <div key={story.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full ${
                    index < storyIndex ? "w-full bg-white" : index === storyIndex ? "w-2/3 bg-white" : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute left-4 right-4 top-8 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeGroup.author?.avatar}
              alt={activeGroup.author?.username}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-white">{activeGroup.author?.username}</p>
              <p className="text-xs text-white/70">{formatTimestamp(activeStory.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaused((current) => !current)}
              className="rounded-full bg-black/35 p-2 text-white transition hover:bg-black/50"
            >
              {paused ? <Play className="h-4 w-4" weight="fill" /> : <Pause className="h-4 w-4" weight="fill" />}
            </button>
            <button onClick={onClose} className="rounded-full bg-black/35 p-2 text-white transition hover:bg-black/50">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative bg-black">
          <button
            onClick={goPrevious}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white transition hover:bg-black/50"
          >
            <CaretLeft className="h-5 w-5" weight="bold" />
          </button>

          <PostMedia
            post={activeStory}
            className="aspect-[9/16] w-full"
            controls={activeStory.mediaType === "video"}
            muted={activeStory.mediaType === "video"}
            autoPlay={activeStory.mediaType === "video"}
            loop={activeStory.mediaType === "video"}
          />

          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white transition hover:bg-black/50"
          >
            <CaretRight className="h-5 w-5" weight="bold" />
          </button>
        </div>

        <div className="border-t border-border px-5 py-4">
          <p className="text-sm leading-6 text-[#f5f5f5]">
            {activeStory.caption || "No caption for this story."}
          </p>
        </div>
      </div>
    </div>
  );
}
