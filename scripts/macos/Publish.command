#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.jsが必要です。https://nodejs.org/ からmacOS用のLTS版をインストールしてください。'
  exit 1
fi
node scripts/macos/service.mjs publish
