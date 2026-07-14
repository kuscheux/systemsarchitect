import type { ReactNode } from "react";

const badgeStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  complete: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  submitted: "bg-blue-50 text-blue-700 ring-blue-200",
  assigned: "bg-blue-50 text-blue-700 ring-blue-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  urgent: "bg-red-50 text-red-700 ring-red-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  draft: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  closed: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  normal: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ring-1 ring-inset ${
        badgeStyles[value] ?? "bg-zinc-100 text-zinc-600 ring-zinc-200"
      }`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-zinc-200 pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold leading-none tracking-[-0.055em] text-zinc-950 md:text-5xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="grid min-h-56 place-items-center border border-dashed border-zinc-300 bg-white p-8 text-center">
      <div className="max-w-sm">
        <h2 className="text-xl font-semibold tracking-[-0.035em] text-zinc-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{body}</p>
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800">
      {label}
      {children}
      {hint ? <span className="text-xs font-normal leading-5 text-zinc-500">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "h-11 w-full border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950";
export const textareaClass = `${inputClass} min-h-28 resize-y py-3 leading-6`;
export const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:border-zinc-500 hover:bg-zinc-50";

export function formatPortalDate(value: string | null, includeTime = false) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
