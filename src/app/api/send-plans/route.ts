import { NextResponse } from "next/server";
import {
  createPreconOpportunity,
  linkPreconExternalWorkflow,
} from "@/lib/precon-opportunities";
import {
  createServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { erpAdapter } from "@/lib/integrations/erp";

const MAX_FILES = 8;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

function textField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const contactName = textField(formData, "contactName");
  const company = textField(formData, "company");
  const email = textField(formData, "email");
  const phone = textField(formData, "phone");
  const projectName = textField(formData, "projectName");
  const projectLocation = textField(formData, "projectLocation");
  const bidDueDate = textField(formData, "bidDueDate");
  const projectType = textField(formData, "projectType");
  const engagementType = textField(formData, "engagementType");
  const notes = textField(formData, "notes");
  const consent = textField(formData, "consent");
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  let submitterUserId: string | undefined;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (typeof data?.claims?.sub === "string") submitterUserId = data.claims.sub;
  } catch {
    submitterUserId = undefined;
  }

  let scopes: string[] = [];
  try {
    const parsed = JSON.parse(textField(formData, "scopes"));
    if (Array.isArray(parsed)) scopes = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    scopes = [];
  }

  if (!contactName || !company || !email || !projectName || !projectLocation || !projectType || !engagementType || !consent) {
    return NextResponse.json(
      { error: "Complete the required project, contact, engagement, and consent fields." },
      { status: 400 },
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid work email address." }, { status: 400 });
  }

  if (files.length > MAX_FILES || files.some((file) => file.size > MAX_FILE_BYTES)) {
    return NextResponse.json(
      { error: "Attach no more than 8 files, with a maximum size of 25 MB per file." },
      { status: 400 },
    );
  }

  const record = await createPreconOpportunity({
    source: "Public plan submission",
    client: company,
    projectName,
    projectLocation,
    market: projectType,
    bidType: engagementType,
    dueDate: bidDueDate,
    estimatedValue: "",
    relationshipOwner: "",
    relationshipContext: `${contactName} · ${email}${phone ? ` · ${phone}` : ""}`,
    bdTouchpoint: "Website plan intake",
    estimator: "",
    priority: "Standard",
    notes: [
      scopes.length ? `Scope: ${scopes.join(", ")}` : "Scope: To be confirmed",
      notes ? `Notes: ${notes}` : "",
      files.length ? `Submitted files: ${files.map((file) => file.name).join(", ")}` : "No files attached",
    ].filter(Boolean).join("\n"),
    submitterUserId,
    publicStatus: "received",
    externalProvider: "none",
    externalId: "",
  });

  let filesStored = files.length === 0;

  if (files.length > 0 && hasSupabaseServiceConfig()) {
    const supabase = createServiceClient();
    const uploads = await Promise.all(
      files.map((file) =>
        supabase.storage
          .from("project-assets")
          .upload(
            `preconstruction/${record.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`,
            file,
            { contentType: file.type || "application/octet-stream", upsert: false },
          ),
      ),
    );
    filesStored = uploads.every(({ error }) => !error);
  }

  try {
    const external = await erpAdapter.createPlanSubmission({
      submissionId: record.id,
      projectName,
      projectLocation,
      company,
      contactName,
      email,
      phone,
      engagementType,
      projectType,
      scopes,
      bidDueDate,
      notes,
    });
    if (external.provider !== "none" && external.externalId) {
      await linkPreconExternalWorkflow(record.id, external.provider, external.externalId);
    }
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "Odoo workflow sync failed.");
  }

  return NextResponse.json({
    opportunityId: record.id,
    message: filesStored
      ? "Your project has been submitted for estimating review. The 1CG team will follow up after the first scope pass."
      : "Your project details were received. The 1CG team will contact you if the attached files need to be resent.",
  });
}
