#!/usr/bin/env bash
# ─── Full cleanup of AI News Platform Docker resources ───────
# Stops containers, removes volumes (full DB reset), prunes images
# See DOCKER.md §9
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "╔══════════════════════════════════════════════════╗"
echo "║  AI News Platform — Full Docker Cleanup         ║"
echo "║  ⚠  This will DELETE all data volumes!          ║"
echo "╚══════════════════════════════════════════════════╝"

read -p "Are you sure? (y/N): " confirm
if [[ "$confirm" != [yY] ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "→ Stopping containers and removing volumes..."
docker compose down -v --remove-orphans 2>/dev/null || true

# Also clean prod compose if it was used
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true

echo ""
echo "→ Pruning dangling images..."
docker image prune -f --filter "label=org.opencontainers.image.title=ai-news-platform" 2>/dev/null || true

echo ""
echo "✔  Cleanup complete."
echo "   All containers stopped, volumes removed, dangling images pruned."
echo "   Run ./scripts/docker-dev.sh or ./scripts/docker-prod.sh to restart."
