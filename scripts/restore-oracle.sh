#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 ./backups/airport-YYYYMMDD-HHMMSS.dmp"
  exit 1
fi

NAMESPACE="${NAMESPACE:-airport}"
DUMP_FILE="$1"
BASE="$(basename "$DUMP_FILE")"
POD="$(kubectl -n "$NAMESPACE" get pod -l app=oracle -o jsonpath='{.items[0].metadata.name}')"

kubectl -n "$NAMESPACE" exec "$POD" -- bash -lc "mkdir -p /tmp/airport-backup"
kubectl -n "$NAMESPACE" cp "$DUMP_FILE" "$POD:/tmp/airport-backup/$BASE"
kubectl -n "$NAMESPACE" exec "$POD" -- bash -lc "
sqlplus -s / as sysdba <<'SQL'
ALTER SESSION SET CONTAINER=FREEPDB1;
CREATE OR REPLACE DIRECTORY AIRPORT_DUMP_DIR AS '/tmp/airport-backup';
GRANT READ, WRITE ON DIRECTORY AIRPORT_DUMP_DIR TO AIRPORT;
EXIT;
SQL
impdp AIRPORT/\"\$APP_USER_PASSWORD\"@FREEPDB1 schemas=AIRPORT directory=AIRPORT_DUMP_DIR dumpfile=$BASE table_exists_action=replace
"
echo "Restore completed from $DUMP_FILE"
