#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-airport}"
APP="${1:-backend}"
kubectl -n "$NAMESPACE" logs -f deploy/"$APP"
