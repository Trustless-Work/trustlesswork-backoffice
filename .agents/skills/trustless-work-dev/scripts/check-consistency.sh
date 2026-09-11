#!/usr/bin/env bash
# Consistency checks for the Trustless Work skill (issue #5).
# Greps the tracked markdown files for known documentation regressions
# and exits non-zero if any reappear.

set -u
cd "$(git rev-parse --show-toplevel)"

FILES=$(git ls-files '*.md')
FAIL=0

check() {
  local name="$1" pattern="$2" exclude="${3:-}"
  local hits
  hits=$(grep -rnE "$pattern" $FILES 2>/dev/null || true)
  if [ -n "$exclude" ] && [ -n "$hits" ]; then
    hits=$(printf '%s\n' "$hits" | grep -vE "$exclude" || true)
  fi
  if [ -n "$hits" ]; then
    echo "FAIL: $name"
    printf '%s\n' "$hits" | sed 's/^/  /'
    FAIL=1
  else
    echo "ok:   $name"
  fi
}

# 1. Amounts must be numbers, never quoted strings.
check "quoted numeric amounts" '"amount": "[0-9]|amount: "[0-9]|amount: '\''[0-9]'

# 2. Auth header is x-api-key; Bearer only allowed in "do not use" warnings.
check "stale Authorization: Bearer" 'Authorization: Bearer' '[Nn]ot |NOT |[Nn]ever '

# 3. Canonical repo/package naming only.
check "old repository names" 'trustless-work-dev-skill|Trustless-Work-Skill|wmendes/'

# 4. milestoneIndex is a string — in examples and in API interface declarations.
# (A UI prop typed `number` is fine when the payload converts it with .toString().)
check "numeric milestoneIndex" '"milestoneIndex": [0-9]|milestoneIndex: [0-9]|milestoneIndex: number;'

# 5. Use @stellar/stellar-sdk, not the deprecated package.
check "deprecated stellar-sdk import" "from '(stellar-sdk)'|from \"(stellar-sdk)\""

# 6. Distributions are { address, amount } objects, not tuples.
check "tuple-style distributions" '\[\"G[A-Z0-9]'

# 7. Fees are deducted at release, never an extra funding amount.
check "fee-as-funding-amount guidance" '\+ platform fee|amount \+ platformFee|plus platform fee'

# 8. All API calls require x-api-key.
check "claims that reads skip the API key" 'without an API key|[Rr]ead-only acceptable|no API key needed'

if [ "$FAIL" -ne 0 ]; then
  echo
  echo "Consistency check failed — see FAIL entries above."
  exit 1
fi
echo
echo "All consistency checks passed."
