import { PortalShell } from "@/components/portal/portal-shell";
import { requireEmployeePortalUser } from "@/lib/portal/auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireEmployeePortalUser();
  return <PortalShell profile={profile}>{children}</PortalShell>;
}
