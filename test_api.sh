#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  VITA Platform — API Integration Tests
#  Requires: curl, jq, a running backend on localhost:8080
#            with a clean database (migrations applied)
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

BASE="http://localhost:8080/api/v1"
PASS=0
FAIL=0

# ── helpers ──────────────────────────────────────────────────────

green()  { printf "\033[32m%s\033[0m\n" "$1"; }
red()    { printf "\033[31m%s\033[0m\n" "$1"; }
bold()   { printf "\033[1m%s\033[0m\n" "$1"; }

check() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"

    if [ "$actual" = "$expected" ]; then
        green "  ✓ PASS: $test_name (got $actual)"
        PASS=$((PASS + 1))
    else
        red "  ✗ FAIL: $test_name (expected $expected, got $actual)"
        FAIL=$((FAIL + 1))
    fi
}

check_not_empty() {
    local test_name="$1"
    local actual="$2"

    if [ -n "$actual" ] && [ "$actual" != "null" ]; then
        green "  ✓ PASS: $test_name (got $actual)"
        PASS=$((PASS + 1))
    else
        red "  ✗ FAIL: $test_name (value is empty or null)"
        FAIL=$((FAIL + 1))
    fi
}

check_http_status() {
    local test_name="$1"
    local expected_status="$2"
    local actual_status="$3"

    if [ "$actual_status" = "$expected_status" ]; then
        green "  ✓ PASS: $test_name (HTTP $actual_status)"
        PASS=$((PASS + 1))
    else
        red "  ✗ FAIL: $test_name (expected HTTP $expected_status, got HTTP $actual_status)"
        FAIL=$((FAIL + 1))
    fi
}

bold "═══════════════════════════════════════════════════════════"
bold "  VITA Platform — API Integration Tests"
bold "═══════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────
# 0. Health check
# ─────────────────────────────────────────────────────────────────
bold "▸ 0. Health check"

HEALTH=$(curl -s "$BASE/health")
STATUS=$(echo "$HEALTH" | jq -r '.status')
check "Health endpoint" "ok" "$STATUS"
echo ""

# ─────────────────────────────────────────────────────────────────
# 1. Create account Alice
# ─────────────────────────────────────────────────────────────────
bold "▸ 1. Create account Alice"

ALICE_RESP=$(curl -s -X POST "$BASE/accounts" \
    -H "Content-Type: application/json" \
    -d '{"display_name": "Alice"}')

ALICE_ID=$(echo "$ALICE_RESP" | jq -r '.id')
ALICE_BALANCE=$(echo "$ALICE_RESP" | jq -r '.balance')

check_not_empty "Alice ID created" "$ALICE_ID"
check "Alice initial balance" "0" "$ALICE_BALANCE"
echo "  → Alice ID: $ALICE_ID"
echo ""

# ─────────────────────────────────────────────────────────────────
# 2. Create account Bob
# ─────────────────────────────────────────────────────────────────
bold "▸ 2. Create account Bob"

BOB_RESP=$(curl -s -X POST "$BASE/accounts" \
    -H "Content-Type: application/json" \
    -d '{"display_name": "Bob"}')

BOB_ID=$(echo "$BOB_RESP" | jq -r '.id')
BOB_BALANCE=$(echo "$BOB_RESP" | jq -r '.balance')

check_not_empty "Bob ID created" "$BOB_ID"
check "Bob initial balance" "0" "$BOB_BALANCE"
echo "  → Bob ID: $BOB_ID"
echo ""

# ─────────────────────────────────────────────────────────────────
# 3. Verify Alice (prototype: simple POST)
# ─────────────────────────────────────────────────────────────────
bold "▸ 3. Verify Alice"

VERIFY_ALICE=$(curl -s -X POST "$BASE/accounts/$ALICE_ID/verify")
ALICE_VERIFIED=$(echo "$VERIFY_ALICE" | jq -r '.verified')

check "Alice verified" "true" "$ALICE_VERIFIED"
echo ""

