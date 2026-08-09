#!/usr/bin/env bash
# =============================================================================
# scripts/backup.sh
# Automated backup: MySQL (all databases) + Redis AOF
# Cron: 0 2 * * * /path/to/scripts/backup.sh >> /var/log/backup.log 2>&1
# =============================================================================
set -euo pipefail

# ── Configuration ────────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_CONTAINER="${MYSQL_CONTAINER:-news-platform-mysql}"
REDIS_CONTAINER="${REDIS_CONTAINER:-news-platform-redis}"

# Load env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "============================================"
echo " AI News Platform — Backup Script"
echo " Date: $(date)"
echo " Backup Dir: $BACKUP_DIR"
echo "============================================"

mkdir -p "$BACKUP_DIR/mysql" "$BACKUP_DIR/redis"

# ─── MySQL Backup ─────────────────────────────────────────────
echo ""
echo "[1/4] Backing up MySQL databases..."

MYSQL_BACKUP_FILE="$BACKUP_DIR/mysql/mysql_all_${DATE}.sql.gz"

docker exec "$MYSQL_CONTAINER" \
    sh -c "mysqldump -u root -p\"\${MYSQL_ROOT_PASSWORD}\" \
    --all-databases \
    --single-transaction \
    --routines \
    --triggers \
    --hex-blob \
    --set-gtid-purged=OFF \
    --flush-logs \
    2>/dev/null" | gzip > "$MYSQL_BACKUP_FILE"

MYSQL_SIZE=$(du -sh "$MYSQL_BACKUP_FILE" | cut -f1)
echo "     ✅ MySQL backup: $MYSQL_BACKUP_FILE ($MYSQL_SIZE)"

# Verify backup is not empty
if [ ! -s "$MYSQL_BACKUP_FILE" ]; then
    echo "     ❌ ERROR: MySQL backup file is empty!"
    exit 1
fi

# ─── Redis Backup (BGSAVE + copy RDB) ────────────────────────
echo ""
echo "[2/4] Backing up Redis data..."

# Trigger background save
docker exec "$REDIS_CONTAINER" \
    redis-cli -a "${REDIS_PASSWORD:-}" BGSAVE > /dev/null 2>&1 || true

# Wait for save to complete
sleep 3

# Copy RDB dump
REDIS_BACKUP_FILE="$BACKUP_DIR/redis/redis_dump_${DATE}.rdb.gz"
docker exec "$REDIS_CONTAINER" \
    cat /data/dump.rdb | gzip > "$REDIS_BACKUP_FILE"

# Copy AOF if present
REDIS_AOF_FILE="$BACKUP_DIR/redis/redis_aof_${DATE}.aof.gz"
docker exec "$REDIS_CONTAINER" \
    sh -c "[ -f /data/appendonly.aof ] && cat /data/appendonly.aof || echo ''" | \
    gzip > "$REDIS_AOF_FILE"

echo "     ✅ Redis RDB backup: $REDIS_BACKUP_FILE"
echo "     ✅ Redis AOF backup: $REDIS_AOF_FILE"

# ─── Checksum Generation ──────────────────────────────────────
echo ""
echo "[3/4] Generating checksums for integrity verification..."

CHECKSUM_FILE="$BACKUP_DIR/checksums_${DATE}.sha256"
sha256sum \
    "$MYSQL_BACKUP_FILE" \
    "$REDIS_BACKUP_FILE" \
    "$REDIS_AOF_FILE" > "$CHECKSUM_FILE"

echo "     ✅ Checksums saved: $CHECKSUM_FILE"

# ─── Retention: Remove Old Backups ───────────────────────────
echo ""
echo "[4/4] Enforcing $RETENTION_DAYS-day retention policy..."

find "$BACKUP_DIR/mysql" -name "*.gz" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR/redis" -name "*.gz" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR"       -name "*.sha256" -mtime +"$RETENTION_DAYS" -delete

echo "     ✅ Old backups purged (>$RETENTION_DAYS days)"

echo ""
echo "============================================"
echo " ✅ Backup Complete — $(date)"
echo " MySQL: $MYSQL_BACKUP_FILE"
echo " Redis: $REDIS_BACKUP_FILE"
echo "============================================"
