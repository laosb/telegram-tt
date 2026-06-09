# Cloudflare Workers deployment

Deploys to Cloudflare Workers as Static Assets, served as a single-page app,
via [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).

## Setup

In the Cloudflare dashboard, create a Worker and connect this repository, then:

- **Build command:** `bash deploy/cloudflare/build.sh`
- **Deploy command:** `npx wrangler deploy` (default)
- **Build variable** `BLAH_SERVER_CONFIG`: the `blah-server.config.json`
  contents as JSON (see `blah-server.config.example.json`). Omit to keep the
  upstream production server. The build writes it to disk for webpack to read.

`wrangler.jsonc` (repo root) holds the Worker name and the static-asset SPA
settings. Set `name` to match your Worker. The account is the one connected to
Workers Builds.

Routing is managed in the dashboard: `wrangler.jsonc` sets `workers_dev: false`
and declares no routes, so deploys do not override a custom domain attached
under the Worker's **Domains & Routes** settings.
