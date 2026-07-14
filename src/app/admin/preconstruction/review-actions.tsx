"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function PreconReviewActions({ id, currentEstimator }: { id: string; currentEstimator: string }) {
  const [status, setStatus] = useState("assigned");
  const [estimator, setEstimator] = useState(currentEstimator);
  const [reviewReason, setReviewReason] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [message, setMessage] = useState("");

  async function save() {
    setMessage("Saving...");
    const response = await fetch(`/api/admin/precon/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, estimator, reviewReason, nextSteps }),
    });

    setMessage(response.ok ? "Decision saved." : "Decision was not saved.");
    if (response.ok) window.location.reload();
  }

  return (
    <div className="mt-5 grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Decision
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-full border border-border bg-white/80 px-4 outline-none"
          >
            <option value="assigned">Assign estimator</option>
            <option value="reviewed">Hold for review</option>
            <option value="follow-up">BD follow-up required</option>
            <option value="declined">Do not pursue</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Estimator
          <input
            value={estimator}
            onChange={(event) => setEstimator(event.target.value)}
            className="h-11 rounded-full border border-border bg-white/80 px-4 outline-none"
          />
        </label>
      </div>
      <textarea
        value={reviewReason}
        onChange={(event) => setReviewReason(event.target.value)}
        placeholder="Decision rationale"
        className="min-h-24 rounded-2xl border border-border bg-white/80 p-4 text-sm outline-none"
      />
      <textarea
        value={nextSteps}
        onChange={(event) => setNextSteps(event.target.value)}
        placeholder="Required next action for estimating or business development"
        className="min-h-24 rounded-2xl border border-border bg-white/80 p-4 text-sm outline-none"
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Save decision <ArrowRight size={15} />
        </button>
        {message ? <span className="self-center text-sm text-muted">{message}</span> : null}
      </div>
    </div>
  );
}
