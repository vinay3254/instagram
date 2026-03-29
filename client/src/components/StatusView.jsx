import { SpinnerGap } from "@phosphor-icons/react";

export default function StatusView({
  title,
  copy,
  loading = false,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface">
        {loading ? (
          <SpinnerGap className="h-7 w-7 animate-spin text-accent" />
        ) : (
          <div className="h-3 w-3 rounded-full bg-accent shadow-[0_0_0_8px_rgba(0,149,246,0.15)]" />
        )}
      </div>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-[#a8a8a8]">{copy}</p>
      {actionLabel ? (
        <button
          onClick={onAction}
          className="mt-6 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accentSoft active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
