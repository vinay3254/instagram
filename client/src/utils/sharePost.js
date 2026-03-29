async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      void error;
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (copied) {
      return;
    }
  } catch (error) {
    document.body.removeChild(textarea);
  }

  if (typeof window.prompt === "function") {
    window.prompt("Copy this post link", text);
    return;
  }

  throw new Error("Unable to copy text");
}

export async function sharePost(post) {
  const url = `${window.location.origin}/p/${post.id}`;
  const title = post.author?.username ? `${post.author.username} on Instagram Clone` : "Instagram Clone post";
  const text = post.caption || "Check out this post.";

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "Share dialog opened";
    } catch (error) {
      if (error?.name === "AbortError") {
        return "";
      }
    }
  }

  await copyText(url);
  return "Post link copied";
}
