"use client";

import { DragEvent, FormEvent, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  FileUp,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";

const projectTypes = [
  "Office",
  "Mixed-Use",
  "Education",
  "Healthcare",
  "Civic / Government",
  "Hospitality",
  "Residential",
  "Industrial",
  "Transportation",
  "Other Commercial",
] as const;

const scopes = [
  "Storefront",
  "Curtain Wall",
  "Window Wall",
  "Interior Glass / Heavy Glass",
  "Fire-Rated Glass",
  "Impact / Hurricane Systems",
  "Blast / Specialty Systems",
  "Door Hardware / Entrances",
  "Full Division 08",
  "Division 07 / 08 Coordination",
] as const;

const engagementTypes = [
  "Budget Pricing",
  "Full Bid",
  "VE Alternate",
  "Design-Assist",
  "Preconstruction Review",
] as const;

type SubmitState = "idle" | "submitting" | "success" | "error";

const inputClass =
  "h-13 w-full rounded-[8px] border border-border bg-white px-4 text-base text-foreground outline-none transition placeholder:text-muted/60 focus:border-foreground focus:ring-2 focus:ring-foreground/8 md:h-12 md:rounded-[6px] md:text-sm";
const labelClass = "grid gap-2 text-sm font-medium text-foreground";

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function SendPlansForm({ signedInEmail }: { signedInEmail: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(incoming: File[]) {
    setFiles((current) => {
      const existing = new Set(current.map(fileKey));
      const next = incoming.filter((file) => !existing.has(fileKey(file)));
      return [...current, ...next].slice(0, 8);
    });
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  function toggleScope(scope: string) {
    setSelectedScopes((current) =>
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitState("submitting");
    setMessage("");

    const formData = new FormData(formElement);
    formData.set("scopes", JSON.stringify(selectedScopes));
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/send-plans", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) throw new Error(data.error ?? "Submission failed.");

      setSubmitState("success");
      setMessage(
        data.message ??
          "Your project has been submitted for estimating review. The 1CG team will follow up after the first scope pass.",
      );
      formElement.reset();
      setFiles([]);
      setSelectedScopes([]);
    } catch (error) {
      setSubmitState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The submission could not be completed. Call 704 291 7711 for immediate help.",
      );
    }
  }

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <form onSubmit={submit} className="grid min-w-0 gap-12 md:block md:border md:border-border md:bg-white">
        <div className="md:border-b md:border-border md:p-8">
          <p className="public-eyebrow">01 / Project + Contact</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className={labelClass}>
              Contact Name <span className="sr-only">required</span>
              <input required name="contactName" autoComplete="name" className={inputClass} />
            </label>
            <label className={labelClass}>
              Company <span className="sr-only">required</span>
              <input required name="company" autoComplete="organization" className={inputClass} />
            </label>
            <label className={labelClass}>
              Email <span className="sr-only">required</span>
              <input required type="email" name="email" autoComplete="email" className={inputClass} />
            </label>
            <label className={labelClass}>
              Phone
              <input type="tel" name="phone" autoComplete="tel" className={inputClass} />
            </label>
            <label className={labelClass}>
              Project Name <span className="sr-only">required</span>
              <input required name="projectName" className={inputClass} />
            </label>
            <label className={labelClass}>
              Project Location <span className="sr-only">required</span>
              <input required name="projectLocation" className={inputClass} />
            </label>
            <label className={labelClass}>
              Bid Due Date
              <input type="date" name="bidDueDate" className={inputClass} />
            </label>
            <label className={labelClass}>
              Project Type <span className="sr-only">required</span>
              <select required name="projectType" defaultValue="" className={inputClass}>
                <option value="" disabled>Select a project type</option>
                {projectTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
          </div>
        </div>

        <fieldset className="md:border-b md:border-border md:p-8">
          <legend className="public-eyebrow">02 / Scope Needed</legend>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 md:gap-px md:overflow-hidden md:border md:border-border md:bg-border">
            {scopes.map((scope) => {
              const checked = selectedScopes.includes(scope);
              return (
                <label
                  key={scope}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-[8px] border border-border bg-white px-4 py-3 text-sm transition hover:border-foreground/28 md:rounded-none md:border-0 ${
                    checked ? "font-medium text-foreground" : "text-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleScope(scope)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-[4px] border ${
                      checked
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-white"
                    }`}
                  >
                    {checked ? <Check size={13} /> : null}
                  </span>
                  {scope}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="md:border-b md:border-border md:p-8">
          <legend className="public-eyebrow">03 / Engagement Type</legend>
          <div className="mt-6 flex flex-wrap gap-2">
            {engagementTypes.map((type) => (
              <label key={type} className="cursor-pointer">
                <input
                  type="radio"
                  required
                  name="engagementType"
                  value={type}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 items-center rounded-full border border-border bg-white px-4 text-sm text-muted transition hover:border-foreground/35 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-foreground/20">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="md:border-b md:border-border md:p-8">
          <p className="public-eyebrow">04 / Drawings + Specifications</p>
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`mt-6 grid min-h-48 place-items-center rounded-[8px] border border-dashed p-6 text-center transition md:rounded-none ${
              isDragging ? "border-foreground bg-secondary" : "border-foreground/24 bg-[#fafafa]"
            }`}
          >
        <div>
              <FileUp className="mx-auto text-muted" size={26} />
              <p className="mt-4 font-medium">Drop drawings, specs, and addenda here.</p>
              <p className="mt-2 text-sm text-muted">PDF, DWG, ZIP, or image files. Up to 8 files, 25 MB each.</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium transition hover:border-foreground/35"
              >
                Choose files
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.dwg,.dxf,.zip,.png,.jpg,.jpeg,.tif,.tiff"
                className="sr-only"
                onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
              />
            </div>
          </div>

          {files.length > 0 ? (
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-[8px] border border-border bg-white md:rounded-none">
              {files.map((file) => (
                <li key={fileKey(file)} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <FileText size={16} className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="font-mono text-[10px] text-muted">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((current) => current.filter((item) => fileKey(item) !== fileKey(file)))}
                    aria-label={`Remove ${file.name}`}
                    className="text-muted transition hover:text-foreground"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="md:p-8">
          <label className={labelClass}>
            Project Notes
            <textarea
              name="notes"
              className="min-h-36 w-full rounded-[8px] border border-border bg-white p-4 text-base text-foreground outline-none transition placeholder:text-muted/60 focus:border-foreground focus:ring-2 focus:ring-foreground/8 md:rounded-[6px] md:text-sm"
              placeholder="Scope questions, alternate requests, schedule constraints, system concerns, or bid instructions."
            />
          </label>

          <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-muted">
            <input required type="checkbox" name="consent" className="mt-1 size-4 accent-black" />
            <span>
              I confirm that I am authorized to share these project documents
              with 1CG for estimating and preconstruction review.
            </span>
          </label>

          <div className="mt-5 rounded-[8px] border border-border bg-secondary/65 p-4 text-sm leading-6 text-muted md:rounded-none">
            {signedInEmail ? (
              <p>
                Status tracking is on for <span className="font-medium text-foreground">{signedInEmail}</span>.
                This submission will appear in your account.
              </p>
            ) : (
              <p>
                Want to review status later?{" "}
                <Link href="/login?next=/send-plans" className="font-medium text-foreground underline underline-offset-4">
                  Create a profile or sign in
                </Link>{" "}
                before submitting.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitState === "submitting"}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-82 disabled:cursor-wait disabled:opacity-55"
          >
            {submitState === "submitting" ? "Submitting…" : "Submit Plans"}
            {submitState !== "submitting" ? <ArrowRight size={16} /> : null}
          </button>

          {message ? (
            <div
              role="status"
              className={`mt-4 border px-4 py-3 text-sm leading-6 ${
                submitState === "success"
                  ? "border-emerald-900/15 bg-emerald-50 text-emerald-950"
                  : "border-red-900/15 bg-red-50 text-red-950"
              }`}
            >
              <p>{message}</p>
              {submitState === "success" && signedInEmail ? (
                <Link href="/account" className="mt-2 inline-flex font-medium underline underline-offset-4">
                  View project status
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>

      <aside className="border border-border bg-[#0b0d10] p-6 text-white lg:sticky lg:top-28 md:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/48">1CG Preconstruction</p>
        <h3 className="mt-5 text-4xl font-semibold leading-[0.94] tracking-[-0.05em]">
          One glazing partner. Every opening.
        </h3>
        <ul className="mt-8 grid gap-4 border-y border-white/12 py-6 text-sm text-white/72">
          {[
            "Curtain wall to storefront",
            "Preconstruction-minded estimating",
            "In-house fabrication and logistics",
            "Built for complex commercial scopes",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <Check size={15} className="text-white/48" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/42">Talk first</p>
          <a href="tel:+17042917711" className="mt-3 flex items-center gap-3 text-xl font-semibold tracking-[-0.035em]">
            <Phone size={17} className="text-white/42" /> 704 291 7711
          </a>
          <a href="mailto:estimating@glass1st.net" className="mt-3 flex items-center gap-3 text-sm text-white/66 transition hover:text-white">
            <Mail size={16} /> estimating@glass1st.net
          </a>
        </div>

        <div className="mt-8 flex gap-3 border-t border-white/12 pt-6 text-xs leading-5 text-white/48">
          <ShieldCheck size={17} className="mt-0.5 shrink-0" />
          Project documents are used for estimating and preconstruction review by the 1CG team.
        </div>
      </aside>
    </div>
  );
}
