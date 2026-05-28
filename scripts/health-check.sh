#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-airport}"
kubectl -n "$NAMESPACE" get deploy,svc,pods,hpa
kubectl -n "$NAMESPACE" get ingress
kubectl -n "$NAMESPACE" top pods || true
kubectl -n "$NAMESPACE" exec deploy/backend -- wget -qO- http://localhost:8080/actuator/health/readiness
