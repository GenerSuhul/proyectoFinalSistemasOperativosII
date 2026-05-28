#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-airport}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

POD="$(kubectl -n "$NAMESPACE" get pod -l app=oracle -o jsonpath='{.items[0].metadata.name}')"
kubectl -n "$NAMESPACE" exec "$POD" -- bash -lc "mkdir -p /tmp/airport-backup && expdp AIRPORT/\"\$APP_USER_PASSWORD\"@FREEPDB1 schemas=AIRPORT directory=DATA_PUMP_DIR dumpfile=airport-${STAMP}.dmp logfile=airport-${STAMP}.log"
kubectl -n "$NAMESPACE" cp "$POD:/opt/oracle/admin/FREE/dpdump/airport-${STAMP}.dmp" "$BACKUP_DIR/airport-${STAMP}.dmp"
echo "Backup saved at $BACKUP_DIR/airport-${STAMP}.dmp"
