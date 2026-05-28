#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-airport}"
TARGET="${1:-backend}"
POD="$(kubectl -n "$NAMESPACE" get pod -l app="$TARGET" -o jsonpath='{.items[0].metadata.name}')"
echo "Deleting pod $POD to demonstrate Kubernetes self-healing..."
kubectl -n "$NAMESPACE" delete pod "$POD"
kubectl -n "$NAMESPACE" rollout status deployment/"$TARGET" --timeout=3m
