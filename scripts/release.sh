#!/usr/bin/env bash
#
# Crea un tag di release e lo pusha, avviando la GitHub Action che genera l'APK.
#
# Uso:
#   ./scripts/release.sh v1.0.0

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Uso: $0 <tag>  (es. $0 v1.0.0)" >&2
  exit 1
fi

TAG="$1"

if [[ ! "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Errore: il tag deve avere il formato vX.Y.Z (es. v1.0.0), ricevuto: $TAG" >&2
  exit 1
fi

VERSION="${TAG#v}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [ -n "$(git status --porcelain)" ]; then
  echo "Errore: ci sono modifiche non committate. Fai commit o stash prima di rilasciare." >&2
  exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Errore: il tag $TAG esiste già." >&2
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "Branch corrente: $BRANCH"

echo "Imposto la versione $VERSION in app.json e package.json..."
node -e "
const fs = require('fs');

const appJsonPath = 'app.json';
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.version = '$VERSION';
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = '$VERSION';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
"

if [ -n "$(git status --porcelain -- app.json package.json)" ]; then
  git add app.json package.json
  git commit -m "chore: release $TAG"
else
  echo "La versione era già $VERSION, nessuna modifica da committare."
fi

echo "Creo il tag $TAG..."
git tag -a "$TAG" -m "Release $TAG"

echo "Pusho branch e tag..."
git push origin "$BRANCH"
git push origin "$TAG"

echo "Fatto. Il tag $TAG è stato pushato: controlla su GitHub Actions l'avanzamento della build dell'APK."
