/**
 * Verificador case-sensitive de imports relativos en Frontend/src.
 *
 * El build en Windows no detecta desajustes de mayúsculas en rutas de import
 * (fs case-insensitive), pero el build en Linux/CI/Vercel falla. Recorre
 * Frontend/src, resuelve cada import relativo segmento a segmento y compara
 * el nombre exacto en disco (soporta imports sin extensión).
 *
 * Uso: node scripts/check-imports-case.js
 * Exit 1 si hay problemas; imprime cada fallo con la ruta corregida.
 */

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'Frontend', 'src');
const resultados = [];

function listar(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.name !== 'node_modules')
    .map((e) => ({ dir: e.isDirectory(), name: e.name }));
}

function archivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) archivos(p, acc);
    else if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function sinExtension(nombre, conPunto) {
  return conPunto ? nombre.slice(0, nombre.lastIndexOf('.')) : nombre;
}

// Devuelve el nombre real (con su mayúsculas) que coincide con `seg`,
// o null si no existe. Soportes imports sin extensión.
function candidato(entradas, seg) {
  const busca = seg.toLowerCase();
  const conPunto = seg.includes('.');
  const directo = entradas.find((e) => e.name.toLowerCase() === busca);
  if (directo) return { name: directo.name };
  if (!conPunto) {
    const sinExt = entradas.find((e) => !e.dir && sinExtension(e.name, true).toLowerCase() === busca);
    if (sinExt) return { name: sinExt.name };
  }
  return null;
}

for (const file of archivos(src)) {
  let contenido = fs.readFileSync(file, 'utf8');
  // Ocultar comentarios de bloque y de línea para no analizar imports comentados
  contenido = contenido.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
  const re = /(?:from\s+|require\s*\(\s*|import\s*\(\s*)\s*['"`](\.{1,2}[^'"`]*?)['"`]/g;
  let m;
  while ((m = re.exec(contenido))) {
    const imp = m[1];
    const segmentos = imp.split('/');
    const dirBase = path.dirname(file);
    let actual = dirBase;
    const caminoReal = [];
    let ok = true;

    for (const seg of segmentos) {
      if (seg === '.') continue;
      if (seg === '..') { actual = path.dirname(actual); continue; }
      const c = candidato(listar(actual), seg);
      if (!c) { ok = false; break; }
      caminoReal.push(c.name);
      actual = path.join(actual, c.name);
    }
    if (!ok) {
      resultados.push(`NO EXISTE: ${file}\n    import: '${imp}'`);
      continue;
    }

    // Comparar segmento a segmento (case-sensitive), ignorando '.' y '..'
    let idxReal = 0;
    let iguales = true;
    for (const seg of segmentos) {
      if (seg === '.' || seg === '..') continue;
      const real = caminoReal[idxReal++];
      const realSinExt = real.includes('.') && !seg.includes('.') ? sinExtension(real, true) : real;
      if (realSinExt !== seg) { iguales = false; break; }
    }
    if (!iguales) {
      const rel = path.relative(src, path.join(dirBase, ...caminoReal)).split(path.sep).join('/');
      resultados.push(`MAYUSCULAS: ${file}\n    escrito:  '${imp}'\n    correcto: '../../${rel}'`);
    }
  }
}

const unicos = [...new Set(resultados)];
for (const r of unicos) console.log(r + '\n');
console.log(`Resultado: ${unicos.length} problema(s)`);
process.exit(unicos.length > 0 ? 1 : 0);