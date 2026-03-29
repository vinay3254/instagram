import { cn } from "../utils/cn";

export default function PostMedia({
  post,
  className,
  controls = false,
  muted = true,
  autoPlay = false,
  loop = false,
}) {
  const mediaUrl = post?.mediaUrl || post?.imageUrl;

  if (!mediaUrl) {
    return null;
  }

  if (post?.mediaType === "video") {
    return (
      <video
        src={mediaUrl}
        className={cn("w-full object-cover", className)}
        playsInline
        controls={controls}
        muted={muted}
        autoPlay={autoPlay}
        loop={loop}
        preload="metadata"
      />
    );
  }

  return <img src={mediaUrl} alt={post?.caption || "Post media"} className={cn("w-full object-cover", className)} />;
}
