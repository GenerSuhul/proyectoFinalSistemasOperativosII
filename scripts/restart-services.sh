#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-airport}"
kubectl -n "$NAMESPACE" rollout restart deployment/backend deployment/frontend deployment/prometheus deployment/grafana
kubectl -n "$NAMESPACE" rollout status deployment/backend --timeout=5m
kubectl -n "$NAMESPACE" rollout status deployment/frontend --timeout=5m
