import Link from "next/link";
import { PageShell } from "@/components/site-shell";

export default function AuthCodeErrorPage() {
  return (
    <PageShell>
      <main className="grid min-h-screen place-items-center bg-background px-6 pt-24 text-foreground">
        <div className="template-card max-w-xl p-8">
          <span className="font-mono text-sm text-muted">Auth error</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em]">
            Sign-in could not be completed.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            The OAuth callback did not include a valid code, or Supabase is not
            configured yet.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-80"
          >
            Try again
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
