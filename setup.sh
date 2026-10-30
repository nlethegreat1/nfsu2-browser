#!/usr/bin/env bash
# Prepara el proyecto completo en ./work: clona el original en el commit fijado (UPSTREAM), aplica la
# personalización del menú e instala lo que se puede instalar sin el juego.
#
#   bash setup.sh                       clona, personaliza e instala las herramientas de la página
#   bash setup.sh --exe "/ruta/SPEED2.EXE"   además comprueba el .exe y traduce su código a C (web/gen.sh)
#
# Después: ver el README («Puesta en marcha»). Necesita git, Node 20+, Python 3 y, para jugar, Rust y wasi-sdk.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=UPSTREAM
. "$HERE/UPSTREAM"
WORK="$HERE/work"; EXE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --exe) EXE="$2"; shift 2 ;;
    -h|--help) sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "setup.sh: opción desconocida $1"; exit 2 ;;
  esac
done
say() { printf '\033[1m%s\033[0m\n' "$*"; }
for c in git node npm python3; do command -v "$c" >/dev/null || { echo "Falta «$c» en el PATH."; exit 1; }; done
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || { echo "Hace falta Node 20 o más nuevo."; exit 1; }

say "1/4 Código original ($commit)"
if [ ! -d "$WORK/.git" ]; then git clone "$repo" "$WORK"; fi
git -C "$WORK" fetch --quiet origin || true
git -C "$WORK" checkout --quiet --detach "$commit"
# partir siempre de los archivos originales, para poder repetir el script
git -C "$WORK" checkout --quiet -- web/index.html web/src/app/shell.ts web/src/app/style.css

say "2/4 Menú personalizado"
node "$HERE/customize/apply.mjs" "$WORK"

say "3/4 Herramientas de la página (npm ci)"
(cd "$WORK/web" && npm ci --no-audit --no-fund)

say "4/4 Python (traductor del juego)"
[ -d "$WORK/.venv" ] || python3 -m venv "$WORK/.venv"
"$WORK/.venv/bin/pip" install --quiet -r "$WORK/requirements.txt"

if [ -n "$EXE" ]; then
  [ -f "$EXE" ] || { echo "No existe $EXE"; exit 1; }
  if command -v sha256sum >/dev/null; then got="$(sha256sum "$EXE" | cut -d' ' -f1)"; else got="$(shasum -a 256 "$EXE" | cut -d' ' -f1)"; fi
  if [ "$got" != "$exe_sha256" ]; then
    echo "Este SPEED2.EXE no es el esperado (v1.2 NA, 4.800.512 bytes)."
    echo "  esperado: $exe_sha256"; echo "  recibido: $got"; exit 1
  fi
  say "SPEED2.EXE correcto: traduciendo el código del juego a C (web/gen.sh)"
  (cd "$WORK" && web/gen.sh "$EXE")
fi

say "Listo."
echo "Falta, si no lo has hecho:"
[ -n "$EXE" ] || echo "  - bash setup.sh --exe \"/ruta/a/SPEED2.EXE\"   (genera gen/ a partir de tu copia del juego)"
echo "  - wasi-sdk 34 de tu sistema, descomprimido en $WORK/deps/  (https://github.com/WebAssembly/wasi-sdk/releases)"
echo "  - Rust (https://rustup.rs) para el servidor"
echo "Para jugar:  $WORK/web/start.sh --data \"/ruta/a/la carpeta del juego\"   y abre http://localhost:8080/"