# ─────────────────────────────────────────────────────────────────
# 4. Verify Bob
# ─────────────────────────────────────────────────────────────────
bold "▸ 4. Verify Bob"

VERIFY_BOB=$(curl -s -X POST "$BASE/accounts/$BOB_ID/verify")
BOB_VERIFIED=$(echo "$VERIFY_BOB" | jq -r '.verified')

check "Bob verified" "true" "$BOB_VERIFIED"
echo ""

# ─────────────────────────────────────────────────────────────────
# 5. Trigger daily emission batch (both get 1 Ѵ)
# ─────────────────────────────────────────────────────────────────
bold "▸ 5. Daily emission batch"

BATCH_RESP=$(curl -s -X POST "$BASE/emissions/batch")
BATCH_TOTAL=$(echo "$BATCH_RESP" | jq -r '.total_accounts')
BATCH_OK=$(echo "$BATCH_RESP" | jq -r '.successful')
BATCH_FAIL=$(echo "$BATCH_RESP" | jq -r '.failed')

check "Batch total accounts" "2" "$BATCH_TOTAL"
check "Batch successful" "2" "$BATCH_OK"
check "Batch failed" "0" "$BATCH_FAIL"
echo ""

# ─────────────────────────────────────────────────────────────────
# 6. Check Alice balance = 1.0 Ѵ after emission
# ─────────────────────────────────────────────────────────────────
bold "▸ 6. Check Alice balance after emission"

ALICE_INFO=$(curl -s "$BASE/accounts/$ALICE_ID")
ALICE_BAL=$(echo "$ALICE_INFO" | jq -r '.balance')

check "Alice balance after emission" "1.00000000" "$ALICE_BAL"
echo ""

# ─────────────────────────────────────────────────────────────────
# 7. Alice sends 0.3 Ѵ to Bob
#    common_pot_rate = 2% → contribution = 0.006, net = 0.294
#    Alice: 1.0 - 0.3 = 0.7
#    Bob:   1.0 + 0.294 = 1.294
# ─────────────────────────────────────────────────────────────────
bold "▸ 7. Alice transfers 0.3 Ѵ to Bob"

TRANSFER_RESP=$(curl -s -X POST "$BASE/transactions/transfer" \
    -H "Content-Type: application/json" \
    -d "{
        \"from_id\": \"$ALICE_ID\",
        \"to_id\": \"$BOB_ID\",
        \"amount\": \"0.3\",
        \"note\": \"Merci Bob !\"
    }")

TX_ID=$(echo "$TRANSFER_RESP" | jq -r '.transaction_id')
TX_AMOUNT=$(echo "$TRANSFER_RESP" | jq -r '.amount')
TX_CONTRIB=$(echo "$TRANSFER_RESP" | jq -r '.common_fund_contribution')
TX_NET=$(echo "$TRANSFER_RESP" | jq -r '.net_amount')
TX_NEW_BAL=$(echo "$TRANSFER_RESP" | jq -r '.new_sender_balance')

check_not_empty "Transaction ID" "$TX_ID"
check "Transfer amount" "0.3" "$TX_AMOUNT"
check "Common fund contribution (2%)" "0.006" "$TX_CONTRIB"
check "Net amount received" "0.294" "$TX_NET"
check "Alice new balance" "0.70000000" "$TX_NEW_BAL"
echo ""

# ─────────────────────────────────────────────────────────────────
# 8. Verify Alice balance via GET
# ─────────────────────────────────────────────────────────────────
bold "▸ 8. Confirm Alice balance via GET"

ALICE_INFO2=$(curl -s "$BASE/accounts/$ALICE_ID")
ALICE_BAL2=$(echo "$ALICE_INFO2" | jq -r '.balance')

check "Alice confirmed balance" "0.70000000" "$ALICE_BAL2"
echo ""

# ─────────────────────────────────────────────────────────────────
# 9. Verify Bob balance via GET
#    Bob had 1.0 (emission) + 0.294 (net transfer) = 1.294
# ─────────────────────────────────────────────────────────────────
bold "▸ 9. Confirm Bob balance via GET"

