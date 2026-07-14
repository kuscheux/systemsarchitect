import { scryptSync, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function safeNextPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/portal";
}

function invalidPinResponse() {
  return NextResponse.json(
    { error: "Employee PIN sign-in was not accepted." },
    { status: 401 },
  );
}

export async function POST(request: Request) {
  let payload: { email?: unknown; pin?: unknown; nextPath?: unknown };
  try {
    payload = await request.json();
  } catch {
    return invalidPinResponse();
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const pin = typeof payload.pin === "string" ? payload.pin.trim() : "";
  const nextPath = safeNextPath(payload.nextPath);
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(pin)) return invalidPinResponse();

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("user_id,email,role")
    .eq("email", email)
    .maybeSingle();
  if (!profile || profile.role === "viewer") return invalidPinResponse();

  const { data: credential, error: credentialError } = await service
    .from("employee_pin_credentials")
    .select("user_id,pin_hash,pin_salt,failed_attempts,locked_until")
    .eq("user_id", profile.user_id)
    .maybeSingle();
  if (credentialError || !credential) return invalidPinResponse();

  if (credential.locked_until && new Date(credential.locked_until).getTime() > Date.now()) {
    return NextResponse.json(
      { error: "This employee PIN is temporarily locked. Use email sign-in or try again later." },
      { status: 423 },
    );
  }

  const expected = Buffer.from(credential.pin_hash, "base64");
  const received = scryptSync(pin, credential.pin_salt, expected.length);
  const isValid = expected.length === received.length && timingSafeEqual(expected, received);

  if (!isValid) {
    const failedAttempts = credential.failed_attempts + 1;
    await service
      .from("employee_pin_credentials")
      .update({
        failed_attempts: failedAttempts >= MAX_ATTEMPTS ? 0 : failedAttempts,
        locked_until:
          failedAttempts >= MAX_ATTEMPTS
            ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
            : null,
      })
      .eq("user_id", profile.user_id);
    return invalidPinResponse();
  }

  await service
    .from("employee_pin_credentials")
    .update({ failed_attempts: 0, locked_until: null })
    .eq("user_id", profile.user_id);

  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: "magiclink",
    email: profile.email,
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) return invalidPinResponse();

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (verifyError) return invalidPinResponse();

  return NextResponse.json({ ok: true, nextPath });
}
