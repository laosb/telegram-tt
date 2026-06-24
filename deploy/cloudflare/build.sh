#!/usr/bin/env bash
set -euo pipefail

# Write the Blah server config (JSON) from the build environment, if provided.
# Kept out of git; Vite reads blah-server.config.json at build time.
if [ -n "${BLAH_SERVER_CONFIG:-}" ]; then
  printf '%s' "$BLAH_SERVER_CONFIG" > blah-server.config.json
fi

# Production build, then exclude artifacts that must not be uploaded as assets:
# source maps (sourcemap: true) and the optional bundle-stats/ report dir.
npm run build:production

cat > dist/.assetsignore <<'EOF'
*.map
bundle-stats
.DS_store
EOF
