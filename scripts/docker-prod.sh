#!/usr/bin/env bash
# ─── Start AI News Platform in PRODUCTION mode ──────────────
# Explicitly loads docker-compose.yml + docker-compose.prod.yml
# Does NOT load docker-compose.override.yml (dev overrides)
# See DOCKER.md §7, DEPLOYMENT.md §4
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "╔══════════════════════════════════════════════════╗"
echo "║  AI News Platform — Production Mode             ║"
echo "║  Profile: prod                                  ║"
echo "║  Config:  docker-compose.yml +                  ║"
echo "║           docker-compose.prod.yml               ║"
echo "╚══════════════════════════════════════════════════╝"

# Require .env file in production
if [ ! -f ".env" ]; then
    echo "✖  ERROR: .env file is required for production deployment."
    echo "   Copy .env.example to .env and fill in production values."
    exit 1
fi

# Validate compose config before starting
echo ""
echo "→ Validating configuration..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml config --quiet
echo "✔  Configuration valid."

# Build and start
echo ""
echo "→ Building images..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

echo ""
echo "→ Starting services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo ""
echo "→ Service status:"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

echo ""
echo "→ To view logs:  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo "→ To stop:       docker compose -f docker-compose.yml -f docker-compose.prod.yml down"
