import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Field,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/portal/portal-ui";
import type { JobPosting } from "@/lib/jobs/types";

interface JobPostingFormProps {
  action: (formData: FormData) => void | Promise<void>;
  job?: JobPosting | null;
}

export function JobPostingForm({ action, job }: JobPostingFormProps) {
  return (
    <form action={action} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-6 border border-zinc-200 bg-white p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Job title">
            <input name="title" required defaultValue={job?.title} className={inputClass} />
          </Field>
          <Field label="URL slug" hint="Leave blank to generate it from the title.">
            <input name="slug" defaultValue={job?.slug} className={inputClass} />
          </Field>
          <Field label="Department">
            <input name="department" required defaultValue={job?.department} placeholder="Preconstruction" className={inputClass} />
          </Field>
          <Field label="Location">
            <input name="location" required defaultValue={job?.location} placeholder="Charlotte, NC" className={inputClass} />
          </Field>
          <Field label="Employment type">
            <select name="employment_type" defaultValue={job?.employment_type || "Full-time"} className={inputClass}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </Field>
          <Field label="Workplace">
            <select name="workplace_type" defaultValue={job?.workplace_type || "On-site"} className={inputClass}>
              <option>On-site</option>
              <option>Field-based</option>
              <option>Hybrid</option>
              <option>Remote</option>
            </select>
          </Field>
        </div>

        <Field label="Short summary" hint="One direct sentence used on the careers listing.">
          <textarea name="summary" required defaultValue={job?.summary} className={`${textareaClass} min-h-24`} />
        </Field>
        <Field label="Role description" hint="Use short paragraphs. The public page preserves paragraph breaks.">
          <textarea name="description" required defaultValue={job?.description} className={`${textareaClass} min-h-48`} />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Responsibilities" hint="One item per line.">
            <textarea name="responsibilities" defaultValue={job?.responsibilities.join("\n")} className={`${textareaClass} min-h-48`} />
          </Field>
          <Field label="Qualifications" hint="One item per line.">
            <textarea name="qualifications" defaultValue={job?.qualifications.join("\n")} className={`${textareaClass} min-h-48`} />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Compensation" hint="Optional. Use a range or a concise statement.">
            <input name="compensation" defaultValue={job?.compensation} className={inputClass} />
          </Field>
          <Field label="Closing date" hint="Optional. The posting disappears after this date.">
            <input name="closes_at" type="date" defaultValue={job?.closes_at?.slice(0, 10)} className={inputClass} />
          </Field>
          <Field label="Application email" hint="Used when no external application URL is supplied.">
            <input name="application_email" type="email" defaultValue={job?.application_email} className={inputClass} />
          </Field>
          <Field label="External application URL" hint="Optional. This takes priority over the email address.">
            <input name="application_url" type="url" defaultValue={job?.application_url} className={inputClass} />
          </Field>
        </div>
      </div>

      <aside className="h-fit border border-zinc-200 bg-white p-5">
        <Field label="Publishing status">
          <select name="status" defaultValue={job?.status || "draft"} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </Field>
        <p className="mt-5 text-sm leading-6 text-zinc-500">
          Drafts remain internal. Published roles appear immediately. Closed roles retain their analytics but leave the public site.
        </p>
        <div className="mt-6 grid gap-2">
          <button className={primaryButtonClass}>{job ? "Save changes" : "Create posting"}</button>
          <Link href="/portal/jobs" className={secondaryButtonClass}>
            <ArrowLeft size={14} /> Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}

