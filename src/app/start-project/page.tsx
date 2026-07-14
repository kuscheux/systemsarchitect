import Link from "next/link";
import { ArrowDown, ArrowRight, ClipboardList, LockKeyhole, Users } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { SendPlansForm } from "@/app/send-plans/send-plans-form";
import { StartProjectSwitcher } from "./start-project-switcher";

const routes = [
  {
    title: "Public Project Start",
    body: "For owners, GCs, architects, and developers sending a new opportunity into 1CG.",
    icon: Users,
  },
  {
    title: "Submit Plans",
    body: "The pinned action. Plans, specs, addenda, and project facts become the preconstruction record.",
    icon: ClipboardList,
  },
  {
    title: "1CG Internal Add",
    body: "Business development, estimating, and leadership can add opportunities through the protected workflow.",
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
        <section className="section-grid px-6 pb-16 pt-16 lg:px-12 lg:pb-24 lg:pt-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="public-eyebrow">Start a Project</p>
              <h1 className="public-page-title mt-6 max-w-5xl">
                One front door for new work.
              </h1>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-lg leading-8 text-muted">
                Public submissions and 1CG-originated opportunities should not
                split into different places. Start here, pin the plans, and let
                estimating and preconstruction review from one record.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#submit-plans"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-82"
                >
                  Submit Plans <ArrowDown size={16} />
                </a>
                <Link
                  href="/preconstruction"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-white px-6 text-sm font-medium text-foreground transition hover:border-foreground/28"
                >
                  1CG Team Intake <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 lg:px-12 lg:pb-28">
          <div className="mx-auto max-w-[1400px]">
            <StartProjectSwitcher />
          </div>
        </section>

        <section className="border-y border-border bg-[#f4f3ef] px-6 py-16 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
              {routes.map((route, index) => {
                const Icon = route.icon;
                return (
                  <article key={route.title} className="bg-background p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <Icon size={18} className="text-muted" />
                    </div>
                    <h2 className="public-card-title mt-14">{route.title}</h2>
                    <p className="mt-5 text-sm leading-7 text-muted">{route.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="submit-plans" className="scroll-mt-28 px-6 py-20 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="public-eyebrow">Pinned Action</p>
                <h2 className="public-section-title mt-5">
                  Submit the set. Keep the record clean.
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-muted lg:justify-self-end">
                This is the same submission path used by the existing public
                plan intake. If the visitor is signed in, the project can show
                up in their account for status review.
              </p>
            </div>
            <SendPlansForm signedInEmail={signedInEmail} />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
