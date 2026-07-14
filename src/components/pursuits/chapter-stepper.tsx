import type { MagnoliaChapterId, PursuitChapter } from "@/data/pursuits/types";

type ChapterStepperProps = {
  chapters: PursuitChapter[];
  currentChapterId: MagnoliaChapterId;
  onSelect: (chapterId: MagnoliaChapterId) => void;
};

export function ChapterStepper({
  chapters,
  currentChapterId,
  onSelect,
}: ChapterStepperProps) {
  return (
    <nav
      className="flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Magnolia presentation chapters"
    >
      {chapters.map((chapter, index) => {
        const active = chapter.id === currentChapterId;
        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelect(chapter.id)}
            aria-current={active ? "step" : undefined}
            className={`group flex h-9 shrink-0 items-center gap-2 border-r border-white/12 px-3 text-left transition first:border-l sm:px-4 ${
              active ? "bg-white text-black" : "bg-black/30 text-white/48 hover:text-white"
            }`}
          >
            <span className="font-mono text-[9px] tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="hidden text-[11px] font-medium md:inline">{chapter.title}</span>
          </button>
        );
      })}
    </nav>
  );
}
