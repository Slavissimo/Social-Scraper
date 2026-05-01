#!/bin/bash
# run.sh — Start both backend and frontend (Pop!_OS + pipx)

# Always work relative to the script's own directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================"
echo "  Social Comment Scraper"
echo "  Bachelor Thesis Demo"
echo "================================"
echo ""

# Check pipx
if ! command -v pipx &> /dev/null; then
  echo "❌ pipx not found. Install it with:"
  echo "   sudo apt install pipx && pipx ensurepath"
  exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install it with:"
  echo "   sudo apt install nodejs npm"
  exit 1
fi

# Install uvicorn globally via pipx (if not already installed)
if ! pipx list | grep -q "uvicorn"; then
  echo "📦 Installing uvicorn via pipx..."
  pipx install uvicorn[standard]
fi

# Inject backend deps into the pipx uvicorn venv
echo "📦 Injecting backend dependencies into pipx uvicorn environment..."
pipx inject uvicorn fastapi httpx pydantic

# Find the uvicorn binary inside the pipx venv (has fastapi available)
UVICORN_BIN="$(pipx environment --spec uvicorn 2>/dev/null | grep 'PIPX_LOCAL_VENVS' | awk -F= '{print $2}')/uvicorn/bin/uvicorn"
# Fallback: just use the pipx-installed uvicorn on PATH (it's the same venv)
if [ ! -f "$UVICORN_BIN" ]; then
  UVICORN_BIN="$(which uvicorn)"
fi

echo "   Using uvicorn: $UVICORN_BIN"

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install --silent
cd "$SCRIPT_DIR"

echo ""
echo "🚀 Starting backend on http://localhost:8000"
cd "$SCRIPT_DIR/backend"
"$UVICORN_BIN" main:app --reload --port 8000 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

sleep 2

echo "🚀 Starting frontend on http://localhost:5173"
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ""
echo "✅ Both servers are running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" SIGINT SIGTERM
wait
