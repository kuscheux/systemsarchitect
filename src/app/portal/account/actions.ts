"use server";

import { randomBytes, scryptSync } from "node:crypto";
import { redirect } from "next/navigation";
import { requireEmployeePortalUser } from "@/lib/portal/auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function setEmployeePinAction(formData: FormData) {
  const { profile } = await requireEmployeePortalUser("/portal/account");
  const pin = String(formData.get("pin") ?? "").trim();
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (!/^\d{6}$/.test(pin) || pin !== confirmation) {
    redirect("/portal/account?error=pin");
  }

  const salt = randomBytes(24).toString("base64");
  const hash = scryptSync(pin, salt, 64).toString("base64");
  const service = createServiceClient();
  const { error } = await service.from("employee_pin_credentials").upsert({
    user_id: profile.user_id,
    pin_hash: hash,
    pin_salt: salt,
    failed_attempts: 0,
    locked_until: null,
  });
  if (error) redirect("/portal/account?error=setup");

  redirect("/portal/account?updated=1");
}
