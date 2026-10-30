#!/usr/bin/env node
// Aplica el menú personalizado sobre un checkout de https://github.com/th0mk/nfsu2-web
//
//   node customize/apply.mjs <carpeta del checkout>
//
// Qué hace (solo la página de inicio y su menú; el motor, runtime/, tools/ y el servidor no se tocan):
//   web/index.html          quita el botón de Discord, el botón y el diálogo de donaciones, la sección
//                           «Changes from the original», el párrafo de Ko-fi y los enlaces a Discord
//   web/src/app/shell.ts    quita las 3 líneas que enlazan el botón de donaciones (si el botón ya no existe,
//                           `$('#donate-btn')` lanzaría un error al arrancar la página)
//   web/src/app/style.css   quita la regla .donate y añade el bloque «Neon street-racing menu refresh»
//                           (customize/menu-neon.css, tomado tal cual del ZIP)
//
// Es idempotente (se puede ejecutar dos veces) y se detiene con error si algo no encaja, en vez de dejar
// el checkout a medias sin avisar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] ?? '.');
const files = {
  html: path.join(root, 'web/index.html'),
  shell: path.join(root, 'web/src/app/shell.ts'),
  css: path.join(root, 'web/src/app/style.css'),
};
for (const [k, f] of Object.entries(files)) {
  if (!fs.existsSync(f)) fail(`no encuentro ${path.relative(root, f)} en ${root} (¿es un checkout de nfsu2-web?)`);
}
const neon = fs.readFileSync(path.join(here, 'menu-neon.css'), 'utf8').replace(/\s+$/, '') + '\n';
const NEON_MARK = 'Neon street-racing menu refresh';

function fail(msg) { console.error(`\nERROR: ${msg}`); process.exit(1); }
const report = [];
const note = (file, what, state) => report.push(`  [${state}] ${file}: ${what}`);

// quita `re` de `text`; devuelve el texto nuevo
function cut(text, re, file, what) {
  if (re.test(text)) { note(file, what, 'quitado'); return text.replace(re, ''); }
  note(file, what, 'no estaba');
  return text;
}
function swap(text, re, to, file, what) {
  if (re.test(text)) { note(file, what, 'cambiado'); return text.replace(re, to); }
  note(file, what, 'no estaba');
  return text;
}

// ---------------------------------------------------------------- web/index.html
{
  const f = 'web/index.html';
  let t = fs.readFileSync(files.html, 'utf8');
  const L = String.raw`[ \t]*`, NL = String.raw`\r?\n`;
  // Discord, en la cabecera
  t = cut(t, new RegExp(`${L}<a class="btn" href="https://discord\\.gg/[^"]*"[^>]*>[\\s\\S]*?</a>${L}${NL}`), f, 'botón Discord');
  // Donaciones: botón de la cabecera y diálogo
  t = cut(t, new RegExp(`${L}<button type="button" class="btn donate" id="donate-btn"[\\s\\S]*?</button>${L}${NL}`), f, 'botón Donate');
  t = cut(t, new RegExp(`${L}<dialog class="dlg" id="donate"[\\s\\S]*?</dialog>${L}${NL}(?:${NL})?`), f, 'diálogo de donaciones');
  // «Changes from the original»
  t = cut(t, new RegExp(`${L}<section class="panel" id="changes"[\\s\\S]*?</section>${L}${NL}(?:${NL})?`), f, 'sección «Changes from the original»');
  // Acerca de: párrafo de Ko-fi, y el de contacto sin la frase que remite a Discord
  t = cut(t, new RegExp(`${L}<p data-i18n-html>If you enjoy the project[\\s\\S]*?</p>${L}${NL}`), f, 'párrafo de Ko-fi');
  t = swap(t, /<p data-i18n-html>Rights holders can email[\s\S]*?<\/p>/,
    '<p data-i18n-html>Rights holders can email <a href="mailto:legal@nfsu2.xyz">legal@nfsu2.xyz</a>.</p>', f, 'contacto sin Discord');
  // Aviso de cierre inesperado: sin el enlace al Discord (texto igual al del ZIP)
  t = swap(t, /(<p class="msg" id="report" hidden data-i18n-html>)[\s\S]*?(<\/p>)/,
    '$1The game stopped unexpectedly. Download the log for details.$2', f, 'aviso de cierre inesperado sin Discord');
  const left = t.match(/discord|ko-fi|donate|id="changes"|Changes from the original/i);
  if (left) fail(`${f} aún contiene «${left[0]}» después de aplicar los cambios; revisa el patrón (¿cambió el original?).`);
  fs.writeFileSync(files.html, t);
}

// ---------------------------------------------------------------- web/src/app/shell.ts
{
  const f = 'web/src/app/shell.ts';
  let t = fs.readFileSync(files.shell, 'utf8');
  t = cut(t, /[ \t]*\/\/ Donate at the top:[^\n]*\n[ \t]*\$\('#donate-btn'\)[^\n]*\n[ \t]*\$\('#donate-go'\)[^\n]*\n/, f, 'enlaces del botón de donaciones');
  const left = t.match(/#donate/);
  if (left) fail(`${f} aún usa «#donate»: quitar el HTML sin quitar esto rompería el arranque de la página.`);
  fs.writeFileSync(files.shell, t);
}

// ---------------------------------------------------------------- web/src/app/style.css
{
  const f = 'web/src/app/style.css';
  let t = fs.readFileSync(files.css, 'utf8');
  t = cut(t, /^[ \t]*\.donate\b[^{}]*\{[^{}]*\}[ \t]*\r?\n/gm, f, 'regla .donate');
  if (t.includes(NEON_MARK)) note(f, 'bloque neón', 'ya estaba');
  else { t = t.replace(/\s*$/, '\n') + '\n' + neon; note(f, 'bloque neón', 'añadido'); }
  fs.writeFileSync(files.css, t);
}

console.log(`Personalización aplicada en ${root}\n${report.join('\n')}`);
