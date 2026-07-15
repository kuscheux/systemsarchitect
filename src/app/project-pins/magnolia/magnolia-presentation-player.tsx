"use client";

import Link from "next/link";
import { blinds } from "motion-plus/curtains";
import { useCurtains } from "motion-plus/react";
import { ArrowLeft, Monitor, Moon, PanelRightOpen, Play, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PresentationControls } from "@/components/pursuits/presentation-controls";
import { PresenterDrawer } from "@/components/pursuits/presenter-drawer";
import { PursuitBrandLockup } from "@/components/pursuits/pursuit-brand-lockup";
import { SceneRenderer } from "@/components/pursuits/scene-renderer";
import {
  chapterFirstSceneIndex,
  magnoliaChapters,
  magnoliaScenes,
  magnoliaSourceReferences,
} from "@/data/presentation/magnolia-story";
import { magnoliaDecisions, magnoliaHotspots } from "@/data/projects/magnolia";
import type { Hotspot, MagnoliaChapterId, PresentationTheme } from "@/data/pursuits/types";
import { magnoliaVendorProducts } from "@/data/vendors";

const CONTROLS_IDLE_MS = 2000;

export function MagnoliaPresentationPlayer() {
  const [curtains, isTransitioning] = useCurtains();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [theme, setTheme] = useState<PresentationTheme>("auto");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const current = magnoliaScenes[index];
  const currentChapter = magnoliaChapters.find(
    (chapter) => chapter.id === current.chapterId,
  )!;
  const hideNarrative = isPlaying && Boolean(current.video);
  const appearance = theme === "auto" ? current.preferredTheme : theme;
  const isReferenceScene = current.type === "reference";

  const sceneHotspots = useMemo(
    () =>
      current.hotspotIds
        .map((hotspotId) => magnoliaHotspots.find((hotspot) => hotspot.id === hotspotId))
        .filter((hotspot): hotspot is Hotspot => Boolean(hotspot)),
    [current.hotspotIds],
  );
  const resolvedHotspotId = sceneHotspots.some((item) => item.id === activeHotspotId)
    ? activeHotspotId
    : sceneHotspots[0]?.id ?? null;
  const resolvedReferenceId = current.referenceProjects?.some(
    (item) => item.id === selectedReferenceId,
  )
    ? selectedReferenceId
    : current.referenceProjects?.[0]?.id ?? null;

  const drawerProducts = useMemo(() => {
    const hotspots = resolvedHotspotId
      ? sceneHotspots.filter((hotspot) => hotspot.id === resolvedHotspotId)
      : sceneHotspots;
    const productIds = new Set([
      ...(current.productIds ?? []),
      ...hotspots.map((hotspot) => hotspot.productId).filter((id): id is string => Boolean(id)),
    ]);
    return magnoliaVendorProducts.filter((product) => productIds.has(product.id));
  }, [current.productIds, resolvedHotspotId, sceneHotspots]);

  const drawerDecisions = useMemo(() => {
    const ids = new Set(current.decisionIds ?? []);
    return magnoliaDecisions.filter((decision) => ids.has(decision.id));
  }, [current.decisionIds]);

  const clearControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) {
      window.clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  }, []);

  const scheduleControlsHide = useCallback(() => {
    clearControlsTimer();
    if (drawerOpen) return;
    controlsTimerRef.current = window.setTimeout(
      () => setControlsVisible(false),
      CONTROLS_IDLE_MS,
    );
  }, [clearControlsTimer, drawerOpen]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setControlsVisible(true);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (isTransitioning) return;
      const normalized = (next + magnoliaScenes.length) % magnoliaScenes.length;
      const scope = stageRef.current;
      setActiveHotspotId(null);
      setSelectedReferenceId(null);
      setDrawerOpen(false);

      if (!scope) {
        setIndex(normalized);
        return;
      }

      const slatSize = Math.max(56, Math.min(92, Math.round(scope.clientHeight / 9)));
      void curtains(() => setIndex(normalized), {
        effect: blinds({ direction: "row", directionMode: "normal", size: slatSize }),
        transition: [{ duration: 0.28 }, { duration: 0.34 }],
        scope,
      });
    },
    [curtains, isTransitioning],
  );

  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await stageRef.current?.requestFullscreen?.();
      else await document.exitFullscreen();
    } catch {
      // The player remains fully usable when browser fullscreen is unavailable.
    }
  }, []);

  const startPlayback = useCallback(async () => {
    if (!current.video) return;
    setIsPlaying(true);
    setControlsVisible(true);
    scheduleControlsHide();
    await videoRef.current?.play().catch(() => undefined);
  }, [current.video, scheduleControlsHide]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      videoRef.current?.pause();
      setControlsVisible(true);
      scheduleControlsHide();
    } else {
      void startPlayback();
    }
  }, [isPlaying, scheduleControlsHide, startPlayback]);

  const openDrawer = useCallback(() => {
    setIsPlaying(false);
    videoRef.current?.pause();
    setDrawerOpen(true);
    setControlsVisible(true);
    clearControlsTimer();
  }, [clearControlsTimer]);

  const cycleTheme = useCallback(() => {
    setTheme((value) => {
      const next = value === "auto" ? "light" : value === "light" ? "dark" : "auto";
      window.localStorage.setItem("1cg-magnolia-theme", next);
      return next;
    });
  }, []);

  const selectChapter = useCallback(
    (chapterId: MagnoliaChapterId) => {
      const nextIndex = chapterFirstSceneIndex[chapterId];
      if (typeof nextIndex === "number" && nextIndex >= 0) goTo(nextIndex);
    },
    [goTo],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("1cg-magnolia-theme");
    if (saved !== "auto" && saved !== "light" && saved !== "dark") return;
    const frame = window.requestAnimationFrame(() => setTheme(saved));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    scheduleControlsHide();
    return clearControlsTimer;
  }, [clearControlsTimer, scheduleControlsHide]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    if (isPlaying) void video.play().catch(() => undefined);
    else video.pause();
  }, [current.id, isMuted, isPlaying]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (drawerOpen) return;
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === " ") {
        event.preventDefault();
        togglePlayback();
      }
      if (event.key.toLowerCase() === "f") void requestFullscreen();
      if (event.key.toLowerCase() === "m") setIsMuted((value) => !value);
      if (event.key.toLowerCase() === "n") openDrawer();
      revealControls();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, goTo, index, openDrawer, requestFullscreen, revealControls, togglePlayback]);

  return (
    <main className={`min-h-screen p-2 sm:p-3 lg:p-4 ${appearance === "light" ? "bg-[#e9e9e5] text-black" : "bg-[#050505] text-white"}`}>
      <div
        ref={stageRef}
        data-presentation-theme={appearance}
        className={`presentation-stage group relative mx-auto flex max-w-[1920px] flex-col overflow-hidden ${isReferenceScene ? "shadow-none" : "shadow-2xl shadow-black/40"} ${appearance === "light" ? "bg-[#f2f2ef] text-black" : "bg-black text-white"} ${
          isFullscreen && !controlsVisible && !drawerOpen ? "cursor-none" : ""
        }`}
        onPointerMove={revealControls}
        onPointerDown={revealControls}
        onTouchStart={(event) => {
          touchStartRef.current = event.touches[0]?.clientX ?? null;
          revealControls();
        }}
        onTouchEnd={(event) => {
          if (drawerOpen) return;
          const start = touchStartRef.current;
          const end = event.changedTouches[0]?.clientX;
          touchStartRef.current = null;
          if (start == null || end == null || Math.abs(end - start) < 48) return;
          goTo(index + (end < start ? 1 : -1));
        }}
      >
        <SceneRenderer
          scene={current}
          sceneIndex={index}
          videoRef={videoRef}
          isMuted={isMuted}
          hideNarrative={hideNarrative}
          appearance={appearance}
          hotspots={sceneHotspots}
          activeHotspotId={resolvedHotspotId}
          selectedReferenceId={resolvedReferenceId}
          onSelectHotspot={setActiveHotspotId}
          onSelectReference={setSelectedReferenceId}
          interactionPaused={drawerOpen}
          onVideoEnded={() => {
            setIsPlaying(false);
            setControlsVisible(true);
          }}
        />

        <header
          className={`absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-3 transition-opacity duration-300 sm:p-5 lg:p-6 ${
            controlsVisible || drawerOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <PursuitBrandLockup appearance={appearance} />
          <div className="flex items-center gap-2">
            <Link
              href="/project-pins"
              className={`inline-flex h-11 items-center gap-2 border px-3 text-xs font-medium backdrop-blur-xl transition sm:px-4 ${isReferenceScene ? "shadow-none" : "shadow-xl"} ${appearance === "light" ? "border-black/12 bg-white/82 text-black hover:bg-black hover:text-white" : "border-white/14 bg-black/38 text-white hover:bg-white hover:text-black"}`}
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Magnolia Landing</span>
              <span className="sm:hidden">Magnolia</span>
            </Link>
            <button
              type="button"
              onClick={cycleTheme}
              className={`grid size-11 place-items-center border backdrop-blur-xl transition ${isReferenceScene ? "shadow-none" : "shadow-xl"} ${appearance === "light" ? "border-black/12 bg-white/82 text-black hover:bg-black hover:text-white" : "border-white/14 bg-black/38 text-white hover:bg-white hover:text-black"}`}
              aria-label={`Theme: ${theme}. Change theme`}
              title={`Theme: ${theme}`}
            >
              {theme === "auto" ? <Monitor size={18} /> : theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={() => openDrawer()}
              className={`grid size-11 place-items-center border backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 ${isReferenceScene ? "shadow-none" : "shadow-xl"} ${appearance === "light" ? "border-black/12 bg-white/82 text-black hover:bg-black hover:text-white focus-visible:ring-black" : "border-white/14 bg-black/38 text-white hover:bg-white hover:text-black focus-visible:ring-white"}`}
              aria-label="Open presenter notes"
              title="Presenter notes"
            >
              <PanelRightOpen size={18} />
            </button>
          </div>
        </header>

        <div
          className={`relative z-40 mt-auto transition-opacity duration-300 ${
            controlsVisible && !drawerOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <PresentationControls
            chapters={magnoliaChapters}
            currentChapterId={current.chapterId}
            currentScene={index + 1}
            sceneCount={magnoliaScenes.length}
            isPlaying={isPlaying}
            canPlayVideo={Boolean(current.video)}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            disabled={isTransitioning}
            onPrevious={() => goTo(index - 1)}
            onNext={() => goTo(index + 1)}
            onTogglePlayback={togglePlayback}
            onToggleMuted={() => setIsMuted((value) => !value)}
            onToggleFullscreen={() => void requestFullscreen()}
            onSelectChapter={selectChapter}
            appearance={appearance}
          />
        </div>

        {!isPlaying && index === 0 && controlsVisible && !drawerOpen ? (
          <button
            type="button"
            onClick={() => void startPlayback()}
            className="absolute inset-0 z-30 grid place-items-center bg-black/6 text-white transition hover:bg-transparent"
            aria-label="Play Magnolia Landing presentation fullscreen"
          >
            <span className="grid size-20 place-items-center rounded-full bg-white text-black shadow-2xl shadow-black/30 transition hover:scale-105 sm:size-24">
              <Play size={32} fill="currentColor" />
            </span>
          </button>
        ) : null}

        <PresenterDrawer
          open={drawerOpen}
          scene={current}
          chapter={currentChapter}
          products={drawerProducts}
          decisions={drawerDecisions}
          appearance={appearance}
          sources={magnoliaSourceReferences}
          onClose={closeDrawer}
        />
      </div>
    </main>
  );
}
