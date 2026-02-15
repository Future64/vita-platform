use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Account {
    pub id: Uuid,
    pub public_key: Vec<u8>,
    pub created_at: DateTime<Utc>,
    pub verified: bool,
    pub last_emission_at: Option<DateTime<Utc>>,
    pub balance: Decimal,
    pub total_received: Decimal,
    pub display_name: Option<String>,
}
