#!/bin/bash
# Run script for AI DM HUB
# Starts local development server and opens the prototype in browser

set -e

echo "================================"
echo "AI DM HUB – Starting Server"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "src/index.html" ]; then
    echo "Error: src/index.html not found."
    echo "Please run setup.sh first: ./scripts/setup.sh"
    exit 1
fi

# Change to src directory
cd src

# Determine which server to use
if command -v python3 &> /dev/null; then
    SERVER="python3 -m http.server"
    PORT=8000
elif command -v python &> /dev/null; then
    SERVER="python -m SimpleHTTPServer"
    PORT=8000
elif command -v http-server &> /dev/null; then
    SERVER="http-server"
    PORT=8000
else
    echo "Error: No suitable server found (need Python or http-server)"
    exit 1
fi

echo "Starting local server: $SERVER 8000"
echo "Server running on: http://localhost:8000"
echo ""
echo "Instructions:"
echo "1. Your browser should open automatically"
echo "2. Wait 10 seconds for the critical alarm to trigger"
echo "3. Click on the alarm to see details and demo flow"
echo "4. Press Ctrl+C to stop the server"
echo ""

# Try to open browser automatically
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:8000" &
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:8000" &
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:8000" &
fi

# Start server
if [ "$SERVER" = "python3 -m http.server" ]; then
    python3 -m http.server 8000
elif [ "$SERVER" = "python -m SimpleHTTPServer" ]; then
    python -m SimpleHTTPServer 8000
elif [ "$SERVER" = "http-server" ]; then
    http-server -p 8000
fi
