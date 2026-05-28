#!/usr/bin/env bash
# =============================================================================
# setup-vps.sh — Avegatasta VPS Bootstrap Script
# Run as root on a fresh Ubuntu 22.04 / Debian 12 VPS
# Usage: sudo bash setup-vps.sh <DOMAIN> <MYSQL_ROOT_PASS> <APP_DB_PASS>
# Example: sudo bash setup-vps.sh avegatasta.com 'rootSecurePass!' 'appSecurePass!'
# =============================================================================
set -euo pipefail

DOMAIN="${1:?Usage: $0 <DOMAIN> <MYSQL_ROOT_PASS> <APP_DB_PASS>}"
MYSQL_ROOT_PASS="${2:?Provide MySQL root password as second argument}"
APP_DB_PASS="${3:?Provide app DB password as third argument}"
APP_DIR="/var/www/avegatasta"
ENV_DIR="/etc/avegatasta"
LOG_DIR="/var/log/avegatasta"
APP_USER="avegatasta"
DB_NAME="avegatasta"
DB_USER="avegatasta_app"
NODE_VERSION="20"

echo "==> [1/9] System update"
apt-get update -qq && apt-get upgrade -y -qq

echo "==> [2/9] Install dependencies"
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw mysql-server

echo "==> [3/9] Install Node.js ${NODE_VERSION} LTS"
curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash -
apt-get install -y nodejs
node --version
npm --version

echo "==> [4/9] Install PM2 globally"
npm install -g pm2
pm2 --version

echo "==> [5/9] MySQL: secure + create DB and app user"
# Set root password and secure installation
mysql -u root <<SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${APP_DB_PASS}';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
echo "  MySQL: database '${DB_NAME}' and user '${DB_USER}' ready"

echo "==> [6/9] Create app user and directories"
if ! id "$APP_USER" &>/dev/null; then
    useradd --system --shell /bin/bash --create-home "$APP_USER"
fi
mkdir -p "$APP_DIR" "$ENV_DIR" "$LOG_DIR"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR" "$LOG_DIR"
chmod 750 "$ENV_DIR"

echo "==> [7/9] Firewall rules (UFW)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment "SSH"
ufw allow 80/tcp comment "HTTP"
ufw allow 443/tcp comment "HTTPS"
# MySQL: only allow from localhost (app is on same machine)
# If MySQL is on a separate LAN host, replace 127.0.0.1 with that host's IP
ufw deny 3306/tcp comment "Block external MySQL"
ufw --force enable
ufw status verbose

echo "==> [8/9] Nginx config"
NGINX_CONF="/etc/nginx/sites-available/avegatasta"
cp "$(dirname "$0")/../nginx/avegatasta.conf" "$NGINX_CONF"
# Substitute placeholder domain
sed -i "s/YOUR_DOMAIN/${DOMAIN}/g" "$NGINX_CONF"
# Disable default site
rm -f /etc/nginx/sites-enabled/default
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/avegatasta
nginx -t
systemctl reload nginx

echo "==> [9/9] SSL certificate via Certbot"
certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" \
    --non-interactive --agree-tos --redirect \
    -m "admin@${DOMAIN}"

echo ""
echo "==================================================================="
echo "  Bootstrap complete!"
echo ""
echo "  DB credentials provisioned:"
echo "    Host:     127.0.0.1"
echo "    Database: ${DB_NAME}"
echo "    User:     ${DB_USER}"
echo "    Password: (as supplied)"
echo ""
echo "  Next steps:"
echo "  1. Generate NEXTAUTH_SECRET:"
echo "       openssl rand -base64 32"
echo "  2. Create /etc/avegatasta/.env.local — fill all CHANGE_ME values:"
echo "       cp .env.local.example /etc/avegatasta/.env.local"
echo "       nano /etc/avegatasta/.env.local"
echo "     Required: MYSQL_PASSWORD=${APP_DB_PASS}, NEXTAUTH_SECRET, NEXTAUTH_URL=https://${DOMAIN}"
echo "     Required: GEMINI_API_KEY, ADMIN_INITIAL_USERNAME, ADMIN_INITIAL_PASSWORD"
echo "     Optional: SMTP_* and NOTIFY_EMAIL for email notifications"
echo "  3. Sync the built app:  rsync -az .next/standalone/ ${APP_DIR}/"
echo "                          rsync -az .next/static/    ${APP_DIR}/.next/static/"
echo "                          rsync -az public/          ${APP_DIR}/public/"
echo "  4. Copy PM2 config:     cp ecosystem.config.js ${APP_DIR}/"
echo "  5. Start app:           sudo -u ${APP_USER} pm2 start ${APP_DIR}/ecosystem.config.js"
echo "  6. PM2 startup:         pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}"
echo "                          sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ${APP_USER}"
echo "  7. Save PM2 state:      sudo -u ${APP_USER} pm2 save"
echo "  8. Verify:              curl -f https://${DOMAIN}/api/health"
echo "  9. SECURITY: After first successful login to admin, remove ADMIN_INITIAL_* vars from .env.local"
echo "==================================================================="
