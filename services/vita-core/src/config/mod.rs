use rust_decimal::Decimal;
use serde::Serialize;
use std::str::FromStr;

/// Constitutional parameters — IMMUTABLE, NEVER modify these values.
#[derive(Debug, Clone, Serialize)]
pub struct ImmutableParams {
    /// 1 person = 1 Ѵ per day
    pub daily_emission: Decimal,
    /// No retroactive emission
    pub retroactive_emission: bool,
    /// Transaction privacy guaranteed
    pub transaction_privacy: bool,
    /// One person = one account
    pub one_person_one_account: bool,
}

impl ImmutableParams {
    pub fn new() -> Self {
        Self {
            daily_emission: Decimal::from_str("1.0").unwrap(),
            retroactive_emission: false,
            transaction_privacy: true,
            one_person_one_account: true,
        }
    }
}

/// Configurable parameters — modifiable by collective vote in Agora.
#[derive(Debug, Clone, Serialize)]
pub struct ConfigurableParams {
    /// Common pot contribution rate (0.0 to 1.0)
    pub common_pot_rate: Decimal,
    /// Max offline transaction amount
    pub max_offline_tx_amount: Decimal,
    /// Max offline transactions before sync
    pub max_offline_tx_count: u32,
    /// Max offline duration in hours
    pub max_offline_duration_hours: u32,
    /// Proof of life interval in days
    pub proof_of_life_interval_days: u32,
}

impl ConfigurableParams {
    pub fn defaults() -> Self {
        Self {
            common_pot_rate: Decimal::from_str("0.02").unwrap(),
            max_offline_tx_amount: Decimal::from_str("10.0").unwrap(),
            max_offline_tx_count: 5,
            max_offline_duration_hours: 72,
            proof_of_life_interval_days: 90,
        }
    }
}

/// All system parameters.
#[derive(Debug, Clone, Serialize)]
pub struct SystemParams {
    pub immutable: ImmutableParams,
    pub configurable: ConfigurableParams,
}

impl SystemParams {
    pub fn new() -> Self {
        Self {
            immutable: ImmutableParams::new(),
            configurable: ConfigurableParams::defaults(),
        }
    }
}
