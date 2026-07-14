import { PageShell } from "@/components/site-shell";
import { requireTelemetryAdmin } from "@/lib/admin-access";
import { listTelemetryEvents, listTelemetrySessions } from "@/lib/session-telemetry";
import { SessionReplayViewer } from "./replay-viewer";

export default async function AdminSessionsPage() {
  const admin = await requireTelemetryAdmin();

  if (!admin.isAllowed) {
    return (
      <PageShell>
        <main className="min-h-screen bg-background px-6 pt-28 text-foreground lg:px-12">
          <section className="mx-auto max-w-[1120px] py-16">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted">
              Session telemetry
            </p>
            <h1 className="mt-5 text-6xl font-semibold leading-[0.92] tracking-[-0.07em] md:text-8xl">
              Admin access required.
            </h1>
            <div className="template-card mt-10 p-6 text-muted">
              Signed in as {admin.email}, but this telemetry console is restricted
              to the configured replay admin list.
            </div>
          </section>
        </main>
      </PageShell>
    );
  }

  const sessions = await listTelemetrySessions(40);
  const playableSessions = sessions.slice(0, 12);
  const eventEntries = await Promise.all(
    playableSessions.map(async (session) => [
      session.id,
      await listTelemetryEvents(session.id, 1600),
    ] as const),
  );
  const eventsBySession = Object.fromEntries(eventEntries);

  return (
    <PageShell>
      <main className="min-h-screen bg-[#08090a] px-4 pt-24 text-white md:px-6 lg:px-8">
        <section className="mx-auto max-w-[1600px] py-8">
          <div className="mb-6 flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/42">
                RBAC telemetry / {admin.email}
              </p>
              <h1 className="mt-3 text-5xl font-semibold leading-[0.9] tracking-[-0.07em] md:text-7xl">
                Session playback.
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/54">
              First-party behavioral telemetry for public pages: movement,
              scroll, click targets, route changes, viewport, and timing. Form
              values, uploaded files, and admin pages are not recorded.
            </p>
          </div>

          <SessionReplayViewer sessions={sessions} eventsBySession={eventsBySession} />
        </section>
      </main>
    </PageShell>
  );
}
