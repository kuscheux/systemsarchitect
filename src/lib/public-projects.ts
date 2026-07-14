import { cache } from "react";
import { projects as staticProjects, type Project } from "@/data/projects";
import { getPublishedProjects } from "@/lib/portal/data";
import type { PublishedProject } from "@/lib/portal/types";

const REMOTE_TIMEOUT_MS = 1800;

function prefer(remote: string | null | undefined, fallback: string) {
  return remote?.trim() || fallback;
}

function mergeProject(remote: PublishedProject, fallback?: Project): Project {
  const base = fallback ?? {
    name: remote.name,
    slug: remote.slug,
    location: remote.location,
    region: remote.region,
    market: remote.market,
    description: remote.public_description,
    image: remote.image_url,
    video: remote.video_url,
    projectType: remote.project_type,
    scope: remote.scope,
    systems: remote.systems,
    completion: remote.completion,
    generalContractor: remote.general_contractor,
    architect: remote.architect,
    owner: remote.owner,
    projectSize: remote.project_size,
    stories: remote.stories,
    overview: remote.overview,
    challenge: remote.challenge,
    solution: remote.solution,
    result: remote.result,
  };

  return {
    ...base,
    name: prefer(remote.name, base.name),
    slug: prefer(remote.slug, base.slug),
    location: prefer(remote.location, base.location),
    region: prefer(remote.region, base.region),
    market: prefer(remote.market, base.market),
    description: prefer(remote.public_description, base.description),
    image: prefer(remote.image_url, base.image),
    video: prefer(remote.video_url, base.video),
    projectType: prefer(remote.project_type, base.projectType),
    scope: prefer(remote.scope, base.scope),
    systems: prefer(remote.systems, base.systems),
    completion: prefer(remote.completion, base.completion),
    generalContractor: prefer(remote.general_contractor, base.generalContractor),
    architect: prefer(remote.architect, base.architect),
    owner: prefer(remote.owner, base.owner),
    projectSize: prefer(remote.project_size, base.projectSize),
    stories: prefer(remote.stories, base.stories),
    overview: prefer(remote.overview, base.overview),
    challenge: prefer(remote.challenge, base.challenge),
    solution: prefer(remote.solution, base.solution),
    result: prefer(remote.result, base.result),
  };
}

async function remoteProjects() {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getPublishedProjects(),
      new Promise<PublishedProject[]>((resolve) => {
        timeout = setTimeout(() => resolve([]), REMOTE_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return [];
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export const getPublicProjects = cache(async (): Promise<Project[]> => {
  const remote = await remoteProjects();
  if (remote.length === 0) return staticProjects;

  const remoteBySlug = new Map(remote.map((project) => [project.slug, project]));
  const merged = staticProjects.map((project) => {
    const override = remoteBySlug.get(project.slug);
    if (!override) return project;
    remoteBySlug.delete(project.slug);
    return mergeProject(override, project);
  });

  return [...merged, ...Array.from(remoteBySlug.values(), (project) => mergeProject(project))];
});

export async function getPublicProject(slug: string) {
  return (await getPublicProjects()).find((project) => project.slug === slug) ?? null;
}
