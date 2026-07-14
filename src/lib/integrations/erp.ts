export type ERPProvider = "none" | "odoo";

export type ERPResult = {
  ok: boolean;
  provider: ERPProvider;
  externalId: string | null;
  message: string;
};

export type PlanSubmissionInput = {
  submissionId: string;
  projectName: string;
  projectLocation: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  engagementType: string;
  projectType: string;
  scopes: string[];
  bidDueDate: string;
  notes: string;
};

export interface ERPAdapter {
  createPlanSubmission(input: PlanSubmissionInput): Promise<ERPResult>;
  createExternalFabRequest(input: { requestId: string; projectId: string }): Promise<ERPResult>;
  syncProject(input: { projectId: string }): Promise<ERPResult>;
  getExternalStatus(input: { entityId: string }): Promise<ERPResult>;
}

export class NoOpERPAdapter implements ERPAdapter {
  async createPlanSubmission(): Promise<ERPResult> {
    return { ok: true, provider: "none", externalId: null, message: "Stored in the 1CG portal only." };
  }

  async createExternalFabRequest(): Promise<ERPResult> {
    return { ok: true, provider: "none", externalId: null, message: "Stored in the 1CG portal only." };
  }

  async syncProject(): Promise<ERPResult> {
    return { ok: true, provider: "none", externalId: null, message: "No ERP sync is configured." };
  }

  async getExternalStatus(): Promise<ERPResult> {
    return { ok: true, provider: "none", externalId: null, message: "Portal status is authoritative." };
  }
}

type OdooConfig = {
  baseUrl: string;
  database: string;
  username: string;
  apiKey: string;
};

type OdooResponse<T> = {
  result?: T;
  error?: { data?: { message?: string }; message?: string };
};

class OdooGlazierStudioAdapter implements ERPAdapter {
  constructor(private readonly config: OdooConfig) {}

  private async call<T>(service: string, method: string, args: unknown[]) {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: { service, method, args },
        id: crypto.randomUUID(),
      }),
      cache: "no-store",
    });
    const payload = (await response.json()) as OdooResponse<T>;
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.data?.message ?? payload.error?.message ?? "Odoo request failed.");
    }
    return payload.result as T;
  }

  private async authenticate() {
    const uid = await this.call<number>("common", "authenticate", [
      this.config.database,
      this.config.username,
      this.config.apiKey,
      {},
    ]);
    if (!uid) throw new Error("Odoo authentication failed.");
    return uid;
  }

  private async execute<T>(model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}) {
    const uid = await this.authenticate();
    return this.call<T>("object", "execute_kw", [
      this.config.database,
      uid,
      this.config.apiKey,
      model,
      method,
      args,
      kwargs,
    ]);
  }

  async createPlanSubmission(input: PlanSubmissionInput): Promise<ERPResult> {
    const description = [
      `1CG submission: ${input.submissionId}`,
      `Location: ${input.projectLocation}`,
      `Project type: ${input.projectType}`,
      `Engagement: ${input.engagementType}`,
      input.bidDueDate ? `Bid due: ${input.bidDueDate}` : "",
      input.scopes.length ? `Scope: ${input.scopes.join(", ")}` : "Scope: To be confirmed",
      input.notes ? `Notes: ${input.notes}` : "",
    ].filter(Boolean).join("\n");

    const leadId = await this.execute<number>("crm.lead", "create", [[{
      name: input.projectName,
      type: "opportunity",
      partner_name: input.company,
      contact_name: input.contactName,
      email_from: input.email,
      phone: input.phone,
      description,
    }]]);

    return {
      ok: true,
      provider: "odoo",
      externalId: String(leadId),
      message: "Created in the Odoo / Glazier Studio opportunity workflow.",
    };
  }

  async createExternalFabRequest({ requestId, projectId }: { requestId: string; projectId: string }): Promise<ERPResult> {
    const activityId = await this.execute<number>("project.task", "create", [[{
      name: `Fabrication request ${requestId}`,
      description: `1CG project ${projectId}`,
    }]]);
    return { ok: true, provider: "odoo", externalId: String(activityId), message: "Fabrication request created in Odoo." };
  }

  async syncProject({ projectId }: { projectId: string }): Promise<ERPResult> {
    return { ok: true, provider: "odoo", externalId: projectId, message: "Project sync is available through the Odoo adapter." };
  }

  async getExternalStatus({ entityId }: { entityId: string }): Promise<ERPResult> {
    const rows = await this.execute<Array<{ stage_id?: [number, string] }>>(
      "crm.lead",
      "read",
      [[Number(entityId)]],
      { fields: ["stage_id"] },
    );
    return {
      ok: true,
      provider: "odoo",
      externalId: entityId,
      message: rows[0]?.stage_id?.[1] ?? "Odoo status available.",
    };
  }
}

function odooConfig(): OdooConfig | null {
  const baseUrl = process.env.ODOO_BASE_URL;
  const database = process.env.ODOO_DATABASE;
  const username = process.env.ODOO_USERNAME;
  const apiKey = process.env.ODOO_API_KEY;
  return baseUrl && database && username && apiKey
    ? { baseUrl, database, username, apiKey }
    : null;
}

const configuredOdoo = odooConfig();
export const erpAdapter: ERPAdapter = configuredOdoo
  ? new OdooGlazierStudioAdapter(configuredOdoo)
  : new NoOpERPAdapter();
