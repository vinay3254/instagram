export function formatCount(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value % 1000000 >= 100000 ? 1 : 0)}m`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 >= 100 ? 1 : 0)}k`;
  }

  return String(value ?? 0);
}

export function formatTimestamp(dateLike) {
  const date = new Date(dateLike);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString();
}

export function formatFullDate(dateLike) {
  return new Date(dateLike).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
