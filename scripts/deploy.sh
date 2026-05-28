#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Avegatasta Deploy Script (run from project root after npm run build)
# Usage: bash scripts/deploy.sh <VPS_IP> [SSH_PORT] [SSH_USER]
# Example: bash scripts/deploy.sh 203.0.113.10 22 root
# =============================================================================
set -euo pipefail

VPS_IP="${1:?Usage: $0 <VPS_IP> [SSH_PORT] [SSH_USER]}"
SSH_PORT="${2:-22}"
SSH_USER="${3:-root}"
APP_DIR="/var/www/avegatasta"
APP_USER="avegatasta"

echo "==> Building Next.js app (standalone)"
npm run build

echo "==> Syncing build to ${VPS_IP}:${APP_DIR}"
rsync -az --delete \
    -e "ssh -p ${SSH_PORT}" \
    .next/standalone/ "${SSH_USER}@${VPS_IP}:${APP_DIR}/"

rsync -az --delete \
    -e "ssh -p ${SSH_PORT}" \
    .next/static/ "${SSH_USER}@${VPS_IP}:${APP_DIR}/.next/static/"

rsync -az --delete \
    -e "ssh -p ${SSH_PORT}" \
    public/ "${SSH_USER}@${VPS_IP}:${APP_DIR}/public/"

rsync -az \
    -e "ssh -p ${SSH_PORT}" \
    ecosystem.config.js "${SSH_USER}@${VPS_IP}:${APP_DIR}/"

echo "==> Fixing ownership"
ssh -p "${SSH_PORT}" "${SSH_USER}@${VPS_IP}" \
    "chown -R ${APP_USER}:${APP_USER} ${APP_DIR}"

echo "==> Reloading PM2 (zero-downtime)"
ssh -p "${SSH_PORT}" "${SSH_USER}@${VPS_IP}" \
    "sudo -u ${APP_USER} pm2 reload ${APP_DIR}/ecosystem.config.js --update-env"

echo "==> Health check"
sleep 3
HEALTH=$(ssh -p "${SSH_PORT}" "${SSH_USER}@${VPS_IP}" \
    "curl -sf http://127.0.0.1:3002/api/health || echo FAIL")
echo "Health: ${HEALTH}"

if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    echo "==> Deploy succeeded."
else
    echo "==> WARN: Health check did not return healthy. Check logs:"
    echo "    ssh -p ${SSH_PORT} ${SSH_USER}@${VPS_IP} sudo -u ${APP_USER} pm2 logs avegatasta --lines 50"
    exit 1
fi
