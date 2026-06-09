#!/usr/bin/env bash
set -euo pipefail

# Write the Blah server config (JSON) from the build environment, if provided.
# Kept out of git; webpack reads blah-server.config.json at build time.
if [ -n "${BLAH_SERVER_CONFIG:-}" ]; then
  printf '%s' "$BLAH_SERVER_CONFIG" > blah-server.config.json
fi

# Production build, then exclude artifacts that must not be uploaded as assets.
# build-stats.json (~100 MB) exceeds Cloudflare's 25 MiB per-file limit.
npm run build:production

cat > dist/.assetsignore <<'EOF'
build-stats.json
statoscope-report.html
*.map
.DS_store
EOF
