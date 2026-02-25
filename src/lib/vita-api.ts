import type {
  VitaAccount,
  CreateAccountResponse,
  VerifyAccountResponse,
  EmissionResult,
  EmissionBatchResult,
  EmissionLogEntry,
  TransferResult,
  VitaTransaction,
  ValuationParams,
  ValuationResult,
  CreditEligibility,
  CreditLoan,
  VitaApiError,
  CodexTitleWithArticles,
  CodexArticle,
  CodexVersion,
  CodexAmendment,
  CodexExport,
  CreateAmendmentRequest,
} from "@/types/vita";

const API_BASE =
  process.env.NEXT_PUBLIC_VITA_API_URL || "/api/v1";

// --- Error handling ---

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let code = "UNKNOWN_ERROR";
    let message = `HTTP ${res.status}`;
    try {
      const body: VitaApiError = await res.json();
      code = body.code;
      message = body.error;
    } catch {
      // response body wasn't JSON
    }
    throw new ApiError(message, code, res.status);
  }
  return res.json();
}

function headers(): HeadersInit {
  return { "Content-Type": "application/json" };
}

// --- Accounts ---

export async function createAccount(
  displayName?: string
): Promise<CreateAccountResponse> {
  const res = await fetch(`${API_BASE}/accounts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ display_name: displayName ?? null }),
  });
  return handleResponse<CreateAccountResponse>(res);
}

export async function getAccount(id: string): Promise<VitaAccount> {
  const res = await fetch(`${API_BASE}/accounts/${id}`, {
    headers: headers(),
  });
  return handleResponse<VitaAccount>(res);
}

export async function verifyAccount(
  id: string
): Promise<VerifyAccountResponse> {
  const res = await fetch(`${API_BASE}/accounts/${id}/verify`, {
    method: "POST",
    headers: headers(),
  });
  return handleResponse<VerifyAccountResponse>(res);
}

// --- Emissions ---

export async function claimEmission(
  accountId: string
): Promise<EmissionResult> {
  const res = await fetch(`${API_BASE}/emissions/claim`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ account_id: accountId }),
  });
  return handleResponse<EmissionResult>(res);
}

export async function batchEmission(): Promise<EmissionBatchResult> {
  const res = await fetch(`${API_BASE}/emissions/batch`, {
    method: "POST",
    headers: headers(),
  });
  return handleResponse<EmissionBatchResult>(res);
}

export async function getEmissionHistory(
  accountId: string
): Promise<EmissionLogEntry[]> {
  const res = await fetch(`${API_BASE}/emissions/${accountId}`, {
    headers: headers(),
  });
  return handleResponse<EmissionLogEntry[]>(res);
}

// --- Transactions ---

export async function transfer(
  fromId: string,
  toId: string,
  amount: string,
  note?: string
): Promise<TransferResult> {
  const res = await fetch(`${API_BASE}/transactions/transfer`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ from_id: fromId, to_id: toId, amount, note }),
  });
  return handleResponse<TransferResult>(res);
}

export async function getTransactions(
  accountId: string,
  limit: number = 20,
  offset: number = 0
): Promise<VitaTransaction[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  const res = await fetch(
    `${API_BASE}/transactions/${accountId}?${params}`,
    { headers: headers() }
  );
  return handleResponse<VitaTransaction[]>(res);
}

// --- Valuation ---

export async function calculateValue(
  params: ValuationParams
): Promise<ValuationResult> {
  const res = await fetch(`${API_BASE}/valuation/calculate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  return handleResponse<ValuationResult>(res);
}

// --- Balance (convenience) ---

export async function getBalance(accountId: string): Promise<string> {
  const account = await getAccount(accountId);
  return account.balance;
}

// --- Credit ---

export async function getCreditEligibility(
  accountId: string
): Promise<CreditEligibility> {
  const res = await fetch(`${API_BASE}/credit/eligibility/${accountId}`, {
    headers: headers(),
  });
  return handleResponse<CreditEligibility>(res);
}

export async function requestCredit(
  accountId: string,
  amount: string
): Promise<CreditLoan> {
  const res = await fetch(`${API_BASE}/credit/request`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ account_id: accountId, amount }),
  });
  return handleResponse<CreditLoan>(res);
}

export async function getCreditLoans(
  accountId: string
): Promise<CreditLoan[]> {
  const res = await fetch(`${API_BASE}/credit/loans/${accountId}`, {
    headers: headers(),
  });
  return handleResponse<CreditLoan[]>(res);
}

// --- Codex (Constitution) ---

export async function getCodexTitles(): Promise<CodexTitleWithArticles[]> {
  const res = await fetch(`${API_BASE}/codex/titles`, { headers: headers() });
  return handleResponse<CodexTitleWithArticles[]>(res);
}

export async function getCodexArticles(
  titleId?: string
): Promise<CodexArticle[]> {
  const params = titleId
    ? `?title_id=${titleId}`
    : "";
  const res = await fetch(`${API_BASE}/codex/articles${params}`, {
    headers: headers(),
  });
  return handleResponse<CodexArticle[]>(res);
}

