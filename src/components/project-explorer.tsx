"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/data/projects";

export function ProjectExplorer({
  projects,
  regions,
  markets,
}: {
  projects: Project[];
  regions: string[];
  markets: string[];
}) {
  const [region, setRegion] = useState("All");
  const [market, setMarket] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return projects.filter((project) => {
      const regionMatch = region === "All" || project.region === region;
      const marketMatch = market === "All" || project.market === market;
      const queryMatch =
        !needle ||
        [project.name, project.location, project.description, project.market, project.region]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return regionMatch && marketMatch && queryMatch;
    });
  }, [market, projects, query, region]);

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-14 lg:px-12">
      <div className="mb-10 grid gap-4 border-b border-border pb-6 lg:grid-cols-[1fr_auto_auto]">
        <label className="flex h-12 items-center gap-3 rounded-full border border-border bg-white/70 px-4 text-muted">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            placeholder="Search project, city, market"
          />
        </label>
        <Select label="Region" value={region} onChange={setRegion} options={["All", ...regions]} />
        <Select label="Market" value={market} onChange={setMarket} options={["All", ...markets]} />
      </div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="font-mono text-sm text-muted">
          {filtered.length} projects shown
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.08em] text-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 min-w-56 rounded-full border border-border bg-white/80 px-4 text-sm font-medium normal-case tracking-normal text-foreground outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
