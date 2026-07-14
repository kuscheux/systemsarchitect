import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { BlurWord } from "@/components/blur-word";
import { ScrollShowcase } from "@/components/landing/scroll-showcase";
import { getPublicProjects } from "@/lib/public-projects";

function OriginalMonochromeHero() {
  return (
    <section className="noise-overlay section-grid relative flex min-h-screen items-center overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-62 grayscale"
        src="/videos/1cg-install-timeline.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/48 to-black/12" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/72" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-36 lg:px-12 lg:py-44">
        <div className="max-w-[1280px]">
          <div className="mb-8 inline-flex items-center gap-3 font-mono text-sm text-white/62">
            <span className="h-px w-10 bg-white/35" />
            Commercial glazing and facade systems
          </div>
          <h1 className="max-w-[1280px] text-[clamp(3.25rem,7.55vw,8.3rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-white">
            <span className="block">Glass systems,</span>
            <span className="block">
              built to <BlurWord />.
            </span>
          </h1>
          <p className="mt-10 max-w-2xl text-xl leading-8 text-white/64">
            1CG delivers curtain wall, storefront, window wall, interior glass,
            heavy glass, and integrated facade systems from preconstruction
            through installation.
          </p>
          <div className="mt-10">
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Start a Project <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const projects = await getPublicProjects();
  return (
    <PageShell>
      <main className="bg-background">
        <OriginalMonochromeHero />
        <ScrollShowcase projects={projects} />
      </main>
    </PageShell>
  );
}
