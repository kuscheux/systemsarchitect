"use client";

export default function PortalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="border border-red-200 bg-red-50 p-6">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-red-600">Portal error</p>
      <h1 className="mt-3 text-2xl font-semibold text-red-950">This workspace could not be loaded.</h1>
      <p className="mt-2 text-sm leading-6 text-red-800">{error.message}</p>
      <button type="button" onClick={reset} className="mt-5 rounded-full bg-red-950 px-4 py-2 text-sm font-medium text-white">Try again</button>
    </div>
  );
}

