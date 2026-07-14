"use client";

import { useEffect, useMemo, useState } from "react";
import { MousePointer2, Pause, Play, Radio, ScrollText } from "lucide-react";
import type {
  SessionTelemetryEvent,
  SessionTelemetryRecord,
} from "@/lib/session-telemetry";

interface SessionReplayViewerProps {
  sessions: SessionTelemetryRecord[];
  eventsBySession: Record<string, SessionTelemetryEvent[]>;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function eventLabel(event: SessionTelemetryEvent) {
  if (event.type === "mousemove") return "Cursor movement";
  if (event.type === "click") return event.target ? `Click / ${event.target}` : "Click";
  if (event.type === "scroll") return "Scroll";
  if (event.type === "route") return `Route / ${event.path}`;
  if (event.type === "visibility") return `Visibility / ${String(event.metadata.state ?? "")}`;
  return "Heartbeat";
}

function latestBefore(
  events: SessionTelemetryEvent[],
  playhead: number,
  type?: SessionTelemetryEvent["type"],
) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.elapsedMs <= playhead && (!type || event.type === type)) return event;
  }
  return null;
}

export function SessionReplayViewer({
  sessions,
  eventsBySession,
}: SessionReplayViewerProps) {
  const [selectedId, setSelectedId] = useState(sessions[0]?.id ?? "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  const selected = sessions.find((session) => session.id === selectedId) ?? sessions[0];
  const events = useMemo(
    () => (selected ? eventsBySession[selected.id] ?? [] : []),
    [eventsBySession, selected],
  );
  const duration = Math.max(1000, events[events.length - 1]?.elapsedMs ?? 0);
  const cursor = latestBefore(events, playhead, "mousemove") ?? latestBefore(events, playhead, "click");
  const click = latestBefore(events, playhead, "click");
  const route = latestBefore(events, playhead, "route");
  const scroll = latestBefore(events, playhead, "scroll");
  const nearbyEvents = events
    .filter((event) => Math.abs(event.elapsedMs - playhead) < 1800)
    .slice(-8);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setPlayhead((value) => {
        const next = value + 220;
        if (next >= duration) {
          window.clearInterval(interval);
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, 60);

    return () => window.clearInterval(interval);
  }, [duration, isPlaying]);

  if (!selected) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-8 text-white/52">
        No sessions yet. Open the public site in a new tab, move around, scroll,
        click a project, then refresh this admin view.
      </div>
    );
  }

  const cursorX = cursor?.x && cursor.viewportWidth ? (cursor.x / cursor.viewportWidth) * 100 : 50;
  const cursorY = cursor?.y && cursor.viewportHeight ? (cursor.y / cursor.viewportHeight) * 100 : 50;
  const scrollDepth = Number(scroll?.metadata.scrollDepth ?? selected.maxScrollDepth ?? 0);
  const activeClick =
    click && Math.abs(click.elapsedMs - playhead) < 520 && click.x !== null && click.y !== null;

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-[0_32px_100px_rgba(0,0,0,0.32)]">
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/38">
              Playlist
            </p>
            <p className="mt-1 text-sm text-white/62">{sessions.length} sessions</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100/80">
            <Radio size={13} />
            Live
          </span>
        </div>

        <div className="mt-2 grid max-h-[720px] gap-2 overflow-auto pr-1">
          {sessions.map((session, index) => {
            const isSelected = session.id === selected.id;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  setSelectedId(session.id);
                  setPlayhead(0);
                  setIsPlaying(false);
                }}
                className={`rounded-[20px] border p-4 text-left transition ${
                  isSelected
                    ? "border-white/28 bg-white text-black"
                    : "border-white/8 bg-white/[0.025] text-white hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-55">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs opacity-55">{formatTime(session.updatedAt)}</span>
                </div>
                <p className="mt-4 truncate text-xl font-semibold tracking-[-0.045em]">
                  {session.firstPath || "Unknown path"}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs opacity-65">
                  <span>{session.eventCount} events</span>
                  <span>{session.clickCount} clicks</span>
                  <span>{session.maxScrollDepth}% depth</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="grid gap-5">
        <div className="rounded-[32px] border border-white/10 bg-[#101113] p-4 shadow-[0_32px_120px_rgba(0,0,0,0.40)] md:p-5">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/38">
                {selected.locale || "Unknown locale"} / {selected.timezone || "Unknown timezone"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] md:text-5xl">
                {selected.firstPath || "Session"}
              </h2>
              <p className="mt-2 text-sm text-white/48">
                {formatTime(selected.startedAt)} · {formatDuration(duration)} · {selected.viewportWidth}x
                {selected.viewportHeight}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={() => setPlayhead(0)}
                className="rounded-full border border-white/14 px-5 py-3 text-sm text-white/78"
              >
                Restart
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
            <div>
              <div className="relative aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,#f8f8f8,#d8d8d8)]">
                <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(0,0,0,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.8)_1px,transparent_1px)] [background-size:48px_48px]" />
                <div className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/72">
                  {route?.path || selected.lastPath || selected.firstPath}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="h-2 overflow-hidden rounded-full bg-black/12">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{ width: `${Math.min(100, (playhead / duration) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-black/54">
                    <span>{formatDuration(playhead)}</span>
                    <span>{Math.round(scrollDepth)}% scroll depth</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>
                <div
                  className="absolute grid size-8 -translate-x-1 -translate-y-1 place-items-center rounded-full bg-black text-white shadow-[0_12px_34px_rgba(0,0,0,0.30)] transition-[left,top] duration-100"
                  style={{ left: `${cursorX}%`, top: `${cursorY}%` }}
                >
                  <MousePointer2 size={16} />
                </div>
                {activeClick ? (
                  <div
                    className="absolute size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/60"
                    style={{
                      left: `${(click.x! / Math.max(1, click.viewportWidth)) * 100}%`,
                      top: `${(click.y! / Math.max(1, click.viewportHeight)) * 100}%`,
                    }}
                  />
                ) : null}
              </div>

              <input
                type="range"
                min={0}
                max={duration}
                value={playhead}
                onChange={(event) => {
                  setIsPlaying(false);
                  setPlayhead(Number(event.target.value));
                }}
                className="mt-5 w-full accent-white"
              />
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/76">
                <ScrollText size={16} />
                Event stream
              </div>
              <div className="grid max-h-[420px] gap-2 overflow-auto pr-1">
                {nearbyEvents.length === 0 ? (
                  <p className="text-sm leading-6 text-white/42">
                    Scrub or press play to inspect the event stream.
                  </p>
                ) : (
                  nearbyEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-[16px] border border-white/8 bg-black/18 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                          {event.type}
                        </span>
                        <span className="text-xs text-white/38">
                          {formatDuration(event.elapsedMs)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-5 text-white/72">
                        {eventLabel(event)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
