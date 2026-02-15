use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CommonFund {
    pub id: Uuid,
    pub balance: Decimal,
    pub total_contributions: Decimal,
    pub total_disbursements: Decimal,
    pub updated_at: DateTime<Utc>,
}
