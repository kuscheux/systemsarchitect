import { PageShell } from "@/components/site-shell";
import { PreconIntakeForm } from "./precon-intake-form";

const workflow = [
  ["01", "Relationship Context", "BD activity stays tied to the opportunity: lunches, dinners, surveys, charity events, client history, and prior bids."],
  ["02", "ITB Intake", "BuildingConnected invitations and estimating emails become structured pursuit records."],
  ["03", "Pursuit Review", "Preconstruction reviews scope, schedule, risk, relationship, bid type, and estimator fit."],
  ["04", "Assignment", "Each pursuit leaves with an owner, decision rationale, and next action."],
];

export default function PreconstructionPage() {
  return (
    <PageShell>
      <main className="pt-16">
        <section className="page-hero px-6 py-24 text-foreground lg:px-12 lg:py-32">
          <div className="relative mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="public-eyebrow">
                Business Development + Preconstruction
              </p>
              <h1 className="public-page-title mt-6">
                Control the pursuit before estimating starts.
              </h1>
            </div>
            <p className="self-end text-xl leading-8 text-muted lg:col-span-4">
              Capture invitations, relationship context, bid requirements, and
              assignment rationale before the weekly preconstruction review.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map(([number, title, body]) => (
              <div key={title} className="template-card p-6">
                <span className="font-mono text-xs text-muted">{number}</span>
                <h2 className="public-card-title mt-8">
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-12">
          <PreconIntakeForm />
        </section>
      </main>
    </PageShell>
  );
}
