import { redirect } from "next/navigation";
import { PageShell } from "@/components/site-shell";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { listPreconOpportunities } from "@/lib/precon-opportunities";
import { PreconReviewActions } from "./review-actions";

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export default async function AdminPreconstructionPage() {
  if (!hasSupabaseConfig()) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : "";

  if (!email) redirect("/login");

  const allowed = adminEmails();
  const isAllowed = allowed.length === 0 || allowed.includes(email);
  const opportunities = await listPreconOpportunities();

  return (
    <PageShell>
      <main className="min-h-screen bg-background px-6 pt-28 text-foreground lg:px-12">
        <section className="mx-auto max-w-[1400px] py-16">
          <p className="font-mono text-sm uppercase tracking-[0.08em] text-muted">
            Weekly Preconstruction Review
          </p>
          <h1 className="mt-5 text-6xl font-semibold leading-[0.92] tracking-[-0.07em] md:text-8xl">
            Make pursuit decisions with context.
          </h1>

          {!isAllowed ? (
            <div className="template-card mt-10 p-6 text-muted">
              This account is signed in, but not listed in ADMIN_EMAILS.
            </div>
          ) : (
            <div className="mt-10 grid gap-4">
              {opportunities.length === 0 ? (
                <div className="template-card p-6 text-muted">
                  Opportunities submitted from preconstruction intake will appear
                  here for review, assignment, and follow-up.
                </div>
              ) : (
                opportunities.map((item) => (
                  <article key={item.id} className="template-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                          {item.status} / {item.market || "Market pending"} / {item.bidType || "Bid type pending"}
                        </span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em]">
                          {item.projectName}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {item.client} · {item.projectLocation || "Location pending"} · Due {item.dueDate || "Pending"}
                        </p>
                      </div>
                      <div className="text-right font-mono text-xs text-muted">
                        {item.priority}
                        <br />
                        {item.estimator || "Estimator pending"}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <p className="text-sm leading-6 text-muted">
                        <span className="block font-medium text-foreground">Relationship</span>
                        {item.relationshipOwner || "Owner pending"} · {item.bdTouchpoint || item.source}
                        <br />
                        {item.relationshipContext || "Relationship context pending."}
                      </p>
                      <p className="text-sm leading-6 text-muted">
                        <span className="block font-medium text-foreground">Bid</span>
                        {item.estimatedValue || "Value pending"}
                        <br />
                        {item.notes || "Scope and risk notes pending."}
                      </p>
                      <p className="text-sm leading-6 text-muted">
                        <span className="block font-medium text-foreground">Review</span>
                        {item.reviewReason || "Review pending."}
                        <br />
                        {item.nextSteps || ""}
                      </p>
                    </div>

                    {item.status === "new" ? (
                      <PreconReviewActions id={item.id} currentEstimator={item.estimator} />
                    ) : null}
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}
