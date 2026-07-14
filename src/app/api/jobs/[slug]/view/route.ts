import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/service";

const visitorCookie = "1cg_job_visitor";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasSupabaseServiceConfig()) return new NextResponse(null, { status: 204 });

  const { slug } = await params;
  if (!slug || slug.length > 100) return new NextResponse(null, { status: 400 });

  const supabase = createServiceClient();
  const { data: job } = await supabase
    .from("job_postings")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .abortSignal(AbortSignal.timeout(1500))
    .maybeSingle();

  if (!job) return new NextResponse(null, { status: 204 });

  const currentVisitor = request.cookies.get(visitorCookie)?.value || "";
  const visitorId = uuidPattern.test(currentVisitor) ? currentVisitor : crypto.randomUUID();
  const referrer = (request.headers.get("referer") || "").slice(0, 500);

  await supabase.from("job_posting_views").upsert(
    {
      job_id: job.id,
      visitor_id: visitorId,
      viewed_on: new Date().toISOString().slice(0, 10),
      referrer,
    },
    { onConflict: "job_id,visitor_id,viewed_on", ignoreDuplicates: true },
  );

  const response = new NextResponse(null, { status: 204 });
  if (visitorId !== currentVisitor) {
    response.cookies.set(visitorCookie, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
