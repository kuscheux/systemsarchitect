import { KeyRound, ShieldCheck } from "lucide-react";
import { Field, PortalPageHeader, inputClass, primaryButtonClass } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { setEmployeePinAction } from "./actions";

export default async function PortalAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const [{ profile }, params] = await Promise.all([
    requirePortalUser("/portal/account"),
    searchParams,
  ]);

  return (
    <div className="grid gap-8">
      <PortalPageHeader
        eyebrow="Access / Employee account"
        title="Account security"
        description="Create a private six-digit employee PIN for faster access to the internal portal and Project Pins."
      />

      <section className="grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-zinc-200 bg-white p-6">
          <ShieldCheck size={22} className="text-zinc-400" />
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Employee</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{profile.full_name || profile.email}</h2>
          <p className="mt-2 text-sm text-zinc-500">{profile.email}</p>
          <p className="mt-1 text-sm capitalize text-zinc-500">{profile.role.replaceAll("_", " ")} · {profile.department || "1CG"}</p>
        </div>

        <form action={setEmployeePinAction} className="grid gap-5 border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.035em]">Employee PIN</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Use six digits known only to you. Replacing the PIN immediately invalidates the previous one.</p>
            </div>
            <KeyRound size={20} className="shrink-0 text-zinc-400" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New PIN">
              <input name="pin" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="new-password" required className={inputClass} />
            </Field>
            <Field label="Confirm PIN">
              <input name="confirmation" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="new-password" required className={inputClass} />
            </Field>
          </div>
          <button className={primaryButtonClass}>Set employee PIN</button>
          {params.updated ? <p role="status" className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Employee PIN updated.</p> : null}
          {params.error === "pin" ? <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-900">Enter the same six-digit PIN in both fields.</p> : null}
          {params.error === "setup" ? <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-900">PIN setup is not available until the latest Supabase migration is applied.</p> : null}
        </form>
      </section>
    </div>
  );
}
