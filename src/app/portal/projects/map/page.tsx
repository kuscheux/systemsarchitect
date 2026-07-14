import { PortalPageHeader } from "@/components/portal/portal-ui";
import { PortalProjectMap } from "@/components/portal/portal-project-map";
import { requirePortalUser } from "@/lib/portal/auth";
import { listProjects } from "@/lib/portal/data";

export default async function PortalProjectMapPage() {
  await requirePortalUser("/portal/projects/map");
  const projects = await listProjects();

  return (
    <div className="grid gap-8">
      <PortalPageHeader
        eyebrow="Projects / Private locations"
        title="Project map"
        description="Every internal project with verified coordinates, including draft pursuits that never appear on the public website."
      />
      <PortalProjectMap projects={projects} />
    </div>
  );
}
