"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  const play = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {
      // Hover exit can interrupt playback before the browser resolves play().
    });
  };

  const pause = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-[22px] border border-border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(10,12,16,0.10)]"
      onMouseEnter={(event) => play(event.currentTarget.querySelector("video"))}
      onMouseLeave={(event) => pause(event.currentTarget.querySelector("video"))}
    >
      <div className="relative aspect-[1.35] overflow-hidden bg-black">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="ai-photo-image object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-0"
          />
        ) : null}
        <video
          className="ai-photo-video absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          muted
          loop
          playsInline
          preload="none"
          src={project.video}
        />
        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 font-mono text-[11px] text-white/75 backdrop-blur">
          {project.region}
        </div>
      </div>
      <div className="grid min-h-48 gap-4 p-5">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.08em] text-muted">
            {project.market}
          </p>
          <h3 className="public-card-title text-foreground">
            {project.name}
          </h3>
          <p className="mt-2 text-sm text-muted">{project.location}</p>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-muted">{project.description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          View Project <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}
