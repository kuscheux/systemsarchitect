import { Plus } from "lucide-react";
import type { Hotspot } from "@/data/pursuits/types";

type HotspotLayerProps = {
  hotspots: Hotspot[];
  onOpen: (hotspot: Hotspot) => void;
};

export function HotspotLayer({ hotspots, onOpen }: HotspotLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-label="Project system locations">
      {hotspots.map((hotspot, index) => (
        <button
          key={hotspot.id}
          type="button"
          onClick={() => onOpen(hotspot)}
          className="group pointer-events-auto absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/55 bg-black/68 text-white shadow-[0_0_0_8px_rgba(255,255,255,0.08)] backdrop-blur-md transition hover:scale-110 hover:bg-white hover:text-black focus-visible:scale-110 focus-visible:bg-white focus-visible:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:size-9"
          style={{ left: `${hotspot.xPct}%`, top: `${hotspot.yPct}%` }}
          aria-label={`Open ${hotspot.label} details`}
        >
          <Plus size={14} />
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] hidden -translate-x-1/2 whitespace-nowrap bg-black/82 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-xl group-hover:block group-focus-visible:block sm:text-xs">
            {String(index + 1).padStart(2, "0")} / {hotspot.label}
          </span>
        </button>
      ))}
    </div>
  );
}
