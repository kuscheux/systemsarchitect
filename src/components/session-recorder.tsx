"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type {
  SessionTelemetryEventInput,
  SessionTelemetryEventType,
} from "@/lib/session-telemetry";

const excludedPathPrefixes = ["/admin", "/portal", "/login", "/account", "/auth"];
const maxQueueLength = 160;

function shouldRecord(pathname: string) {
  if (process.env.NEXT_PUBLIC_SESSION_REPLAY_ENABLED === "false") return false;
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return false;
  return !excludedPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function cleanTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return "";

  const tag = target.tagName.toLowerCase();
  const role = target.getAttribute("role");
  const href = target instanceof HTMLAnchorElement ? target.pathname : "";
  const aria = target.getAttribute("aria-label");
  const type =
    target instanceof HTMLButtonElement || target instanceof HTMLInputElement
      ? target.type
      : "";

  return [tag, role ? `role=${role}` : "", type ? `type=${type}` : "", href, aria]
    .filter(Boolean)
    .join(" ");
}

function scrollDepth() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return Math.min(100, Math.round((window.scrollY / scrollable) * 100));
}

function telemetryEvent(
  type: SessionTelemetryEventType,
  path: string,
  startedAt: number,
  details: Partial<SessionTelemetryEventInput> = {},
): SessionTelemetryEventInput {
  return {
    type,
    path,
    elapsedMs: performance.now() - startedAt,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    ...details,
    metadata: { scrollDepth: scrollDepth(), ...details.metadata },
  };
}

export function SessionRecorder() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>("");
  const queueRef = useRef<SessionTelemetryEventInput[]>([]);
  const startedAtRef = useRef<number>(0);
  const lastMouseAtRef = useRef<number>(0);
  const flushTimerRef = useRef<number | null>(null);
  const currentPathRef = useRef(pathname);

  useEffect(() => {
    currentPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!shouldRecord(window.location.pathname)) return;

    let disposed = false;
    startedAtRef.current = performance.now();

    const enqueue = (event: SessionTelemetryEventInput) => {
      if (!sessionIdRef.current) return;
      queueRef.current.push(event);
      if (queueRef.current.length > maxQueueLength) {
        queueRef.current.splice(0, queueRef.current.length - maxQueueLength);
      }
      if (queueRef.current.length >= 24) void flush();
    };

    const flush = async (useBeacon = false) => {
      if (!sessionIdRef.current || queueRef.current.length === 0) return;
      const events = queueRef.current.splice(0, 80);
      const body = JSON.stringify({ sessionId: sessionIdRef.current, events });

      if (useBeacon && "sendBeacon" in navigator) {
        navigator.sendBeacon(
          "/api/session/events",
          new Blob([body], { type: "application/json" }),
        );
        return;
      }

      try {
        await fetch("/api/session/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      } catch {
        queueRef.current.unshift(...events.slice(0, 40));
      }
    };

    const start = async () => {
      try {
        const response = await fetch("/api/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstPath: window.location.pathname + window.location.search,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language,
          }),
        });
        const data = (await response.json()) as { sessionId?: string };
        if (disposed || !data.sessionId) return;
        sessionIdRef.current = data.sessionId;
        enqueue(
          telemetryEvent("route", currentPathRef.current, startedAtRef.current, {
            metadata: { title: document.title },
          }),
        );
      } catch {
        // Telemetry must never affect the visitor experience.
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseAtRef.current < 220) return;
      lastMouseAtRef.current = now;
      enqueue(
        telemetryEvent("mousemove", currentPathRef.current, startedAtRef.current, {
          x: event.clientX,
          y: event.clientY,
        }),
      );
    };

    const onClick = (event: MouseEvent) => {
      enqueue(
        telemetryEvent("click", currentPathRef.current, startedAtRef.current, {
          x: event.clientX,
          y: event.clientY,
          target: cleanTarget(event.target),
        }),
      );
    };

    let scrollRaf: number | null = null;
    const onScroll = () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        enqueue(telemetryEvent("scroll", currentPathRef.current, startedAtRef.current));
      });
    };

    const onVisibility = () => {
      enqueue(
        telemetryEvent("visibility", currentPathRef.current, startedAtRef.current, {
          metadata: { state: document.visibilityState },
        }),
      );
      if (document.visibilityState === "hidden") void flush(true);
    };

    const onPageHide = () => {
      enqueue(telemetryEvent("heartbeat", currentPathRef.current, startedAtRef.current));
      void flush(true);
    };

    void start();
    flushTimerRef.current = window.setInterval(() => {
      enqueue(telemetryEvent("heartbeat", currentPathRef.current, startedAtRef.current));
      void flush();
    }, 8000);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      disposed = true;
      if (flushTimerRef.current) window.clearInterval(flushTimerRef.current);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      void flush(true);
    };
  }, []);

  useEffect(() => {
    if (!sessionIdRef.current || !shouldRecord(pathname)) return;
    queueRef.current.push(
      telemetryEvent("route", pathname, startedAtRef.current, {
        metadata: { title: document.title },
      }),
    );
  }, [pathname]);

  return null;
}
