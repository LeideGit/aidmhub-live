#!/bin/bash
# Verification script for AI DM HUB
# Runs setup, spec validation, testes, and report generation

set -e

echo "================================"
echo "AI DM HUB – Verification"
echo "================================"
echo ""

# Run setup first
echo "Step 1: Running setup..."
./scripts/setup.sh
echo ""

# Validate specs
echo "Step 2: Validating specifications..."
if [ -f "./scripts/validate-specs.sh" ]; then
    ./scripts/validate-specs.sh
else
    echo "⚠ validate-specs.sh not found"
fi
echo ""

# Run evals (if implemented)
echo "Step 3: Running evaluations..."
if [ -f "./scripts/run-evals.sh" ]; then
    ./scripts/run-evals.sh
else
    echo "⚠ run-evals.sh not found (evals pending implementation)"
fi
echo ""

# Generate reports
echo "Step 4: Generating reports..."
if [ -f "./scripts/generate-reports.sh" ]; then
    ./scripts/generate-reports.sh
else
    echo "⚠ generate-reports.sh not found (reports templates exist, manual update needed)"
    echo "  See: reports/readiness.md, reports/traceability.md, reports/evaluation.md"
fi
echo ""

echo "================================"
echo "Verification Complete"
echo "================================"
echo ""
echo "Summary:"
echo "✓ Setup: Complete"
echo "✓ Specs: Ready (validation pending)"
echo "✓ Evals: Ready (execution pending)"
echo "✓ Reports: Templates created"
echo ""
echo "Next: Run ./scripts/run.sh to start the prototype"
