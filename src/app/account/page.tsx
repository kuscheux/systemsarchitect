import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Clock3, FileSearch, Send } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { SignOutButton } from "./sign-out-button";

type ClientSubmission = {
  id: string;
  created_at: string;
  project_name: string;
  project_location: string;
  market: string;
  engagement_type: string;
  bid_due_date: string;
  public_status: string;
};

const statusLabels: Record<string, string> = {
  received: "Received",
  scope_review: "Scope Review",
  information_requested: "Information Requested",
  estimating: "Estimating",
  proposal_ready: "Proposal Ready",
  awarded: "Awarded",
  closed: "Closed",
};

const statusOrder = ["received", "scope_review", "estimating", "proposal_ready"];

export default async function AccountPage() {
  if (!hasSupabaseConfig()) {
    return (
      <PageShell>
        <main className="grid min-h-screen place-items-center bg-background px-6 pt-24 text-foreground">
          <div className="max-w-xl border border-border bg-white p-8">
            <span className="public-eyebrow">Supabase setup</span>
            <h1 className="public-card-title mt-4 text-4xl">Add Supabase credentials.</h1>
          </div>
        </main>
      </PageShell>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const email = typeof data.claims.email === "string" ? data.claims.email : "Signed-in user";
  const { data: submissionData } = await supabase.rpc("get_my_plan_submissions");
  const submissions = (submissionData ?? []) as ClientSubmission[];

  return (
    <PageShell>
      <main className="min-h-screen bg-background pt-24 text-foreground">
        <section className="border-b border-border px-6 py-16 lg:px-12 lg:py-24">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="public-eyebrow">Project Account</p>
              <h1 className="public-page-title mt-5 max-w-3xl">Plan review status.</h1>
              <p className="mt-6 text-lg text-muted">{email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/send-plans" className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background">
                Submit Another Project <ArrowRight size={15} />
              </Link>
              <SignOutButton />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-12 lg:py-24">
          {submissions.length === 0 ? (
            <div className="border border-border bg-white p-8 md:p-12">
              <Send size={22} className="text-muted" />
              <h2 className="public-card-title mt-8 text-3xl">No tracked submissions yet.</h2>
              <p className="mt-4 max-w-xl leading-7 text-muted">
                Submit plans while signed in and the project will appear here as estimating reviews it.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {submissions.map((submission) => {
                const currentIndex = Math.max(0, statusOrder.indexOf(submission.public_status));
                return (
                  <article key={submission.id} className="border border-border bg-white p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="public-eyebrow">{submission.market} / {submission.engagement_type}</p>
                        <h2 className="public-card-title mt-4 text-3xl">{submission.project_name}</h2>
                        <p className="mt-3 text-sm text-muted">{submission.project_location}</p>
                      </div>
                      <div className="w-fit rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
                        {statusLabels[submission.public_status] ?? "Under Review"}
                      </div>
                    </div>

                    <ol className="mt-8 grid gap-2 md:grid-cols-4">
                      {statusOrder.map((status, index) => {
                        const complete = index <= currentIndex;
                        return (
                          <li key={status} className={`flex min-h-16 items-center gap-3 border px-4 py-3 ${complete ? "border-foreground bg-foreground text-background" : "border-border text-muted"}`}>
                            {complete ? <Check size={15} /> : index === currentIndex + 1 ? <Clock3 size={15} /> : <FileSearch size={15} />}
                            <span className="text-xs font-medium">{statusLabels[status]}</span>
                          </li>
                        );
                      })}
                    </ol>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-xs text-muted">
                      <span>Submitted {new Date(submission.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {submission.bid_due_date ? <span>Bid due {submission.bid_due_date}</span> : null}
                      <span>Reference {submission.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}
