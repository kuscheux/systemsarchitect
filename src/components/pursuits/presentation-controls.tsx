import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { MagnoliaChapterId, PresentationAppearance, PursuitChapter } from "@/data/pursuits/types";
import { ChapterStepper } from "@/components/pursuits/chapter-stepper";

type PresentationControlsProps = {
  chapters: PursuitChapter[];
  currentChapterId: MagnoliaChapterId;
  currentScene: number;
  sceneCount: number;
  isPlaying: boolean;
  canPlayVideo: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  disabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlayback: () => void;
  onToggleMuted: () => void;
  onToggleFullscreen: () => void;
  onSelectChapter: (chapterId: MagnoliaChapterId) => void;
  appearance: PresentationAppearance;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function PresentationControls({
  chapters,
  currentChapterId,
  currentScene,
  sceneCount,
  isPlaying,
  canPlayVideo,
  isMuted,
  isFullscreen,
  disabled,
  onPrevious,
  onNext,
  onTogglePlayback,
  onToggleMuted,
  onToggleFullscreen,
  onSelectChapter,
  appearance,
}: PresentationControlsProps) {
  const light = appearance === "light";
  const iconClass = light
    ? "text-black/66 hover:bg-black hover:text-white"
    : "text-white/68 hover:bg-white hover:text-black";
  return (
    <div className="relative z-40 px-3 pb-3 sm:px-6 sm:pb-5 lg:px-8">
      <div className={`border shadow-2xl shadow-black/18 backdrop-blur-xl ${light ? "border-black/12 bg-white/78 text-black" : "border-white/12 bg-black/46 text-white"}`}>
        <ChapterStepper
          chapters={chapters}
          currentChapterId={currentChapterId}
          onSelect={onSelectChapter}
          appearance={appearance}
        />
        <div className={`flex h-12 items-center gap-1 border-t px-2 sm:gap-2 sm:px-3 ${light ? "border-black/12" : "border-white/12"}`}>
          <button
            type="button"
            onClick={onPrevious}
            disabled={disabled}
            className={`grid size-9 shrink-0 place-items-center transition disabled:opacity-30 ${iconClass}`}
            aria-label="Previous scene"
            title="Previous scene"
          >
            <ArrowLeft size={16} />
          </button>
          {canPlayVideo ? (
            <button
              type="button"
              onClick={onTogglePlayback}
              className={`grid size-9 shrink-0 place-items-center transition ${light ? "bg-black text-white hover:bg-black/76" : "bg-white text-black hover:bg-white/82"}`}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className={`grid size-9 shrink-0 place-items-center transition disabled:opacity-30 ${iconClass}`}
            aria-label="Next scene"
            title="Next scene"
          >
            <ArrowRight size={16} />
          </button>

          <div className={`mx-2 hidden h-px flex-1 sm:block ${light ? "bg-black/14" : "bg-white/14"}`}>
            <div
              className={`h-px transition-[width] duration-500 ${light ? "bg-black" : "bg-white"}`}
              style={{ width: `${(currentScene / sceneCount) * 100}%` }}
            />
          </div>

          <p className="ml-auto whitespace-nowrap font-mono text-[10px] tabular-nums opacity-58 sm:ml-0 sm:text-xs">
            {pad(currentScene)} / {pad(sceneCount)}
          </p>
          {canPlayVideo ? (
            <button
              type="button"
              onClick={onToggleMuted}
              className={`grid size-9 shrink-0 place-items-center transition ${iconClass}`}
              aria-label={isMuted ? "Turn audio on" : "Mute audio"}
              title={isMuted ? "Audio on" : "Mute"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`grid size-9 shrink-0 place-items-center transition ${iconClass}`}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
