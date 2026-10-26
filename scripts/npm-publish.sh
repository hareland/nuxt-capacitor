#!/usr/bin/env bash
# Publishes the `layer/` package to npm.
#
# `pnpm pack` builds the tarball (so any `workspace:*` ranges are rewritten),
# then the `npm` CLI publishes it, because only npm supports OIDC trusted
# publishing. Runs as the release-it `after:release` hook and by the workflow's
# recovery step.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
layer="$root/layer"
tmp_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmp_dir" "$layer/README.md"
}
trap cleanup EXIT

# The layer ships the root README (listed in its `files`).
cp "$root/README.md" "$layer/README.md"

(cd "$layer" && pnpm pack --pack-destination "$tmp_dir")

npm publish "$tmp_dir"/*.tgz --access public --loglevel verbose
