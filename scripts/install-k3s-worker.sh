#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 https://CONTROL_PLANE_IP:6443 NODE_TOKEN"
  exit 1
fi

curl -sfL https://get.k3s.io | K3S_URL="$1" K3S_TOKEN="$2" sh -
sudo systemctl status k3s-agent --no-pager
