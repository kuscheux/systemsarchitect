import { NextResponse } from "next/server";
import { createPreconOpportunity } from "@/lib/precon-opportunities";

interface Payload {
  source?: string;
  client?: string;
  projectName?: string;
  projectLocation?: string;
  market?: string;
  bidType?: string;
  dueDate?: string;
  estimatedValue?: string;
  relationshipOwner?: string;
  relationshipContext?: string;
  bdTouchpoint?: string;
  estimator?: string;
  priority?: string;
  notes?: string;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Payload;

  if (!payload.client || !payload.projectName) {
    return NextResponse.json(
      { error: "Client and project name are required." },
      { status: 400 },
    );
  }

  const record = await createPreconOpportunity({
    source: payload.source ?? "BuildingConnected invitation",
    client: payload.client,
    projectName: payload.projectName,
    projectLocation: payload.projectLocation ?? "",
    market: payload.market ?? "",
    bidType: payload.bidType ?? "",
    dueDate: payload.dueDate ?? "",
    estimatedValue: payload.estimatedValue ?? "",
    relationshipOwner: payload.relationshipOwner ?? "",
    relationshipContext: payload.relationshipContext ?? "",
    bdTouchpoint: payload.bdTouchpoint ?? "",
    estimator: payload.estimator ?? "",
    priority: payload.priority ?? "Standard",
    notes: payload.notes ?? "",
  });

  return NextResponse.json({
    opportunity: record,
    message: "Opportunity submitted for preconstruction review.",
  });
}
