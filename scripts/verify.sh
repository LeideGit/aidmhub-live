#!/bin/bash
# Verification for AI DM HUB. Runs only checks that exist and reports
# each result honestly. A skipped or missing check is reported as such,
# never as passed.

cd "$(dirname "$0")/.." || exit 1

failed=0
results=()

run_check() {
    local name="$1"; shift
    echo "--- $name"
    if "$@"; then
        results+=("PASS  $name")
    else
        results+=("FAIL  $name")
        failed=1
    fi
    echo
}

skip_check() {
    results+=("SKIP  $1 ($2)")
    echo "--- $1: skipped ($2)"
    echo
}

run_check "JavaScript syntax (src/app.js, src/api.js, src/mockData.js)" \
    bash -c 'node --check src/app.js && node --check src/api.js && node --check src/mockData.js'

run_check "Bot guard tests (SEC-001/002/003)" node scripts/test-guard.mjs

if [ -f "./scripts/validate-specs.sh" ]; then
    run_check "Spec validation" ./scripts/validate-specs.sh
else
    skip_check "Spec validation" "scripts/validate-specs.sh not present"
fi

if [ -f "./scripts/run-evals.sh" ]; then
    run_check "Evals" ./scripts/run-evals.sh
else
    skip_check "Evals" "scripts/run-evals.sh not present; no evals executed"
fi

echo "================================"
echo "Verification summary"
echo "================================"
printf '%s\n' "${results[@]}"
echo
if [ "$failed" -eq 0 ]; then
    echo "All executed checks passed. SKIP lines were not run."
else
    echo "One or more checks FAILED."
fi
exit "$failed"
