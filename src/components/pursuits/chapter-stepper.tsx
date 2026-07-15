import type { MagnoliaChapterId, PresentationAppearance, PursuitChapter } from "@/data/pursuits/types";

type ChapterStepperProps = {
  chapters: PursuitChapter[];
  currentChapterId: MagnoliaChapterId;
  onSelect: (chapterId: MagnoliaChapterId) => void;
  appearance: PresentationAppearance;
};

export function ChapterStepper({
  chapters,
  currentChapterId,
  onSelect,
  appearance,
}: ChapterStepperProps) {
  const light = appearance === "light";
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
            className={`group flex h-9 shrink-0 items-center gap-2 border-r px-3 text-left transition first:border-l sm:px-4 ${light ? "border-black/12" : "border-white/12"} ${
              active ? light ? "bg-black text-white" : "bg-white text-black" : light ? "bg-white/28 text-black/48 hover:text-black" : "bg-black/30 text-white/48 hover:text-white"
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
