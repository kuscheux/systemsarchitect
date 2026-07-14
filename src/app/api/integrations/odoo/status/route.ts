import { NextResponse } from "next/server";
import { updatePreconPublicStatusByExternalId } from "@/lib/precon-opportunities";

const allowedStatuses = new Set([
  "received",
  "scope_review",
  "information_requested",
  "estimating",
  "proposal_ready",
  "awarded",
  "closed",
]);

export async function POST(request: Request) {
  const secret = process.env.ODOO_WEBHOOK_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as { externalId?: string; status?: string };
  if (!payload.externalId || !payload.status || !allowedStatuses.has(payload.status)) {
    return NextResponse.json({ error: "A valid externalId and public status are required." }, { status: 400 });
  }

  const updated = await updatePreconPublicStatusByExternalId(payload.externalId, payload.status);
  return NextResponse.json({ updated });
}
