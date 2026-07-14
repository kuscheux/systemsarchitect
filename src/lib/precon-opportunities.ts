import { createServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/service";

export type PreconStatus =
  | "new"
  | "reviewed"
  | "assigned"
  | "declined"
  | "follow-up";

export interface PreconOpportunity {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: PreconStatus;
  source: string;
  client: string;
  projectName: string;
  projectLocation: string;
  market: string;
  bidType: string;
  dueDate: string;
  estimatedValue: string;
  relationshipOwner: string;
  relationshipContext: string;
  bdTouchpoint: string;
  estimator: string;
  priority: string;
  notes: string;
  reviewReason?: string;
  nextSteps?: string;
  submitterUserId?: string;
  publicStatus?: string;
  externalProvider?: string;
  externalId?: string;
}

type Store = {
  opportunities: PreconOpportunity[];
};

const globalStore = globalThis as typeof globalThis & {
  __preconOpportunityStore?: Store;
};

const tableName = "precon_opportunities";

function publicStatusFor(status: Exclude<PreconStatus, "new">) {
  return status === "assigned"
    ? "estimating"
    : status === "follow-up"
      ? "information_requested"
      : status === "declined"
        ? "closed"
        : "scope_review";
}

function store() {
  globalStore.__preconOpportunityStore ??= { opportunities: [] };
  return globalStore.__preconOpportunityStore;
}

function toDb(record: PreconOpportunity) {
  return {
    id: record.id,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    status: record.status,
    source: record.source,
    client: record.client,
    project_name: record.projectName,
    project_location: record.projectLocation,
    market: record.market,
    bid_type: record.bidType,
    due_date: record.dueDate,
    estimated_value: record.estimatedValue,
    relationship_owner: record.relationshipOwner,
    relationship_context: record.relationshipContext,
    bd_touchpoint: record.bdTouchpoint,
    estimator: record.estimator,
    priority: record.priority,
    notes: record.notes,
    review_reason: record.reviewReason ?? "",
    next_steps: record.nextSteps ?? "",
    submitter_user_id: record.submitterUserId ?? null,
    public_status: record.publicStatus ?? "received",
    external_provider: record.externalProvider ?? "none",
    external_id: record.externalId ?? "",
  };
}

function fromDb(row: Record<string, unknown>): PreconOpportunity {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    status: String(row.status) as PreconStatus,
    source: String(row.source ?? ""),
    client: String(row.client ?? ""),
    projectName: String(row.project_name ?? ""),
    projectLocation: String(row.project_location ?? ""),
    market: String(row.market ?? ""),
    bidType: String(row.bid_type ?? ""),
    dueDate: String(row.due_date ?? ""),
    estimatedValue: String(row.estimated_value ?? ""),
    relationshipOwner: String(row.relationship_owner ?? ""),
    relationshipContext: String(row.relationship_context ?? ""),
    bdTouchpoint: String(row.bd_touchpoint ?? ""),
    estimator: String(row.estimator ?? ""),
    priority: String(row.priority ?? ""),
    notes: String(row.notes ?? ""),
    reviewReason: String(row.review_reason ?? ""),
    nextSteps: String(row.next_steps ?? ""),
    submitterUserId: row.submitter_user_id ? String(row.submitter_user_id) : undefined,
    publicStatus: String(row.public_status ?? "received"),
    externalProvider: String(row.external_provider ?? "none"),
    externalId: String(row.external_id ?? ""),
  };
}

export async function createPreconOpportunity(
  input: Omit<PreconOpportunity, "id" | "createdAt" | "updatedAt" | "status">,
) {
  const now = new Date().toISOString();
  const record: PreconOpportunity = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "new",
  };

  store().opportunities.unshift(record);

  if (hasSupabaseServiceConfig()) {
    const { error } = await createServiceClient().from(tableName).insert(toDb(record));
    if (error) console.warn(error.message);
  }

  return record;
}

export async function listPreconOpportunities() {
  if (hasSupabaseServiceConfig()) {
    const { data, error } = await createServiceClient()
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) return data.map(fromDb);
    if (error) console.warn(error.message);
  }

  return store().opportunities;
}

export async function reviewPreconOpportunity(
  id: string,
  status: Exclude<PreconStatus, "new">,
  estimator: string,
  reviewReason: string,
  nextSteps: string,
) {
  const updatedAt = new Date().toISOString();
  const record = store().opportunities.find((item) => item.id === id);

  if (!record && hasSupabaseServiceConfig()) {
    const { data, error } = await createServiceClient()
      .from(tableName)
      .update({
        status,
        estimator,
        review_reason: reviewReason,
        next_steps: nextSteps,
        public_status: publicStatusFor(status),
        updated_at: updatedAt,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (!error && data) return fromDb(data);
    if (error) console.warn(error.message);
  }

  if (!record) return null;

  record.status = status;
  record.estimator = estimator;
  record.reviewReason = reviewReason;
  record.nextSteps = nextSteps;
  record.publicStatus = publicStatusFor(status);
  record.updatedAt = updatedAt;

  if (hasSupabaseServiceConfig()) {
    const { error } = await createServiceClient()
      .from(tableName)
      .update(toDb(record))
      .eq("id", id);
    if (error) console.warn(error.message);
  }

  return record;
}

export async function linkPreconExternalWorkflow(
  id: string,
  provider: string,
  externalId: string,
) {
  const record = store().opportunities.find((item) => item.id === id);
  if (record) {
    record.externalProvider = provider;
    record.externalId = externalId;
    record.updatedAt = new Date().toISOString();
  }

  if (hasSupabaseServiceConfig()) {
    const { error } = await createServiceClient()
      .from(tableName)
      .update({
        external_provider: provider,
        external_id: externalId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) console.warn(error.message);
  }
}

export async function updatePreconPublicStatusByExternalId(
  externalId: string,
  publicStatus: string,
) {
  const record = store().opportunities.find((item) => item.externalId === externalId);
  if (record) {
    record.publicStatus = publicStatus;
    record.updatedAt = new Date().toISOString();
  }

  if (!hasSupabaseServiceConfig()) return Boolean(record);
  const { data, error } = await createServiceClient()
    .from(tableName)
    .update({ public_status: publicStatus, updated_at: new Date().toISOString() })
    .eq("external_id", externalId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data || record);
}
