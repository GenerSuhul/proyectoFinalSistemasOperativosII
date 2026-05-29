#!/usr/bin/env bash
set -euo pipefail

kubectl cluster-info
kubectl get nodes -o wide
kubectl apply --validate=false -f k8s/
kubectl -n airport rollout status deployment/oracle --timeout=15m
kubectl -n airport rollout status deployment/backend --timeout=5m
kubectl -n airport rollout status deployment/frontend --timeout=5m
kubectl -n airport rollout status deployment/prometheus --timeout=5m
kubectl -n airport rollout status deployment/grafana --timeout=5m
kubectl -n airport get pods -o wide
