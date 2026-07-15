import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Database,
  Factory,
  FolderKanban,
  LayoutDashboard,
  KeyRound,
  MapPinned,
  Megaphone,
  PanelLeft,
} from "lucide-react";
import { SignOutButton } from "@/app/account/sign-out-button";
import type { PortalProfile } from "@/lib/portal/types";

const portalNav = [
  ["Overview", "/portal", LayoutDashboard],
  ["Projects", "/portal/projects", FolderKanban],
  ["Companies", "/portal/companies", Building2],
  ["Project map", "/portal/projects/map", MapPinned],
  ["Asset library", "/portal/assets", Database],
  ["Fab requests", "/portal/fab-requests", Factory],
  ["Approvals", "/portal/approvals", ClipboardCheck],
  ["Publication", "/portal/publication-queue", Megaphone],
  ["Jobs", "/portal/jobs", BriefcaseBusiness],
  ["Account", "/portal/account", KeyRound],
] as const;

export function PortalShell({ children, profile }: { children: React.ReactNode; profile: PortalProfile }) {
  const visiblePortalNav = portalNav.filter(
    ([, href]) =>
      href !== "/portal/jobs" ||
      ["admin", "executive", "marketing"].includes(profile.role),
  );

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#0b0c0d] text-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo/1cg-line.svg" alt="1CG" width={84} height={50} className="h-auto w-[70px] brightness-0 invert" />
            <span className="h-5 w-px bg-white/20" />
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/55">Portal</span>
          </Link>
        </div>
        <nav className="grid gap-1 p-3">
          {visiblePortalNav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/64 transition hover:bg-white/[0.07] hover:text-white">
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 p-5">
          <p className="truncate text-sm font-medium">{profile.full_name || profile.email}</p>
          <p className="mt-1 text-xs capitalize text-white/45">{profile.role.replaceAll("_", " ")}</p>
          <div className="mt-4 [&_button]:h-9 [&_button]:border-white/15 [&_button]:px-3 [&_button]:text-xs [&_button]:text-white [&_button:hover]:bg-white/10">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-[#f5f5f3]/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5 md:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <PanelLeft size={18} className="text-zinc-400 lg:hidden" />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">1CG Operations</span>
            </div>
            <Link href="/" className="text-xs font-medium text-zinc-500 transition hover:text-zinc-950">View public site</Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-zinc-200 px-3 py-2 lg:hidden">
            {visiblePortalNav.map(([label, href, Icon]) => (
              <Link key={href} href={href} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700">
                <Icon size={13} /> {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
