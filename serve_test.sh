#!/bin/bash

# Simple web server script for testing PDF417 browser scanner
# Usage: ./serve_test.sh [port]

PORT=${1:-8080}

echo "🌐 Starting web server for PDF417 Scanner test..."
echo "📂 Serving current directory on port $PORT"
echo "🔗 Open: http://localhost:$PORT/test_pdf417_browser.html"
echo ""
echo "📋 Available servers (will try in order):"

# Try Python 3 first
if command -v python3 >/dev/null 2>&1; then
    echo "✅ Using Python 3 HTTP server"
    python3 -m http.server $PORT
elif command -v python >/dev/null 2>&1; then
    echo "✅ Using Python 2 HTTP server"
    python -m SimpleHTTPServer $PORT
elif command -v node >/dev/null 2>&1; then
    echo "✅ Using Node.js HTTP server"
    npx http-server -p $PORT -c-1
elif command -v php >/dev/null 2>&1; then
    echo "✅ Using PHP built-in server"
    php -S localhost:$PORT
else
    echo "❌ No suitable web server found"
    echo "📋 Please install one of:"
    echo "   - Python 3: apt install python3"
    echo "   - Node.js: npm install -g http-server"
    echo "   - PHP: apt install php"
    exit 1
fi