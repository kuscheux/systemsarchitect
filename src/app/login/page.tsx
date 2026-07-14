import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const isConfigured = hasSupabaseConfig();
  const params = await searchParams;
  const nextPath =
    params?.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/account";

  return (
    <PageShell>
      <main className="min-h-screen bg-background pt-28 text-foreground">
        <section className="noise-overlay section-grid relative overflow-hidden border-b border-border px-6 py-20 lg:px-12 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
          <div className="relative mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <Link
                href="/"
                className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
              >
                <ArrowLeft size={16} />
                Back to site
              </Link>
              <span className="mb-5 inline-flex items-center gap-3 font-mono text-sm text-muted">
                <span className="h-px w-12 bg-foreground/25" />
                Secure access
              </span>
              <h1 className="max-w-3xl text-6xl font-semibold leading-[0.9] tracking-[-0.065em] md:text-7xl lg:text-[104px]">
                Sign in to
                <br />
                1CG.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-muted">
                Customers can use email or Google. 1CG employees can also use
                a private PIN to open the internal project portal and Project
                Pins.
              </p>
            </div>

            <div className="grid gap-4">
              <LoginForm isConfigured={isConfigured} nextPath={nextPath} />
              <p className="px-2 text-xs leading-5 text-muted">
                Authentication is handled by Supabase Auth. Sessions are
                exchanged server-side and stored in secure cookies.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
