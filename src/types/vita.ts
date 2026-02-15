// Types VITA — correspondant aux contrats API du backend Rust

export interface VitaAccount {
  id: string;
  public_key?: string;
  display_name: string | null;
  balance: string; // Decimal as string
  verified: boolean;
  total_received: string;
  created_at: string; // RFC3339
}

export interface CreateAccountResponse {
  id: string;
  public_key: string;
  display_name: string | null;
  balance: string;
  created_at: string;
}

export interface VerifyAccountResponse {
  id: string;
  verified: boolean;
  message: string;
}

// Transactions

export type TransactionType =
  | "emission"
  | "transfer"
  | "credit"
  | "repayment"
  | "common_fund";

export interface VitaTransaction {
  id: string;
  tx_type: TransactionType;
  from_account_id: string | null;
  to_account_id: string;
  amount: string;
  common_fund_contribution: string;
  net_amount: string;
  note: string | null;
  created_at: string;
}

export interface TransferRequest {
  from_id: string;
  to_id: string;
  amount: string;
  note?: string;
}

export interface TransferResult {
  transaction_id: string;
  amount: string;
  common_fund_contribution: string;
  net_amount: string;
  new_sender_balance: string;
  timestamp: string;
}

// Emissions

export interface EmissionClaimRequest {
  account_id: string;
}

export interface EmissionResult {
  emission_date: string; // YYYY-MM-DD
  amount: string;
  new_balance: string;
}

export interface EmissionBatchResult {
  total_accounts: number;
  successful: number;
  failed: number;
  date: string;
}

export interface EmissionLogEntry {
  emission_date: string;
  amount: string;
}

// Valuation

export interface ValuationParams {
  time_hours: number;
  formation: number;
  penibility: number;
  responsibility: number;
  rarity: number;
  materials_cost: number;
}

export interface ValuationBreakdown {
  base_time: string;
  multiplier: string;
  materials: string;
  total: string;
}

export interface ValuationResult {
  value_vita: string;
  breakdown: ValuationBreakdown;
}

// Credit

export interface CreditEligibility {
  eligible: boolean;
  max_amount: string;
  reason: string | null;
}

export interface CreditLoan {
  id: string;
  account_id: string;
  amount: string;
  remaining: string;
  daily_repayment_rate: string;
  status: "active" | "repaid" | "defaulted";
  created_at: string;
  completed_at: string | null;
}

export interface CreditRequest {
  account_id: string;
  amount: string;
}

// API Error

export interface VitaApiError {
  error: string;
  code: string;
}
