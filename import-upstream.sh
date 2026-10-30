#!/usr/bin/env bash
# OPCIONAL: trae el código completo del original DENTRO de este repositorio (carpeta nfsu2-web/), como subárbol,
# con la personalización ya aplicada y en un commit aparte. Ejecútalo en una rama de trabajo, no en main.
# No incluye nada del juego de EA: el original no lo contiene y su .gitignore deja fuera lo que se genera.
set -euo pipefail
cd "$(dirname "$0")"
. ./UPSTREAM
[ -z "$(git status --porcelain)" ] || { echo "Hay cambios sin confirmar: confírmalos o guárdalos antes."; exit 1; }
[ ! -e nfsu2-web ] || { echo "Ya existe nfsu2-web/."; exit 1; }
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream "$repo"
git fetch upstream
git subtree add --prefix=nfsu2-web "$commit" --squash -m "Añade el código fuente de th0mk/nfsu2-web @ ${commit:0:7} (MIT)"
node customize/apply.mjs nfsu2-web
git add -A nfsu2-web
git commit -m "Menú personalizado: sin Discord, donaciones ni «Changes from the original»"
echo "Hecho. Revisa con «git log --stat -2» y súbelo con «git push -u origin HEAD»."
