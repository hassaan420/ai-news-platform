#!/usr/bin/env bash
# ─── Start AI News Platform in DEVELOPMENT mode ─────────────
# Uses docker-compose.yml + docker-compose.override.yml (auto-loaded)
# See DOCKER.md §7 and §9
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "╔══════════════════════════════════════════════════╗"
echo "║  AI News Platform — Development Mode            ║"
echo "║  Profile: dev                                   ║"
echo "║  Override: docker-compose.override.yml (auto)   ║"
echo "╚══════════════════════════════════════════════════╝"

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✔  Created .env — please update with real values before running."
    exit 1
fi

# Build and start
echo ""
echo "→ Building images..."
docker compose build

echo ""
echo "→ Starting services..."
docker compose up -d

echo ""
echo "→ Service status:"
docker compose ps

echo ""
echo "→ To view logs: docker compose logs -f <service-name>"
echo "→ To stop:      docker compose down"
echo "→ To reset:     ./scripts/docker-clean.sh"
