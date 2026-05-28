#!/usr/bin/env bash
set -euo pipefail

curl -sfL https://get.k3s.io | sh -s - server \
  --write-kubeconfig-mode 644 \
  --disable traefik

sudo kubectl get nodes
sudo cat /var/lib/rancher/k3s/server/node-token

echo "Use the token above on worker nodes with install-k3s-worker.sh."