export async function getCodexArticle(
  number: number
): Promise<CodexArticle> {
  const res = await fetch(`${API_BASE}/codex/articles/${number}`, {
    headers: headers(),
  });
  return handleResponse<CodexArticle>(res);
}

export async function getCodexArticleVersions(
  number: number
): Promise<CodexVersion[]> {
  const res = await fetch(`${API_BASE}/codex/articles/${number}/versions`, {
    headers: headers(),
  });
  return handleResponse<CodexVersion[]>(res);
}

export async function createCodexAmendment(
  body: CreateAmendmentRequest
): Promise<CodexAmendment> {
  const res = await fetch(`${API_BASE}/codex/amendments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handleResponse<CodexAmendment>(res);
}

export async function getCodexAmendments(
  status?: string
): Promise<CodexAmendment[]> {
  const params = status ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE}/codex/amendments${params}`, {
    headers: headers(),
  });
  return handleResponse<CodexAmendment[]>(res);
}

export async function getCodexExportJson(): Promise<CodexExport> {
  const res = await fetch(`${API_BASE}/codex/export/json`, {
    headers: headers(),
  });
  return handleResponse<CodexExport>(res);
}

export function getCodexExportPdfUrl(): string {
  return `${API_BASE}/codex/export/pdf`;
}

// --- Forge (git-like model) ---

export interface ForgeProject {
  id: string;
  title: string;
  description: string;
  codex_ref: number | null;
  default_branch: string | null;
  created_at: string;
  updated_at: string;
  branch_count: number | null;
  mr_count: number | null;
  contributor_count: number | null;
}

export interface ForgeBranch {
  id: string;
  project_id: string;
  name: string;
  is_default: boolean;
  head_commit_id: string | null;
  created_by: string;
  created_at: string;
}

export interface ForgeCommit {
  id: string;
  branch_id: string;
  author_id: string;
  message: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  author_name: string | null;
}

export interface ForgeMergeRequest {
  id: string;
  project_id: string;
  source_branch_id: string;
  target_branch_id: string;
  title: string;
  description: string;
  author_id: string;
  status: string;
  votes_for: number;
  votes_against: number;
  merged_by: string | null;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  source_branch_name: string | null;
  target_branch_name: string | null;
}

export interface ForgeMRComment {
  id: string;
  merge_request_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
}

export interface ForgeContributor {
  author_id: string;
  project_id: string;
  display_name: string | null;
  commit_count: number | null;
  mr_count: number | null;
  last_active: string | null;
}

export interface ForgeProjectDetail {
  project: ForgeProject;
  branches: ForgeBranch[];
}

export interface ForgeMergeRequestDetail {
  merge_request: ForgeMergeRequest;
  source_content: string | null;
  target_content: string | null;
  comments: ForgeMRComment[];
}

export async function getForgeProjects(): Promise<ForgeProject[]> {
  const res = await fetch(`${API_BASE}/forge/projects`, { headers: headers() });
  return handleResponse<ForgeProject[]>(res);
}

export async function getForgeProject(id: string): Promise<ForgeProjectDetail> {
  const res = await fetch(`${API_BASE}/forge/projects/${id}`, { headers: headers() });
  return handleResponse<ForgeProjectDetail>(res);
}

export async function getForgeBranchCommits(branchId: string): Promise<ForgeCommit[]> {
  const res = await fetch(`${API_BASE}/forge/branches/${branchId}/commits`, { headers: headers() });
  return handleResponse<ForgeCommit[]>(res);
}

export async function getForgeCommit(id: string): Promise<ForgeCommit> {
  const res = await fetch(`${API_BASE}/forge/commits/${id}`, { headers: headers() });
  return handleResponse<ForgeCommit>(res);
}

export async function getForgeMergeRequest(id: string): Promise<ForgeMergeRequestDetail> {
  const res = await fetch(`${API_BASE}/forge/merge-requests/${id}`, { headers: headers() });
  return handleResponse<ForgeMergeRequestDetail>(res);
}

export async function getForgeProjectMRs(projectId: string): Promise<ForgeMergeRequest[]> {
  const res = await fetch(`${API_BASE}/forge/projects/${projectId}/merge-requests`, { headers: headers() });
  return handleResponse<ForgeMergeRequest[]>(res);
}

export async function getForgeProjectContributors(projectId: string): Promise<ForgeContributor[]> {
  const res = await fetch(`${API_BASE}/forge/projects/${projectId}/contributors`, { headers: headers() });
  return handleResponse<ForgeContributor[]>(res);
}

// --- Delegations ---

export interface DelegateInfo {
  id: string;
  display_name: string | null;
  role: string | null;
  delegation_count: number | null;
  created_at: string | null;
}

export async function getDelegates(): Promise<DelegateInfo[]> {
  const res = await fetch(`${API_BASE}/governance/delegates`, { headers: headers() });
  return handleResponse<DelegateInfo[]>(res);
}

// --- Health ---

export async function healthCheck(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`, { headers: headers() });
  return handleResponse<{ status: string; version: string }>(res);
}
