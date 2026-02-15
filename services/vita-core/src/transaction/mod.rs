pub mod transfer;

use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TransactionType {
    Emission,
    Transfer,
    Credit,
    Repayment,
    CommonFund,
}

impl TransactionType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Emission => "emission",
            Self::Transfer => "transfer",
            Self::Credit => "credit",
            Self::Repayment => "repayment",
            Self::CommonFund => "common_fund",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "emission" => Some(Self::Emission),
            "transfer" => Some(Self::Transfer),
            "credit" => Some(Self::Credit),
            "repayment" => Some(Self::Repayment),
            "common_fund" => Some(Self::CommonFund),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Transaction {
    pub id: Uuid,
    pub tx_type: String,
    pub from_account_id: Option<Uuid>,
    pub to_account_id: Uuid,
    pub amount: Decimal,
    pub common_fund_contribution: Decimal,
    pub net_amount: Decimal,
    pub note: Option<String>,
    pub created_at: DateTime<Utc>,
}
