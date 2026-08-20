/**
 * Script de build del frontend desde la raíz del repositorio.
 *
 * Es autosuficiente para entornos de CI/deploy (Vercel, Railway, etc.):
 * si Frontend/node_modules no existe, instala las dependencias del frontend
 * antes de compilar. Así `npm run build` funciona siempre, incluso en un
 * checkout limpio o cuando el proveedor ejecuta el build desde la raíz.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const nodeModulesFrontend = path.join(raiz, 'Frontend', 'node_modules');

if (!fs.existsSync(path.join(nodeModulesFrontend))) {
  console.log('[build] Instalando dependencias del frontend (no encontradas en Frontend/node_modules) ...');
  execSync('npm install --prefix Frontend', { cwd: raiz, stdio: 'inherit' });
} else {
  console.log('[build] Frontend/node_modules detectado. Compilando...');
}

execSync('npm --prefix Frontend run build', { cwd: raiz, stdio: 'inherit' });