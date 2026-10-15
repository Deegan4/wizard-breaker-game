#!/usr/bin/env bash
# Production web build: `expo export` at the domain root, then patch
# dist/index.html for hosting. Used by Cloudflare Pages' Git integration
# (build command `bun install --frozen-lockfile && bun run build:web`, root
# directory `expo`, output `dist`, env BUN_VERSION + SKIP_DEPENDENCY_INSTALL=1).
set -euo pipefail
cd "$(dirname "$0")/.."

npx expo export --platform web

# Expo's default web template leaves html/body/#root with no
# background-color and sizes them with `height: 100%`, which is
# relative to the layout viewport at load time. Mobile browsers
# resize their visual viewport as the address bar shows or hides,
# which can expose the browser's default background above/below the
# app. Use the dynamic viewport height and paint the app background.
sed -i 's|content="width=device-width, initial-scale=1, shrink-to-fit=no"|content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"|' dist/index.html
sed -i '/<\/head>/i\
<style>html,body,#root{height:100dvh!important;background-color:#0A0618;overscroll-behavior:none}@media (prefers-color-scheme:light){html,body,#root{background-color:#F8FAFC}}</style>' dist/index.html
cp public/manifest.json dist/manifest.json
cp public/sw.js dist/sw.js
sed -i '/<\/head>/i\
<link rel="manifest" href="/manifest.json">\
<meta name="theme-color" content="#8B5CF6">\
<script>\
  if ("serviceWorker" in navigator) {\
    window.addEventListener("load", () => {\
      navigator.serviceWorker.register("/sw.js").catch(() => {});\
    });\
  }\
</script>' dist/index.html
# Never let browsers or Cloudflare cache the HTML shell or service
# worker, so a new deploy shows up on the next load.
cat > dist/_headers << 'EOF'
/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/sw.js
  Cache-Control: no-cache
EOF
# No top-level 404.html: Cloudflare Pages then serves index.html for
# unknown paths, which is the SPA fallback expo-router needs.
