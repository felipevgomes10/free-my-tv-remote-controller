#!/usr/bin/env bash
# Publishes a release of FMTV Controller on GitHub. free-my-tv pins a release's version and
# checksum in its gradle.properties, and its build puts that zip's page inside the Home (ADR 0002).
#
# Usage: scripts/release.sh 0.2.0 [--dry-run]
#   --dry-run  builds the zip and stops before committing, tagging, pushing or publishing.
set -euo pipefail

cd "$(dirname "$0")/.."

version="${1:-}"
dry_run="${2:-}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage: scripts/release.sh VERSION [--dry-run], with VERSION like 0.2.0" >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Commit or stash your changes first: a release is built from what is committed." >&2
  exit 1
fi
if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Release from main." >&2
  exit 1
fi
if git rev-parse -q --verify "refs/tags/v$version" >/dev/null; then
  echo "v$version already exists." >&2
  exit 1
fi
current="$(node -p 'require("./package.json").version')"
if [[ "$(printf '%s\n%s\n' "$current" "$version" | sort -V | tail -1)" != "$version" || "$current" == "$version" ]]; then
  echo "$version isn't newer than the current $current." >&2
  exit 1
fi
if [[ "$dry_run" != "--dry-run" ]] && ! gh auth status >/dev/null 2>&1; then
  echo "Sign in to GitHub first: gh auth login" >&2
  exit 1
fi

npm version "$version" --no-git-tag-version >/dev/null
trap 'git checkout --quiet package.json package-lock.json' ERR

npm ci --silent
npm test --silent
npm run build --silent

# The zip holds the built page, which the Home serves, and the protocol's examples, which the
# Home's tests read to check its bridge speaks the same messages.
zip="release/web-remote-$version.zip"
rm -rf release/stage && mkdir -p release/stage
cp -R dist release/stage/page
cp -R protocol release/stage/protocol
(cd release/stage && find . -exec touch -t 202601010000 {} + && zip -qrX "../$(basename "$zip")" page protocol)
rm -rf release/stage
sha="$(shasum -a 256 "$zip" | cut -d' ' -f1)"
echo "$sha  $(basename "$zip")" > "$zip.sha256"
echo "Built $zip ($version)"
echo "SHA-256 $sha"

if [[ "$dry_run" == "--dry-run" ]]; then
  git checkout --quiet package.json package-lock.json
  echo "Dry run: nothing committed, pushed or published."
  exit 0
fi

echo "This commits the version, tags v$version, pushes main and the tag to origin, and publishes the release on GitHub."
read -r -p "Type 'sim' to publish: " answer
if [[ "$answer" != "sim" ]]; then
  git checkout --quiet package.json package-lock.json
  echo "Nothing published."
  exit 1
fi

git commit --quiet -am "chore: release $version"
git tag -a "v$version" -m "FMTV Controller $version"
git push origin main "v$version"
gh release create "v$version" "$zip" "$zip.sha256" --title "FMTV Controller $version" --generate-notes
echo "Published v$version. To ship it in the Home, set in free-my-tv's gradle.properties:"
echo "  webRemoteVersion=$version"
echo "  webRemoteSha256=$sha"
