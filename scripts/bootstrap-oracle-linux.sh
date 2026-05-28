#!/usr/bin/env bash
set -euo pipefail

sudo dnf update -y
sudo dnf install -y git curl wget vim firewalld fail2ban chrony
sudo systemctl enable --now firewalld chronyd fail2ban

sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=6443/tcp
sudo firewall-cmd --permanent --add-port=30000-32767/tcp
sudo firewall-cmd --reload

sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload sshd

echo "Oracle Linux base hardened. Install k3s/kubeadm next according to README."
