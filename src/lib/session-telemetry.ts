import { createServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/service";

export type SessionTelemetryEventType =
  | "mousemove"
  | "click"
  | "scroll"
  | "route"
  | "visibility"
  | "heartbeat";

export interface SessionTelemetryRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string;
  endedAt: string;
  status: "active" | "ended";
  firstPath: string;
  lastPath: string;
  referrer: string;
  userAgent: string;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  timezone: string;
  locale: string;
  eventCount: number;
  clickCount: number;
  maxScrollDepth: number;
}

export interface SessionTelemetryEvent {
  id: string;
  sessionId: string;
  createdAt: string;
  type: SessionTelemetryEventType;
  path: string;
  elapsedMs: number;
  x: number | null;
  y: number | null;
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  target: string;
  metadata: Record<string, unknown>;
}

export interface SessionTelemetryStartInput {
  firstPath: string;
  referrer: string;
  userAgent: string;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  timezone: string;
  locale: string;
}

export interface SessionTelemetryEventInput {
  type: SessionTelemetryEventType;
  path?: string;
  elapsedMs?: number;
  x?: number | null;
  y?: number | null;
  scrollX?: number;
  scrollY?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  target?: string;
  metadata?: Record<string, unknown>;
}

type Store = {
  sessions: SessionTelemetryRecord[];
  events: SessionTelemetryEvent[];
};

const sessionsTable = "session_telemetry_sessions";
const eventsTable = "session_telemetry_events";
const globalStore = globalThis as typeof globalThis & {
  __sessionTelemetryStore?: Store;
};

function shouldUseTelemetrySupabase() {
  return (
    hasSupabaseServiceConfig() &&
    process.env.SESSION_TELEMETRY_USE_SUPABASE === "true"
  );
}

function store() {
  globalStore.__sessionTelemetryStore ??= { sessions: [], events: [] };
  return globalStore.__sessionTelemetryStore;
}

function toSessionDb(record: SessionTelemetryRecord) {
  return {
    id: record.id,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    started_at: record.startedAt,
    ended_at: record.endedAt,
    status: record.status,
    first_path: record.firstPath,
    last_path: record.lastPath,
    referrer: record.referrer,
    user_agent: record.userAgent,
    viewport_width: record.viewportWidth,
    viewport_height: record.viewportHeight,
    device_pixel_ratio: record.devicePixelRatio,
    timezone: record.timezone,
    locale: record.locale,
    event_count: record.eventCount,
    click_count: record.clickCount,
    max_scroll_depth: record.maxScrollDepth,
  };
}

function fromSessionDb(row: Record<string, unknown>): SessionTelemetryRecord {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    startedAt: String(row.started_at),
    endedAt: String(row.ended_at ?? row.updated_at),
    status: row.status === "ended" ? "ended" : "active",
    firstPath: String(row.first_path ?? ""),
    lastPath: String(row.last_path ?? ""),
    referrer: String(row.referrer ?? ""),
    userAgent: String(row.user_agent ?? ""),
    viewportWidth: Number(row.viewport_width ?? 0),
    viewportHeight: Number(row.viewport_height ?? 0),
    devicePixelRatio: Number(row.device_pixel_ratio ?? 1),
    timezone: String(row.timezone ?? ""),
    locale: String(row.locale ?? ""),
    eventCount: Number(row.event_count ?? 0),
    clickCount: Number(row.click_count ?? 0),
    maxScrollDepth: Number(row.max_scroll_depth ?? 0),
  };
}

function toEventDb(record: SessionTelemetryEvent) {
  return {
    id: record.id,
    session_id: record.sessionId,
    created_at: record.createdAt,
    type: record.type,
    path: record.path,
    elapsed_ms: record.elapsedMs,
    x: record.x,
    y: record.y,
    scroll_x: record.scrollX,
    scroll_y: record.scrollY,
    viewport_width: record.viewportWidth,
    viewport_height: record.viewportHeight,
    target: record.target,
    metadata: record.metadata,
  };
}

function fromEventDb(row: Record<string, unknown>): SessionTelemetryEvent {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};

  return {
    id: String(row.id),
    sessionId: String(row.session_id),
    createdAt: String(row.created_at),
    type: String(row.type) as SessionTelemetryEventType,
    path: String(row.path ?? ""),
    elapsedMs: Number(row.elapsed_ms ?? 0),
    x: row.x === null || row.x === undefined ? null : Number(row.x),
    y: row.y === null || row.y === undefined ? null : Number(row.y),
    scrollX: Number(row.scroll_x ?? 0),
    scrollY: Number(row.scroll_y ?? 0),
    viewportWidth: Number(row.viewport_width ?? 0),
    viewportHeight: Number(row.viewport_height ?? 0),
    target: String(row.target ?? ""),
    metadata,
  };
}

