"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  FileUp,
  Handshake,
  Inbox,
  ListChecks,
  Users,
} from "lucide-react";

const markets = [
  "Education",
  "Mixed-Use",
  "Residential",
  "Hospitality",
  "Office",
  "Civic/Government",
  "Industrial",
  "Healthcare",
  "Transportation",
  "Other",
];

const bidTypes = [
  "Conceptual Budget",
  "Hard Bid",
  "Design-Assist",
  "Negotiated",
  "Rebid / Revision",
  "Relationship Follow-up",
];

const sources = [
  "BuildingConnected invitation",
  "Estimating email",
  "BD relationship note",
  "Existing bid follow-up",
];

const touchpoints = [
  "Not applicable",
  "Lunch",
  "Dinner",
  "Survey",
  "Charity event",
  "Client meeting",
  "Phone follow-up",
  "Existing bid follow-up",
];

export function PreconIntakeForm() {
  const [form, setForm] = useState({
    source: "BuildingConnected invitation",
    client: "",
    projectName: "",
    projectLocation: "",
    market: "Mixed-Use",
    bidType: "Hard Bid",
    dueDate: "",
    estimatedValue: "",
    relationshipOwner: "",
    relationshipContext: "",
    bdTouchpoint: "Not applicable",
    estimator: "",
    priority: "Standard",
    notes: "",
  });
  const [status, setStatus] = useState("Ready to capture an opportunity.");
  const [isLoading, setIsLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function extractUpload(file: File | null) {
    if (!file) return;
    setIsLoading(true);
    setStatus("Reading the invitation...");

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/precon/extract", {
      method: "POST",
      body,
    });
    const data = (await response.json()) as {
      fields?: Partial<typeof form>;
      message?: string;
      error?: string;
    };

    if (data.fields) {
      setForm((current) => ({ ...current, ...data.fields }));
    }

    setStatus(data.message ?? data.error ?? "Upload processed.");
    setIsLoading(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("Submitting for preconstruction review...");

    const response = await fetch("/api/precon/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json()) as { message?: string; error?: string };

    setStatus(
      response.ok
        ? data.message ?? "Opportunity submitted for preconstruction review."
        : data.error ?? "Submission failed.",
    );
    setIsLoading(false);
  }

  const inputClass =
    "h-12 rounded-full border border-border bg-white/88 px-4 text-sm outline-none transition focus:border-foreground/35 focus:bg-white";
  const labelClass = "grid gap-2 text-[13px] font-medium text-foreground";

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={submit} className="template-card overflow-hidden p-0">
        <div className="border-b border-border bg-white/62 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                Pursuit Intake
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-[-0.055em]">
                Qualify the opportunity.
              </h2>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-foreground/30">
              <FileUp size={16} /> Upload ITB
              <input
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(event) => extractUpload(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              Intake Path
              <select value={form.source} onChange={(event) => update("source", event.target.value)} className={inputClass}>
                {sources.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Client / General Contractor
              <input required value={form.client} onChange={(event) => update("client", event.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              Project Name
              <input required value={form.projectName} onChange={(event) => update("projectName", event.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              Location
              <input value={form.projectLocation} onChange={(event) => update("projectLocation", event.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <label className={labelClass}>
              Market
              <select value={form.market} onChange={(event) => update("market", event.target.value)} className={inputClass}>
                {markets.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Bid Type
              <select value={form.bidType} onChange={(event) => update("bidType", event.target.value)} className={inputClass}>
                {bidTypes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Due Date
              <input type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              Priority
              <select value={form.priority} onChange={(event) => update("priority", event.target.value)} className={inputClass}>
                <option>Standard</option>
                <option>High</option>
                <option>Strategic relationship</option>
                <option>Limited fit</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <label className={labelClass}>
              Estimated Contract Value
              <input value={form.estimatedValue} onChange={(event) => update("estimatedValue", event.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              BD Touchpoint
              <select value={form.bdTouchpoint} onChange={(event) => update("bdTouchpoint", event.target.value)} className={inputClass}>
                {touchpoints.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Relationship Owner
              <input value={form.relationshipOwner} onChange={(event) => update("relationshipOwner", event.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              Suggested Estimator
              <input value={form.estimator} onChange={(event) => update("estimator", event.target.value)} className={inputClass} />
            </label>
          </div>

          <label className={labelClass}>
            Relationship Context
            <textarea
              value={form.relationshipContext}
              onChange={(event) => update("relationshipContext", event.target.value)}
              className="min-h-24 rounded-2xl border border-border bg-white/88 p-4 text-sm outline-none transition focus:border-foreground/35 focus:bg-white"
              placeholder="Recent lunch, dinner, survey, charity event, prior bid, client preference, or follow-up note."
            />
          </label>

          <label className={labelClass}>
            Scope, Risk, and Assignment Notes
            <textarea
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              className="min-h-24 rounded-2xl border border-border bg-white/88 p-4 text-sm outline-none transition focus:border-foreground/35 focus:bg-white"
              placeholder="Scope, schedule, risk, bid instructions, plan room notes, estimator fit, value exposure, or assignment recommendation."
            />
          </label>

          <button disabled={isLoading} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-80 disabled:cursor-wait disabled:opacity-60">
            Submit for review <ArrowRight size={16} />
          </button>
        </div>
      </form>

      <aside className="grid gap-5">
        <div className="template-card p-6">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Review Status
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-[0.92] tracking-[-0.065em]">
            {status}
          </h2>
        </div>

        {[
          [Inbox, "Intake", "BuildingConnected invitations and estimating emails become structured pursuit records."],
          [Handshake, "Relationship", "BD context stays attached to the opportunity and informs the pursuit decision."],
          [Users, "Review", "Preconstruction evaluates market, bid type, schedule, risk, relationship, and estimator fit."],
          [CalendarCheck, "Assignment", "Estimator assignment includes the rationale and required next action."],
          [ListChecks, "Follow-up", "BD can see which opportunities require client follow-up after review."],
        ].map(([Icon, title, body]) => (
          <div key={String(title)} className="template-card flex gap-4 p-5">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background">
              <Icon size={18} />
            </div>
            <div>
              <h3 className="font-semibold tracking-[-0.035em]">{String(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{String(body)}</p>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
