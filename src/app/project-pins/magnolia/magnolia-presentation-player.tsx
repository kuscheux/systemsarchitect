"use client";

import Link from "next/link";
import { blinds } from "motion-plus/curtains";
import { useCurtains } from "motion-plus/react";
import { ArrowLeft, PanelRightOpen, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PresentationControls } from "@/components/pursuits/presentation-controls";
import { PresenterDrawer } from "@/components/pursuits/presenter-drawer";
import { PursuitBrandLockup } from "@/components/pursuits/pursuit-brand-lockup";
import { SceneStage } from "@/components/pursuits/scene-stage";
import {
  chapterFirstSceneIndex,
  magnoliaChapters,
  magnoliaScenes,
  magnoliaSourceReferences,
} from "@/data/presentation/magnolia-story";
import { magnoliaDecisions, magnoliaHotspots } from "@/data/projects/magnolia";
import type { Hotspot, MagnoliaChapterId } from "@/data/pursuits/types";
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
  const [previewSourceId, setPreviewSourceId] = useState<string | null>(null);
  const [focusedHotspotId, setFocusedHotspotId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const current = magnoliaScenes[index];
  const currentChapter = magnoliaChapters.find(
    (chapter) => chapter.id === current.chapterId,
  )!;
  const hideNarrative = isPlaying && Boolean(current.video);

  const sceneHotspots = useMemo(
    () =>
      current.hotspotIds
        .map((hotspotId) => magnoliaHotspots.find((hotspot) => hotspot.id === hotspotId))
        .filter((hotspot): hotspot is Hotspot => Boolean(hotspot)),
    [current.hotspotIds],
  );

  const drawerProducts = useMemo(() => {
    const hotspots = focusedHotspotId
      ? sceneHotspots.filter((hotspot) => hotspot.id === focusedHotspotId)
      : sceneHotspots;
    const productIds = new Set(
      hotspots.map((hotspot) => hotspot.productId).filter(Boolean),
    );
    return magnoliaVendorProducts.filter((product) => productIds.has(product.id));
  }, [focusedHotspotId, sceneHotspots]);

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
    setPreviewSourceId(null);
    setFocusedHotspotId(null);
    setDrawerOpen(false);
    setControlsVisible(true);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (isTransitioning) return;
      const normalized = (next + magnoliaScenes.length) % magnoliaScenes.length;
      const scope = stageRef.current;
      setPreviewSourceId(null);
      setFocusedHotspotId(null);
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

  const advancePlayback = useCallback(() => {
    if (index >= magnoliaScenes.length - 1) {
      setIsPlaying(false);
      setControlsVisible(true);
      return;
    }
    goTo(index + 1);
  }, [goTo, index]);

  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await stageRef.current?.requestFullscreen?.();
      else await document.exitFullscreen();
    } catch {
      // The player remains fully usable when browser fullscreen is unavailable.
    }
  }, []);

  const startPlayback = useCallback(async () => {
    setIsPlaying(true);
    setControlsVisible(true);
    scheduleControlsHide();
    if (!document.fullscreenElement) {
      try {
        await stageRef.current?.requestFullscreen?.();
      } catch {
        // Autoplay still works when fullscreen is blocked by the browser.
      }
    }
    await videoRef.current?.play().catch(() => undefined);
  }, [scheduleControlsHide]);

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

  const openDrawer = useCallback((hotspot?: Hotspot) => {
    setIsPlaying(false);
    videoRef.current?.pause();
    setFocusedHotspotId(hotspot?.id ?? null);
    setPreviewSourceId(null);
    setDrawerOpen(true);
    setControlsVisible(true);
    clearControlsTimer();
  }, [clearControlsTimer]);

  const selectChapter = useCallback(
    (chapterId: MagnoliaChapterId) => {
      const nextIndex = chapterFirstSceneIndex[chapterId];
      if (typeof nextIndex === "number" && nextIndex >= 0) goTo(nextIndex);
    },
    [goTo],
  );

  useEffect(() => {
    scheduleControlsHide();
    return clearControlsTimer;
  }, [clearControlsTimer, scheduleControlsHide]);

  useEffect(() => {
    if (!isPlaying || current.video) return;
    const timer = window.setTimeout(
      advancePlayback,
      current.durationMs ?? 9000,
    );
    return () => window.clearTimeout(timer);
  }, [advancePlayback, current.durationMs, current.video, isPlaying]);

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
    <main className="min-h-screen bg-[#050505] p-2 text-white sm:p-3 lg:p-4">
      <div
        ref={stageRef}
        className={`presentation-stage group relative mx-auto flex max-w-[1920px] flex-col overflow-hidden bg-black shadow-2xl shadow-black/40 ${
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
        <SceneStage
          scene={current}
          sceneIndex={index}
          videoRef={videoRef}
          isMuted={isMuted}
          hideNarrative={hideNarrative}
          sourceReferences={magnoliaSourceReferences}
          hotspots={sceneHotspots}
          onHotspotOpen={openDrawer}
          onVideoEnded={advancePlayback}
        />

        <header
          className={`absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-3 transition-opacity duration-300 sm:p-5 lg:p-6 ${
            controlsVisible || drawerOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <PursuitBrandLockup />
          <div className="flex items-center gap-2">
            <Link
              href="/project-pins"
              className="inline-flex h-11 items-center gap-2 border border-white/14 bg-black/38 px-3 text-xs font-medium text-white shadow-xl shadow-black/10 backdrop-blur-xl transition hover:bg-white hover:text-black sm:px-4"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Magnolia Landing</span>
              <span className="sm:hidden">Magnolia</span>
            </Link>
            <button
              type="button"
              onClick={() => openDrawer()}
              className="grid size-11 place-items-center border border-white/14 bg-black/38 text-white shadow-xl shadow-black/10 backdrop-blur-xl transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            disabled={isTransitioning}
            onPrevious={() => goTo(index - 1)}
            onNext={() => goTo(index + 1)}
            onTogglePlayback={togglePlayback}
            onToggleMuted={() => setIsMuted((value) => !value)}
            onToggleFullscreen={() => void requestFullscreen()}
            onSelectChapter={selectChapter}
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
          sources={magnoliaSourceReferences}
          previewSourceId={previewSourceId}
          onPreviewSource={setPreviewSourceId}
          onClose={closeDrawer}
        />
      </div>
    </main>
  );
}