export async function createTelemetrySession(input: SessionTelemetryStartInput) {
  const now = new Date().toISOString();
  const session: SessionTelemetryRecord = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    endedAt: now,
    status: "active",
    firstPath: input.firstPath,
    lastPath: input.firstPath,
    referrer: input.referrer,
    userAgent: input.userAgent,
    viewportWidth: input.viewportWidth,
    viewportHeight: input.viewportHeight,
    devicePixelRatio: input.devicePixelRatio,
    timezone: input.timezone,
    locale: input.locale,
    eventCount: 0,
    clickCount: 0,
    maxScrollDepth: 0,
  };

  store().sessions.unshift(session);

  if (shouldUseTelemetrySupabase()) {
    try {
      const { error } = await createServiceClient()
        .from(sessionsTable)
        .insert(toSessionDb(session));
      if (error) console.warn(error.message);
    } catch {
      // Local fallback keeps telemetry usable when Supabase is not reachable.
    }
  }

  return session;
}

export async function appendTelemetryEvents(
  sessionId: string,
  inputs: SessionTelemetryEventInput[],
) {
  if (inputs.length === 0) return [];

  const now = new Date().toISOString();
  const records = inputs.slice(0, 80).map((input) => ({
    id: crypto.randomUUID(),
    sessionId,
    createdAt: now,
    type: input.type,
    path: input.path ?? "",
    elapsedMs: Math.max(0, Math.round(input.elapsedMs ?? 0)),
    x: typeof input.x === "number" ? Math.round(input.x) : null,
    y: typeof input.y === "number" ? Math.round(input.y) : null,
    scrollX: Math.max(0, Math.round(input.scrollX ?? 0)),
    scrollY: Math.max(0, Math.round(input.scrollY ?? 0)),
    viewportWidth: Math.max(0, Math.round(input.viewportWidth ?? 0)),
    viewportHeight: Math.max(0, Math.round(input.viewportHeight ?? 0)),
    target: String(input.target ?? "").slice(0, 240),
    metadata: input.metadata ?? {},
  }));

  store().events.push(...records);

  const last = records[records.length - 1];
  const clickCount = records.filter((event) => event.type === "click").length;
  const maxScrollDepth = records.reduce((max, event) => {
    const depth = Number(event.metadata.scrollDepth ?? 0);
    return Number.isFinite(depth) ? Math.max(max, depth) : max;
  }, 0);

  const localSession = store().sessions.find((session) => session.id === sessionId);
  if (localSession) {
    localSession.updatedAt = now;
    localSession.endedAt = now;
    localSession.lastPath = last.path || localSession.lastPath;
    localSession.eventCount += records.length;
    localSession.clickCount += clickCount;
    localSession.maxScrollDepth = Math.max(localSession.maxScrollDepth, maxScrollDepth);
  }

  if (shouldUseTelemetrySupabase()) {
    try {
      const supabase = createServiceClient();
      const { error } = await supabase.from(eventsTable).insert(records.map(toEventDb));
      if (error) console.warn(error.message);

      const { data: existing } = await supabase
        .from(sessionsTable)
        .select("event_count, click_count, max_scroll_depth")
        .eq("id", sessionId)
        .single();

      const existingEventCount = Number(existing?.event_count ?? 0);
      const existingClickCount = Number(existing?.click_count ?? 0);
      const existingMaxScrollDepth = Number(existing?.max_scroll_depth ?? 0);

      const { error: updateError } = await supabase
        .from(sessionsTable)
        .update({
          updated_at: now,
          ended_at: now,
          last_path: last.path,
          event_count: existingEventCount + records.length,
          click_count: existingClickCount + clickCount,
          max_scroll_depth: Math.max(existingMaxScrollDepth, maxScrollDepth),
        })
        .eq("id", sessionId);
      if (updateError) console.warn(updateError.message);
    } catch {
      // Local fallback keeps telemetry usable when Supabase is not reachable.
    }
  }

  return records;
}

export async function listTelemetrySessions(limit = 50) {
  if (shouldUseTelemetrySupabase()) {
    try {
      const { data, error } = await createServiceClient()
        .from(sessionsTable)
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (!error && data) return data.map(fromSessionDb);
      if (error) console.warn(error.message);
    } catch {
      // Local fallback keeps the admin view usable in development.
    }
  }

  return store().sessions.slice(0, limit);
}

export async function listTelemetryEvents(sessionId: string, limit = 2000) {
  if (shouldUseTelemetrySupabase()) {
    try {
      const { data, error } = await createServiceClient()
        .from(eventsTable)
        .select("*")
        .eq("session_id", sessionId)
        .order("elapsed_ms", { ascending: true })
        .limit(limit);

      if (!error && data) return data.map(fromEventDb);
      if (error) console.warn(error.message);
    } catch {
      // Local fallback keeps the admin view usable in development.
    }
  }

  return store()
    .events.filter((event) => event.sessionId === sessionId)
    .sort((a, b) => a.elapsedMs - b.elapsedMs)
    .slice(0, limit);
}
