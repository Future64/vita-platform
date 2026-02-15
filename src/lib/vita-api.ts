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
} from "@/types/vita";

const API_BASE =
  process.env.NEXT_PUBLIC_VITA_API_URL || "http://localhost:8080/api/v1";

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

// --- Health ---

export async function healthCheck(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`, { headers: headers() });
  return handleResponse<{ status: string; version: string }>(res);
}
