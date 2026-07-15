export const portalRoles = [
  "admin",
  "executive",
  "estimating",
  "project_manager",
  "operations",
  "marketing",
  "viewer",
] as const;

export type PortalRole = (typeof portalRoles)[number];

export type PortalProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: PortalRole;
  department: string;
};

export type PortalProject = {
  id: string;
  company_id: string | null;
  name: string;
  slug: string;
  client_name: string;
  location: string;
  region: string;
  market: string;
  project_type: string;
  status: string;
  internal_description: string;
  public_description: string;
  image_url: string;
  video_url: string;
  scope: string;
  systems: string;
  completion: string;
  general_contractor: string;
  architect: string;
  owner: string;
  project_size: string;
  stories: string;
  overview: string;
  challenge: string;
  solution: string;
  result: string;
  street_address: string;
  latitude: number | null;
  longitude: number | null;
  presentation_url: string;
  public_visibility_status: string;
  claimed_by: string | null;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PortalCompany = {
  id: string;
  name: string;
  slug: string;
  website: string;
  description: string;
  primary_address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type PortalCompanyContact = {
  id: string;
  company_id: string;
  full_name: string;
  title: string;
  email: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type PortalCompanySummary = PortalCompany & {
  project_count: number;
};

export type FabRequest = {
  id: string;
  project_id: string;
  requested_by: string | null;
  assigned_to: string | null;
  request_type: string;
  priority: string;
  needed_by: string | null;
  status: string;
  title: string;
  description: string;
  drawing_links: string[];
  internal_notes: string;
  created_at: string;
  updated_at: string;
  projects?: Pick<PortalProject, "id" | "name" | "slug"> | null;
};

export type ProjectAsset = {
  id: string;
  project_id: string;
  uploaded_by: string | null;
  asset_type: string;
  storage_path: string;
  title: string;
  description: string;
  is_public_candidate: boolean;
  approved_for_public: boolean;
  created_at: string;
};

export type ApprovalItem = {
  id: string;
  entity_type: "project" | "asset";
  entity_id: string;
  submitted_by: string | null;
  reviewed_by: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string;
  created_at: string;
  reviewed_at: string | null;
};

export type PublishedProject = Pick<
  PortalProject,
  | "id"
  | "name"
  | "slug"
  | "client_name"
  | "location"
  | "region"
  | "market"
  | "project_type"
  | "public_description"
  | "image_url"
  | "video_url"
  | "scope"
  | "systems"
  | "completion"
  | "general_contractor"
  | "architect"
  | "owner"
  | "project_size"
  | "stories"
  | "overview"
  | "challenge"
  | "solution"
  | "result"
  | "street_address"
  | "latitude"
  | "longitude"
  | "updated_at"
>;

export type PublishedProjectAsset = Pick<
  ProjectAsset,
  "id" | "project_id" | "asset_type" | "title" | "description" | "created_at"
> & { url: string };
