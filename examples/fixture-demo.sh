#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/replaynote-fixture-demo"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
npm run build

node dist/cli.js format fixtures/result.json --out "$OUT_DIR/replaynote.md"
node dist/cli.js format fixtures/result.json --format json --out "$OUT_DIR/replaynote.json"

test -s "$OUT_DIR/replaynote.md"
test -s "$OUT_DIR/replaynote.json"
grep -q "npm test" "$OUT_DIR/replaynote.md"
node -e "const fs=require('node:fs'); const data=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); if (data.command.join(' ') !== 'npm test') process.exit(1);" "$OUT_DIR/replaynote.json"

printf 'ReplayNote fixture demo wrote reports to %s\n' "$OUT_DIR"
