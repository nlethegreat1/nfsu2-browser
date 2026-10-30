# nfsu2-browser
Need for Speed Underground 2 para navegador. Proyecto web con gráficos, sonido, controles compatibles con PC y móviles, modo online y un menú personalizado con diseño moderno y animaciones.

> Proyecto de aficionados, sin relación con Electronic Arts. **Este repositorio no contiene ningún archivo, código ni dato del juego.** Hace falta tu propia copia.

## Qué es este repositorio

Una capa de personalización sobre [th0mk/nfsu2-web](https://github.com/th0mk/nfsu2-web) (licencia MIT), que es quien contiene el motor: el código x86 del juego traducido a C y compilado a WebAssembly, con gráficos WebGPU, sonido Web Audio, modo online y servidor. El motor **no se modifica**. Se descarga en un commit fijado (`UPSTREAM`) y se le aplica `customize/apply.mjs`, que cambia solo la página de inicio y su menú:

| Cambio | Dónde |
|---|---|
| Menú «neón»: colores, degradados y animaciones (`menu-enter`, elevación al pasar el cursor, Play con degradado, barra de progreso multicolor; respeta `prefers-reduced-motion`) | `customize/menu-neon.css` → se añade a `web/src/app/style.css` |
| Quitados: botón de Discord, botón y diálogo de donaciones, sección «Changes from the original», párrafo de Ko-fi y enlaces a Discord | `web/index.html` |
| Quitado el enlace del botón de donaciones (si no, la página fallaría al arrancar) | `web/src/app/shell.ts` |

Todo lo demás (controles, guardados, nube, online, ajustes, idiomas, servidor) queda tal cual.

## Qué necesitas tú

- Tu copia del juego, con **`SPEED2.EXE` v1.2 NA** (4.800.512 bytes, SHA-256 `f9dd86c054878ce6276beb07c1fd61874f7a1e4bf1f241b084c65b73e24168a7`). Otras versiones no funcionan.
- Mac Apple Silicon (lo probado) o Linux; en Windows, WSL 2 con el clon en el sistema de archivos de Linux.
- git, Node 20+, Python 3, [Rust](https://rustup.rs) y [wasi-sdk 34](https://github.com/WebAssembly/wasi-sdk/releases) de tu sistema.
- Para jugar: Chrome reciente, o Firefox con WebGPU.

## Puesta en marcha

```sh
bash setup.sh --exe "/ruta/a/SPEED2.EXE"     # clona el original, aplica el menú, instala, y traduce el juego a C
# descomprime wasi-sdk 34 en work/deps/
work/web/start.sh --data "/ruta/a/Need for Speed - Underground 2"
```

Abre <http://localhost:8080/> y pulsa **Play**. `start.sh` compila el módulo del juego, la página y el servidor la primera vez. Para jugar con amigos hay que servirlo con HTTPS (ver `docs/web/VPS.md` del original).

`bash setup.sh` sin `--exe` solo prepara la página. Es seguro repetirlo.

## Código completo dentro de este repositorio (opcional)

Si prefieres tener el código del original dentro de este repo (carpeta `nfsu2-web/`, ya personalizado, en commits aparte), desde una rama de trabajo:

```sh
bash import-upstream.sh
```

## Verificación

`.github/workflows/verify.yml` clona el original en el commit fijado, aplica la personalización (dos veces, para comprobar que es repetible), pasa el TypeScript (`tsc`), construye la página y comprueba que no quedan Discord, donaciones ni «Changes» y que el menú neón está presente. No construye el módulo del juego: eso necesita tu `SPEED2.EXE`.

## Avisos

- **Mensaje dentro del juego**: tras ~2 h de juego el original envía un SMS en el teléfono del juego que menciona Discord y Ko-fi (`web/src/app/playtime.ts` y `runtime/sms.c`). Es parte del motor y no se ha tocado.
- Las cadenas «Donate», «Changes from the original», etc. siguen en los archivos de idioma (`web/src/app/lang/*.json`); ya no se usan y no afectan al funcionamiento.
- `index.html` conserva la etiqueta `google-adsense-account` del original.
- Licencias y créditos: `THIRD_PARTY_NOTICES.md`.
