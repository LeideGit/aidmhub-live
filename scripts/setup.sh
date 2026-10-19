#!/bin/bash
# Setup script for AI DM HUB
# Installs local dependencies and prepares the prototype for development

set -e

echo "================================"
echo "AI DM HUB – Setup Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ]; then
    echo "Error: CLAUDE.md not found. Please run this script from the project root."
    exit 1
fi

echo "✓ Project root verified"
echo ""

# Check Python or Node.js availability for local server
echo "Checking for local server availability..."

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✓ Python 3 found: $PYTHON_VERSION"
    SERVER_CMD="python3 -m http.server 8000"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo "✓ Python found: $PYTHON_VERSION"
    SERVER_CMD="python -m SimpleHTTPServer 8000"
elif command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
    echo "  (Tip: Consider installing 'http-server' globally: npm install -g http-server)"
else
    echo "⚠ Warning: Neither Python nor Node.js found."
    echo "  Install Python 3 or Node.js to run the local development server."
    echo "  See CLAUDE.md for setup instructions."
fi

echo ""

# Verify directory structure
echo "Verifying project structure..."

required_dirs=(
    ".claude"
    ".claude/agents"
    ".claude/rules"
    "docs"
    "docs/adr"
    "specs"
    "project"
    "evals"
    "evals/cases"
    "evals/graders"
    "evals/results"
    "scripts"
    "reports"
    "src"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir"
    else
        echo "  ✗ $dir – missing"
        mkdir -p "$dir"
        echo "    Created $dir"
    fi
done

echo ""

# Check for mockData and HTML
echo "Checking for core files..."

if [ -f "src/mockData.js" ]; then
    echo "  ✓ src/mockData.js"
else
    echo "  ⚠ src/mockData.js – not found (placeholder data will be used)"
fi

if [ -f "src/index.html" ]; then
    echo "  ✓ src/index.html"
else
    echo "  ⚠ src/index.html – not found (will be created during implementation)"
fi

echo ""

# Create .gitignore if not present
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
node_modules/
.DS_Store
*.log
evals/results/*.json
evals/results/*.txt
.pytest_cache/
__pycache__/
.venv/
venv/
EOF
    echo "✓ Created .gitignore"
else
    echo "✓ .gitignore already exists"
fi

echo ""
echo "================================"
echo "Setup Complete"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Run: ./scripts/run.sh"
echo "2. Open: http://localhost:8000"
echo "3. Wait 10 seconds for the critical alarm to trigger"
echo ""
echo "For more details, see CLAUDE.md"
