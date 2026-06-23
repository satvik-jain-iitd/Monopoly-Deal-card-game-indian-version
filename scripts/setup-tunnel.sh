#!/usr/bin/env bash
set -euo pipefail
# Quick Cloudflare Tunnel for Dhandha — no domain, no Cloudflare account needed.

echo "=== Install cloudflared ==="
curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
chmod +x /tmp/cloudflared
sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
cloudflared version

echo ""
echo "=== Run tunnel (auto-starts with PM2) ==="
echo "This will give you a URL like: https://random-name.trycloudflare.com"
echo ""
echo "Run this command to start:"
echo "  cloudflared tunnel --url http://localhost:3001"
echo ""
echo "Or run as PM2 process:"
echo "  pm2 start cloudflared -- tunnel --url http://localhost:3001"
echo "  pm2 save"
echo ""
echo "=== Save URL for client ==="
echo "Once you get the tunnel URL (wss://random-name.trycloudflare.com):"
echo "  Option 1 — set in .env.production:"
echo "    echo 'VITE_WS_URL=wss://random-name.trycloudflare.com' > .env.production"
echo ""
echo "  Option 2 — set in browser console (survives rebuilds):"
echo "    localStorage.setItem('dhandha.wsUrl', 'wss://random-name.trycloudflare.com')"
echo ""
echo "=== Verify ==="
echo "  curl -s https://random-name.trycloudflare.com/health"
