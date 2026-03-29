import { Plus } from "@phosphor-icons/react";

export default function StoriesBar({
  storyGroups = [],
  currentUser,
  onOpenStoryGroup,
  onOpenCreateStory,
}) {
  const currentUserGroup = storyGroups.find((group) => group.author?.username === currentUser?.username) || null;
  const otherGroups = storyGroups.filter((group) => group.author?.username !== currentUser?.username);

  const renderStoryButton = ({ key, label, avatar, hasStory, hasUnviewed, onClick, isOwn = false }) => (
    <button
      key={key}
      onClick={onClick}
      className="group flex min-w-[72px] flex-col items-center gap-2 text-center"
    >
      <div className={hasStory && hasUnviewed ? "story-ring p-[2px]" : "rounded-full border border-border p-[2px]"}>
        <div className="relative rounded-full bg-black p-[2px]">
          <img
            src={avatar}
            alt={label}
            className="h-[56px] w-[56px] rounded-full object-cover md:h-[66px] md:w-[66px]"
          />
          {isOwn ? (
            <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-accent text-white">
              <Plus className="h-3 w-3" weight="bold" />
            </span>
          ) : null}
        </div>
      </div>
      <span className="max-w-[72px] truncate text-[12px] text-[#f5f5f5]">
        {isOwn ? "Your story" : label}
      </span>
    </button>
  );

  return (
    <div className="border-y border-border bg-surface px-4 py-4 md:rounded-lg md:border">
      <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {currentUser
          ? renderStoryButton({
              key: "current-user-story",
              label: currentUser.username,
              avatar: currentUser.avatar,
              hasStory: Boolean(currentUserGroup),
              hasUnviewed: currentUserGroup?.hasUnviewed,
              onClick: () =>
                currentUserGroup ? onOpenStoryGroup(currentUserGroup.id) : onOpenCreateStory(),
              isOwn: true,
            })
          : null}

        {otherGroups.map((group) =>
          renderStoryButton({
            key: group.id,
            label: group.author?.username,
            avatar: group.author?.avatar,
            hasStory: true,
            hasUnviewed: group.hasUnviewed,
            onClick: () => onOpenStoryGroup(group.id),
          }),
        )}
      </div>
    </div>
  );
}
