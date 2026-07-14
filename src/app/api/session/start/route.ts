import { NextResponse } from "next/server";
import { createTelemetrySession } from "@/lib/session-telemetry";

interface StartPayload {
  firstPath?: string;
  referrer?: string;
  userAgent?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  devicePixelRatio?: number;
  timezone?: string;
  locale?: string;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as StartPayload;

  const session = await createTelemetrySession({
    firstPath: payload.firstPath ?? "/",
    referrer: payload.referrer ?? "",
    userAgent: payload.userAgent ?? request.headers.get("user-agent") ?? "",
    viewportWidth: Math.round(payload.viewportWidth ?? 0),
    viewportHeight: Math.round(payload.viewportHeight ?? 0),
    devicePixelRatio: payload.devicePixelRatio ?? 1,
    timezone: payload.timezone ?? "",
    locale: payload.locale ?? "",
  });

  return NextResponse.json({ sessionId: session.id });
}
