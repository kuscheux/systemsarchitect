import { NextResponse } from "next/server";
import {
  appendTelemetryEvents,
  type SessionTelemetryEventInput,
  type SessionTelemetryEventType,
} from "@/lib/session-telemetry";

const eventTypes: SessionTelemetryEventType[] = [
  "mousemove",
  "click",
  "scroll",
  "route",
  "visibility",
  "heartbeat",
];

interface EventsPayload {
  sessionId?: string;
  events?: SessionTelemetryEventInput[];
}

function isValidEventType(value: unknown): value is SessionTelemetryEventType {
  return typeof value === "string" && eventTypes.includes(value as SessionTelemetryEventType);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as EventsPayload;

  if (!payload.sessionId || !Array.isArray(payload.events)) {
    return NextResponse.json({ error: "Session id and events are required." }, { status: 400 });
  }

  const events = payload.events.filter((event) => isValidEventType(event.type));
  const saved = await appendTelemetryEvents(payload.sessionId, events);

  return NextResponse.json({ accepted: saved.length });
}
