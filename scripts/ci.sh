#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$ROOT_DIR/apps/api"
WEB_DIR="$ROOT_DIR/apps/web"

export UV_CACHE_DIR="${UV_CACHE_DIR:-$ROOT_DIR/.cache/uv}"

if [[ -x /opt/homebrew/opt/node@24/bin/node ]]; then
  export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
fi

if [[ -d /opt/homebrew/opt/pnpm@10/bin ]]; then
  export PATH="/opt/homebrew/opt/pnpm@10/bin:$PATH"
fi

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'error: required command "%s" was not found\n' "$command_name" >&2
    exit 1
  fi
}

require_major_version() {
  local command_name="$1"
  local expected_major="$2"
  local actual_version
  local actual_major

  actual_version="$("$command_name" --version)"
  actual_major="$(printf '%s' "$actual_version" | sed -E 's/^[^0-9]*([0-9]+).*/\1/')"

  if [[ "$actual_major" != "$expected_major" ]]; then
    printf 'error: %s %s is required; found %s\n' \
      "$command_name" "$expected_major" "$actual_version" >&2
    exit 1
  fi
}

run_step() {
  local label="$1"
  shift

  printf '\n==> %s\n' "$label"
  "$@"
}

require_command uv
require_command node
require_command pnpm
require_major_version node 24
require_major_version pnpm 10

run_step "Check API formatting" \
  bash -c 'cd "$1" && uv run ruff format --check .' _ "$API_DIR"
run_step "Lint API" \
  bash -c 'cd "$1" && uv run ruff check .' _ "$API_DIR"
run_step "Type-check API" \
  bash -c 'cd "$1" && uv run mypy' _ "$API_DIR"
run_step "Test API" \
  bash -c 'cd "$1" && uv run pytest' _ "$API_DIR"

run_step "Check frontend formatting" \
  pnpm --dir "$WEB_DIR" format:check
run_step "Lint frontend" \
  pnpm --dir "$WEB_DIR" lint
run_step "Type-check frontend" \
  pnpm --dir "$WEB_DIR" typecheck
run_step "Test frontend units" \
  pnpm --dir "$WEB_DIR" test:unit
run_step "Build frontend" \
  pnpm --dir "$WEB_DIR" build

if [[ "${SKIP_E2E:-0}" == "1" ]]; then
  printf '\n==> Skip end-to-end tests (SKIP_E2E=1)\n'
else
  run_step "Test frontend end to end" \
    pnpm --dir "$WEB_DIR" test:e2e
fi

printf '\nAll local CI checks passed.\n'
