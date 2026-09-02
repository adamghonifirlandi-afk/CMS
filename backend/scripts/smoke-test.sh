#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${API_URL:-http://localhost:8080}"
DEMO_EMAIL="${DEMO_USER_EMAIL:-demo@example.com}"
DEMO_PASSWORD="${DEMO_USER_PASSWORD:-}"

echo "=== CMS Smoke Test ==="
echo "API: $BASE_URL"

pass() { echo "[PASS] $1"; }
fail() { echo "[FAIL] $1"; exit 1; }

curl -sf "$BASE_URL/health" | grep -q '"status":"ok"' && pass "Health check" || fail "Health check"

curl -sf "$BASE_URL/api/v1/plans/plans" > /dev/null && pass "Plans (public)" || fail "Plans (public)"

if [ -n "$DEMO_PASSWORD" ]; then
  TOKEN=$(curl -sf -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PASSWORD\"}" \
    | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

  [ -n "$TOKEN" ] && pass "Demo login" || fail "Demo login"

  curl -sf -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/organizations" > /dev/null \
    && pass "Organizations (auth)" || fail "Organizations (auth)"

  curl -sf -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/projects" > /dev/null \
    && pass "Projects (auth)" || fail "Projects (auth)"
else
  echo "[SKIP] Demo login — set DEMO_USER_PASSWORD"
fi

echo "=== All smoke tests passed ==="
