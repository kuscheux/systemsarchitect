import { ClipboardList, LockKeyhole, Users } from "lucide-react";
import { SendPlansForm } from "@/app/send-plans/send-plans-form";
import { PageShell } from "@/components/site-shell";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const routes = [
  {
    title: "Public Project Start",
    body: "Owners, general contractors, architects, and developers can create one complete preconstruction record.",
    icon: Users,
  },
  {
    title: "Plans + Scope",
    body: "Drawings, specifications, addenda, dates, and scope needs stay attached to the opportunity from the first review.",
    icon: ClipboardList,
  },
  {
    title: "1CG Internal Routing",
    body: "Business development, estimating, and leadership review the same record for assignment, follow-up, and status.",
    icon: LockKeyhole,
  },
] as const;

async function getSignedInEmail() {
  if (!hasSupabaseConfig()) return "";

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    return typeof data?.claims?.email === "string" ? data.claims.email : "";
  } catch {
    return "";
  }
}

export default async function StartProjectPage() {
  const signedInEmail = await getSignedInEmail();

  return (
    <PageShell>
      <main className="bg-background pt-20">
        <section
          id="submit-plans"
          className="section-grid scroll-mt-24 px-5 pb-20 pt-14 sm:px-6 lg:px-12 lg:pb-28 lg:pt-24"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:pb-14">
              <div>
                <p className="public-eyebrow">Start a Project</p>
                <h1 className="public-page-title mt-5 max-w-5xl text-balance">
                  One front door for new work.
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted lg:justify-self-end lg:text-lg lg:leading-8">
                Share the project facts, current documents, and scope once. 1CG
                routes one complete record to estimating and preconstruction for
                review.
              </p>
            </div>

            <SendPlansForm signedInEmail={signedInEmail} />
          </div>
        </section>

        <section className="border-y border-border bg-[#f4f3ef] px-5 py-16 sm:px-6 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="public-eyebrow">One Connected Intake</p>
                <h2 className="public-section-title mt-4 max-w-3xl">
                  Submit once. Review from one record.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted lg:justify-self-end">
                The public submission and the internal review path use the same
                project record, reducing handoffs before the first scope pass.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
              {routes.map((route, index) => {
                const Icon = route.icon;
                return (
                  <article key={route.title} className="bg-background p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-mono text-xs uppercase text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <Icon size={18} className="text-muted" />
                    </div>
                    <h3 className="public-card-title mt-14">{route.title}</h3>
                    <p className="mt-5 text-sm leading-7 text-muted">{route.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
