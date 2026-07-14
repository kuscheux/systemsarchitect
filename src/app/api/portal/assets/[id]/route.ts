import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: asset, error } = await supabase
    .from("project_assets")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (error || !asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  const { data: signed, error: signError } = await supabase.storage
    .from("project-assets")
    .createSignedUrl(asset.storage_path, 60 * 5);
  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Asset could not be opened" }, { status: 500 });
  }
  return NextResponse.redirect(signed.signedUrl);
}

