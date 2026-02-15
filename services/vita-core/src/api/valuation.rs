use actix_web::{web, HttpResponse};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

use crate::error::VitaError;

// ── request / response types ────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ValuationRequest {
    /// Duration of work in hours
    pub time_hours: f64,
    /// Training/formation coefficient (F)
    pub formation: f64,
    /// Penibility/difficulty coefficient (P)
    pub penibility: f64,
    /// Responsibility coefficient (R)
    pub responsibility: f64,
    /// Rarity coefficient (L)
    pub rarity: f64,
    /// Material costs in Ѵ (M)
    pub materials_cost: f64,
}

#[derive(Debug, Serialize)]
pub struct ValuationBreakdown {
    pub base_time: Decimal,
    pub multiplier: Decimal,
    pub materials: Decimal,
    pub total: Decimal,
}

#[derive(Debug, Serialize)]
pub struct ValuationResponse {
    pub value_vita: Decimal,
    pub breakdown: ValuationBreakdown,
}

// ── handler ─────────────────────────────────────────────────────────

/// POST /api/v1/valuation/calculate — Calculate the Ѵ value of a service.
///
/// Formula: V = T × (1 + F + P + R + L) + M
/// Where T = time_hours / 16.0 (fraction of a working day, 16 waking hours)
pub async fn calculate_valuation(
    body: web::Json<ValuationRequest>,
) -> Result<HttpResponse, VitaError> {
    // Validate inputs
    if body.time_hours < 0.0 {
        return Err(VitaError::BadRequest("time_hours must be >= 0".into()));
    }
    if body.materials_cost < 0.0 {
        return Err(VitaError::BadRequest("materials_cost must be >= 0".into()));
    }

    // Convert to Decimal for precision
    let hours_per_day = Decimal::from_str("16.0").unwrap();
    let time_hours = decimal_from_f64(body.time_hours);
    let formation = decimal_from_f64(body.formation);
    let penibility = decimal_from_f64(body.penibility);
    let responsibility = decimal_from_f64(body.responsibility);
    let rarity = decimal_from_f64(body.rarity);
    let materials = decimal_from_f64(body.materials_cost);

    // T = time_hours / 16.0
    let base_time = time_hours / hours_per_day;

    // multiplier = 1 + F + P + R + L
    let multiplier = Decimal::ONE + formation + penibility + responsibility + rarity;

    // V = T × multiplier + M
    let total = base_time * multiplier + materials;

    Ok(HttpResponse::Ok().json(ValuationResponse {
        value_vita: total,
        breakdown: ValuationBreakdown {
            base_time,
            multiplier,
            materials,
            total,
        },
    }))
}

fn decimal_from_f64(v: f64) -> Decimal {
    Decimal::from_str(&format!("{v}")).unwrap_or(Decimal::ZERO)
}

// ── tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    #[test]
    fn test_valuation_formula() {
        // 8 hours of qualified work (F=0.3), moderate difficulty (P=0.2),
        // no special responsibility or rarity, 5 Ѵ materials
        let time_hours = 8.0_f64;
        let hours_per_day = Decimal::from_str("16.0").unwrap();
        let t = decimal_from_f64(time_hours) / hours_per_day; // 0.5
        let multiplier = Decimal::ONE
            + decimal_from_f64(0.3)
            + decimal_from_f64(0.2)
            + Decimal::ZERO
            + Decimal::ZERO; // 1.5
        let materials = decimal_from_f64(5.0);
        let total = t * multiplier + materials; // 0.5 * 1.5 + 5 = 5.75

        assert_eq!(t, Decimal::from_str("0.5").unwrap());
        assert_eq!(multiplier, Decimal::from_str("1.5").unwrap());
        assert_eq!(total, Decimal::from_str("5.75").unwrap());
    }

    #[test]
    fn test_valuation_zero_time() {
        let t = decimal_from_f64(0.0) / Decimal::from_str("16.0").unwrap();
        let multiplier = Decimal::ONE;
        let materials = decimal_from_f64(10.0);
        let total = t * multiplier + materials;

        assert_eq!(total, Decimal::from_str("10.0").unwrap());
    }

    #[test]
    fn test_valuation_pure_time() {
        // 16 hours = 1 full day, no modifiers, no materials
        let t = decimal_from_f64(16.0) / Decimal::from_str("16.0").unwrap(); // 1.0
        let multiplier = Decimal::ONE;
        let total = t * multiplier + Decimal::ZERO; // 1.0

        assert_eq!(total, Decimal::ONE);
    }
}
