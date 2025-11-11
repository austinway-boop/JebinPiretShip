#!/bin/bash

# Alpha Fleet Board - Start Script

echo "🏴‍☠️ Alpha Fleet Board - Starting..."
echo ""

cd "$(dirname "$0")"

# Check if data.json exists, if not create it
if [ ! -f "data.json" ]; then
    echo "Creating data.json..."
    echo '{"students":[],"auditLog":[],"lastUpdated":null}' > data.json
fi

# Kill any existing server on port 7000
lsof -ti:7000 | xargs kill -9 2>/dev/null

echo "Starting server on port 7000..."
node server.js &

sleep 2

echo ""
echo "✅ Server is running!"
echo "📍 Open: http://localhost:7000"
echo "💾 Data saved to: $(pwd)/data.json"
echo "🔓 Admin Mode: ENABLED by default"
echo ""
echo "To stop the server: kill $(lsof -ti:7000)"
echo ""

# Open browser
open http://localhost:7000 2>/dev/null || true

