"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type {
  ProjectDecision,
  PursuitChapter,
  PursuitScene,
  SourceReference,
  VendorProduct,
} from "@/data/pursuits/types";

type PresenterDrawerProps = {
  open: boolean;
  scene: PursuitScene;
  chapter: PursuitChapter;
  products: VendorProduct[];
  decisions: ProjectDecision[];
  sources: SourceReference[];
  previewSourceId: string | null;
  onPreviewSource: (sourceId: string | null) => void;
  onClose: () => void;
};

export function PresenterDrawer({
  open,
  scene,
  chapter,
  products,
  decisions,
  sources,
  previewSourceId,
  onPreviewSource,
  onClose,
}: PresenterDrawerProps) {
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previewIndex = sources.findIndex((source) => source.id === previewSourceId);
  const previewSource = previewIndex >= 0 ? sources[previewIndex] : null;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (previewSourceId) onPreviewSource(null);
        else onClose();
        return;
      }

      if (event.key !== "Tab" || previewSourceId) return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        "button, summary, a[href], [tabindex]:not([tabindex='-1'])",
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, onPreviewSource, open, previewSourceId]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[80] flex justify-end bg-black/32 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close presenter notes"
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="presenter-drawer-title"
        className="relative z-10 flex h-full w-full max-w-[460px] flex-col border-l border-white/12 bg-[#0b0c0e] text-white shadow-2xl shadow-black/60"
      >
        <header className="flex items-start justify-between gap-5 border-b border-white/12 p-5 sm:p-6">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase text-white/42">
              Presenter notes / {chapter.title}
            </p>
            <h2
              id="presenter-drawer-title"
              className="mt-2 truncate text-2xl font-semibold leading-none tracking-normal"
            >
              {scene.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center border border-white/14 bg-white/6 text-white transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close presenter notes"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <section>
            <p className="text-lg font-medium leading-7 text-white">
              {scene.presenterNote.lead}
            </p>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-white/66">
              {scene.presenterNote.talkingPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <Check size={15} className="mt-1 shrink-0 text-[#00a1e0]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {products.length ? (
            <section className="mt-8 border-t border-white/12 pt-6">
              <p className="font-mono text-[10px] uppercase text-white/42">Connected systems</p>
              <div className="mt-4 grid gap-px overflow-hidden border border-white/12 bg-white/12">
                {products.map((product) => (
                  <article key={product.id} className="bg-[#111317] p-4">
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">{product.category}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                      {product.specs.slice(0, 4).map((spec) => (
                        <div key={spec.label}>
                          <dt className="font-mono text-[8px] uppercase text-white/34">{spec.label}</dt>
                          <dd className="mt-1 text-xs font-medium text-white/76">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {decisions.length ? (
            <section className="mt-8 border-t border-white/12 pt-6">
              <p className="font-mono text-[10px] uppercase text-white/42">Recorded decisions</p>
              <dl className="mt-4 grid gap-4">
                {decisions.map((decision) => (
                  <div key={decision.id} className="border-l-2 border-[#00a1e0] pl-4">
                    <dt className="text-xs text-white/44">{decision.title}</dt>
                    <dd className="mt-1 text-sm font-medium leading-5 text-white/88">
                      {decision.selectedValue}
                    </dd>
                    {decision.rationale ? (
                      <dd className="mt-2 text-xs leading-5 text-white/48">{decision.rationale}</dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <details className="group mt-8 border-y border-white/12">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-medium text-white/74 marker:content-none">
              <span className="inline-flex items-center gap-2">
                <BookOpen size={15} /> Evidence &amp; source pages
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] text-white/36">
                22
                <ChevronRight size={14} className="transition group-open:rotate-90" />
              </span>
            </summary>
            <div className="border-t border-white/12 pb-5 pt-4">
              <p className="mb-4 text-xs leading-5 text-white/42">
                Original pages are retained as traceable evidence. Select one for full-resolution review.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {sources.map((source) => {
                  const connected = scene.sourcePageIds.includes(source.id);
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => onPreviewSource(source.id)}
                      className={`group/source overflow-hidden border text-left transition hover:border-white/48 ${
                        connected ? "border-[#00a1e0]/70 bg-[#00a1e0]/8" : "border-white/10 bg-white/[0.025]"
                      }`}
                    >
                      <div className="relative aspect-video bg-white">
                        <Image
                          src={source.thumbnail}
                          alt={`Source page ${source.page}: ${source.title}`}
                          fill
                          sizes="210px"
                          className="object-cover"
                        />
                      </div>
                      <span className="flex min-h-12 items-start gap-2 p-2 text-[10px] leading-4 text-white/56 group-hover/source:text-white">
                        <span className="font-mono text-white/30">{String(source.page).padStart(2, "0")}</span>
                        {source.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
      </aside>

      {previewSource ? (
        <div className="absolute inset-0 z-20 flex flex-col bg-black/96 p-3 text-white sm:p-6">
          <header className="flex items-center justify-between gap-3 pb-4">
            <button
              type="button"
              onClick={() => onPreviewSource(null)}
              className="inline-flex h-10 items-center gap-2 border border-white/16 bg-white/6 px-4 text-xs font-medium"
            >
              <ArrowLeft size={15} /> Presenter notes
            </button>
            <p className="min-w-0 truncate text-center text-xs text-white/62">
              {String(previewSource.page).padStart(2, "0")} / {String(sources.length).padStart(2, "0")} · {previewSource.title}
            </p>
            <button
              type="button"
              onClick={() => onPreviewSource(null)}
              className="grid size-10 shrink-0 place-items-center border border-white/16 bg-white/6"
              aria-label="Close source preview"
            >
              <X size={18} />
            </button>
          </header>
          <div className="relative min-h-0 flex-1 overflow-hidden bg-[#111]">
            <Image
              src={previewSource.full}
              alt={`Source page ${previewSource.page}: ${previewSource.title}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() =>
                onPreviewSource(sources[(previewIndex - 1 + sources.length) % sources.length].id)
              }
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center bg-black/74 backdrop-blur-xl sm:left-5"
              aria-label="Previous source page"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => onPreviewSource(sources[(previewIndex + 1) % sources.length].id)}
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center bg-black/74 backdrop-blur-xl sm:right-5"
              aria-label="Next source page"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