BOB_INFO2=$(curl -s "$BASE/accounts/$BOB_ID")
BOB_BAL2=$(echo "$BOB_INFO2" | jq -r '.balance')

check "Bob confirmed balance" "1.29400000" "$BOB_BAL2"
echo ""

# ─────────────────────────────────────────────────────────────────
# 10. Test valuation calculator
#     Plumber: 2h, F=0.3, P=0.1, R=0.2, L=0.2, M=0.09
#     T = 2/16 = 0.125
#     multiplier = 1 + 0.3 + 0.1 + 0.2 + 0.2 = 1.8
#     V = 0.125 × 1.8 + 0.09 = 0.225 + 0.09 = 0.315
# ─────────────────────────────────────────────────────────────────
bold "▸ 10. Valuation calculator (plumber 2h)"

VALUATION_RESP=$(curl -s -X POST "$BASE/valuation/calculate" \
    -H "Content-Type: application/json" \
    -d '{
        "time_hours": 2.0,
        "formation": 0.3,
        "penibility": 0.1,
        "responsibility": 0.2,
        "rarity": 0.2,
        "materials_cost": 0.09
    }')

VAL_TOTAL=$(echo "$VALUATION_RESP" | jq -r '.value_vita')
VAL_BASE=$(echo "$VALUATION_RESP" | jq -r '.breakdown.base_time')
VAL_MULT=$(echo "$VALUATION_RESP" | jq -r '.breakdown.multiplier')
VAL_MAT=$(echo "$VALUATION_RESP" | jq -r '.breakdown.materials')

check "Valuation total" "0.3150" "$VAL_TOTAL"
check "Base time (2h/16h)" "0.125" "$VAL_BASE"
check "Multiplier (1+F+P+R+L)" "1.8" "$VAL_MULT"
check "Materials" "0.09" "$VAL_MAT"
echo ""

# ─────────────────────────────────────────────────────────────────
# 11. Double emission must fail (409 Conflict)
#     Alice already claimed today's emission via batch
# ─────────────────────────────────────────────────────────────────
bold "▸ 11. Double emission must fail"

DOUBLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/emissions/claim" \
    -H "Content-Type: application/json" \
    -d "{\"account_id\": \"$ALICE_ID\"}")

check_http_status "Double emission rejected" "409" "$DOUBLE_STATUS"
echo ""

# ─────────────────────────────────────────────────────────────────
# 12. Check emission history for Alice
# ─────────────────────────────────────────────────────────────────
bold "▸ 12. Alice emission history"

EMISSION_HIST=$(curl -s "$BASE/emissions/$ALICE_ID")
EMISSION_COUNT=$(echo "$EMISSION_HIST" | jq 'length')
EMISSION_AMOUNT=$(echo "$EMISSION_HIST" | jq -r '.[0].amount')

check "Alice has 1 emission record" "1" "$EMISSION_COUNT"
check "Emission amount" "1.00000000" "$EMISSION_AMOUNT"
echo ""

# ─────────────────────────────────────────────────────────────────
# 13. Check transaction history for Alice
# ─────────────────────────────────────────────────────────────────
bold "▸ 13. Alice transaction history"

TX_HIST=$(curl -s "$BASE/transactions/$ALICE_ID")
TX_COUNT=$(echo "$TX_HIST" | jq 'length')

# Alice should have 2 transactions: 1 emission + 1 transfer
check "Alice has 2 transactions" "2" "$TX_COUNT"
echo ""

# ═══════════════════════════════════════════════════════════════════
#  Summary
# ═══════════════════════════════════════════════════════════════════
echo ""
bold "═══════════════════════════════════════════════════════════"
TOTAL=$((PASS + FAIL))
bold "  Results: $PASS/$TOTAL passed"

if [ "$FAIL" -eq 0 ]; then
    green "  ✓ ALL TESTS PASSED"
else
    red "  ✗ $FAIL TEST(S) FAILED"
fi
bold "═══════════════════════════════════════════════════════════"

exit "$FAIL"
