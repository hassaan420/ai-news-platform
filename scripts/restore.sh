#!/usr/bin/env bash
# =============================================================================
# scripts/restore.sh
# Disaster Recovery — Restore MySQL and Redis from backup
# Usage: bash scripts/restore.sh <mysql_backup.sql.gz> [redis_dump.rdb.gz]
# =============================================================================
set -euo pipefail

MYSQL_BACKUP="${1:-}"
REDIS_BACKUP="${2:-}"
MYSQL_CONTAINER="${MYSQL_CONTAINER:-news-platform-mysql}"
REDIS_CONTAINER="${REDIS_CONTAINER:-news-platform-redis}"

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "============================================"
echo " AI News Platform — Restore Script"
echo " Date: $(date)"
echo "============================================"

# ── Validate arguments ────────────────────────────────────────
if [ -z "$MYSQL_BACKUP" ]; then
    echo "Usage: $0 <mysql_backup.sql.gz> [redis_dump.rdb.gz]"
    echo "Available backups:"
    ls -lh backups/mysql/*.gz 2>/dev/null || echo "  No MySQL backups found"
    exit 1
fi

if [ ! -f "$MYSQL_BACKUP" ]; then
    echo "❌ ERROR: MySQL backup file not found: $MYSQL_BACKUP"
    exit 1
fi

# ── Integrity check ───────────────────────────────────────────
echo ""
echo "[1/4] Verifying backup integrity..."

# Find the checksum file for this backup
BACKUP_DATE=$(basename "$MYSQL_BACKUP" | grep -oP '\d{8}_\d{6}' || true)
CHECKSUM_FILE="backups/checksums_${BACKUP_DATE}.sha256"

if [ -f "$CHECKSUM_FILE" ]; then
    sha256sum --check --ignore-missing "$CHECKSUM_FILE"
    echo "     ✅ Integrity verification passed"
else
    echo "     ⚠️  No checksum file found — proceeding without integrity check"
fi

# ── Stop application services (keep MySQL/Redis running) ──────
echo ""
echo "[2/4] Stopping application services for safe restore..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml stop \
    gateway-service auth-service news-service category-service \
    search-service scheduler-service admin-service frontend 2>/dev/null || true
echo "     ✅ Application services stopped"

# ── Restore MySQL ─────────────────────────────────────────────
echo ""
echo "[3/4] Restoring MySQL from: $MYSQL_BACKUP"

# Test connection first
docker exec "$MYSQL_CONTAINER" \
    mysqladmin -u root -p"${MYSQL_ROOT_PASSWORD}" ping > /dev/null 2>&1 || {
    echo "❌ ERROR: Cannot connect to MySQL container '$MYSQL_CONTAINER'"
    exit 1
}

# Pipe decompressed backup into MySQL
zcat "$MYSQL_BACKUP" | docker exec -i "$MYSQL_CONTAINER" \
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" \
    --force \
    2>&1 | grep -v "Warning: Using a password" || true

echo "     ✅ MySQL restore complete"

# ── Restore Redis (optional) ──────────────────────────────────
if [ -n "$REDIS_BACKUP" ] && [ -f "$REDIS_BACKUP" ]; then
    echo ""
    echo "[4/4] Restoring Redis from: $REDIS_BACKUP"

    # Stop Redis, restore dump, restart
    docker compose -f docker-compose.yml -f docker-compose.prod.yml stop redis
    
    # Copy decompressed RDB to the Redis container via a temp volume mount
    TEMP_RDB="/tmp/restore_dump_$$.rdb"
    zcat "$REDIS_BACKUP" > "$TEMP_RDB"
    docker cp "$TEMP_RDB" "${REDIS_CONTAINER}:/data/dump.rdb"
    rm -f "$TEMP_RDB"
    
    docker compose -f docker-compose.yml -f docker-compose.prod.yml start redis
    echo "     ✅ Redis restore complete"
else
    echo ""
    echo "[4/4] No Redis backup provided — skipping Redis restore"
fi

# ── Restart application services ─────────────────────────────
echo ""
echo "Restarting application services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d \
    auth-service news-service category-service \
    search-service scheduler-service admin-service gateway-service frontend 2>/dev/null || true

echo ""
echo "============================================"
echo " ✅ Restore Complete — $(date)"
echo " Run health checks: ./scripts/validate_prod.ps1"
echo "============================================"
