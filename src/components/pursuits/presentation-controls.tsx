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
import type { MagnoliaChapterId, PursuitChapter } from "@/data/pursuits/types";
import { ChapterStepper } from "@/components/pursuits/chapter-stepper";

type PresentationControlsProps = {
  chapters: PursuitChapter[];
  currentChapterId: MagnoliaChapterId;
  currentScene: number;
  sceneCount: number;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  disabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlayback: () => void;
  onToggleMuted: () => void;
  onToggleFullscreen: () => void;
  onSelectChapter: (chapterId: MagnoliaChapterId) => void;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function PresentationControls({
  chapters,
  currentChapterId,
  currentScene,
  sceneCount,
  isPlaying,
  isMuted,
  isFullscreen,
  disabled,
  onPrevious,
  onNext,
  onTogglePlayback,
  onToggleMuted,
  onToggleFullscreen,
  onSelectChapter,
}: PresentationControlsProps) {
  return (
    <div className="relative z-40 px-3 pb-3 sm:px-6 sm:pb-5 lg:px-8">
      <div className="border border-white/12 bg-black/46 shadow-2xl shadow-black/28 backdrop-blur-xl">
        <ChapterStepper
          chapters={chapters}
          currentChapterId={currentChapterId}
          onSelect={onSelectChapter}
        />
        <div className="flex h-12 items-center gap-1 border-t border-white/12 px-2 sm:gap-2 sm:px-3">
          <button
            type="button"
            onClick={onPrevious}
            disabled={disabled}
            className="grid size-9 shrink-0 place-items-center text-white/68 transition hover:bg-white hover:text-black disabled:opacity-30"
            aria-label="Previous scene"
            title="Previous scene"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onTogglePlayback}
            className="grid size-9 shrink-0 place-items-center bg-white text-black transition hover:bg-white/82"
            aria-label={isPlaying ? "Pause presentation" : "Play presentation"}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className="grid size-9 shrink-0 place-items-center text-white/68 transition hover:bg-white hover:text-black disabled:opacity-30"
            aria-label="Next scene"
            title="Next scene"
          >
            <ArrowRight size={16} />
          </button>

          <div className="mx-2 hidden h-px flex-1 bg-white/14 sm:block">
            <div
              className="h-px bg-white transition-[width] duration-500"
              style={{ width: `${(currentScene / sceneCount) * 100}%` }}
            />
          </div>

          <p className="ml-auto whitespace-nowrap font-mono text-[10px] tabular-nums text-white/58 sm:ml-0 sm:text-xs">
            {pad(currentScene)} / {pad(sceneCount)}
          </p>
          <button
            type="button"
            onClick={onToggleMuted}
            className="grid size-9 shrink-0 place-items-center text-white/68 transition hover:bg-white hover:text-black"
            aria-label={isMuted ? "Turn audio on" : "Mute audio"}
            title={isMuted ? "Audio on" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="grid size-9 shrink-0 place-items-center text-white/68 transition hover:bg-white hover:text-black"
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
