import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { reviewPreconOpportunity, type PreconStatus } from "@/lib/precon-opportunities";

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 401 });
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userEmail =
    typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : "";
  const allowed = adminEmails();

  if (!userEmail || (allowed.length > 0 && !allowed.includes(userEmail))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as {
    status?: PreconStatus;
    estimator?: string;
    reviewReason?: string;
    nextSteps?: string;
  };
  const { id } = await params;

  if (
    body.status !== "reviewed" &&
    body.status !== "assigned" &&
    body.status !== "declined" &&
    body.status !== "follow-up"
  ) {
    return NextResponse.json({ error: "Choose a valid review status." }, { status: 400 });
  }

  const updated = await reviewPreconOpportunity(
    id,
    body.status,
    body.estimator ?? "",
    body.reviewReason ?? "",
    body.nextSteps ?? "",
  );

  if (!updated) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  return NextResponse.json({ opportunity: updated });
}
