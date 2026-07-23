// build.js
// Baut aus frontend-src/ (identischer Code wie die Web-/Electron-Version)
// eine fuer Desktop optimierte Version in dist/:
//
//  1. Alle 27 einzelnen JS-Dateien werden EINMALIG beim Bauen (nicht bei
//     jedem App-Start!) von JSX zu normalem JS transformiert und in der
//     bestehenden Reihenfolge zu EINER Datei zusammengefasst + minifiziert.
//     Das ersetzt das bisherige "Babel Standalone im Browser" (das JSX bei
//     JEDEM Start neu uebersetzt hat) durch einmalige Arbeit beim Bauen.
//     Layout, Funktion und Verhalten bleiben exakt gleich -- die Dateien
//     teilen sich weiterhin denselben globalen Scope wie zuvor, es werden
//     bewusst KEINE import/export-Statements eingefuehrt (kein Risiko,
//     bestehenden Code zu veraendern).
//
//  2. React, ReactDOM und XLSX werden nicht mehr live von CDN geladen,
//     sondern als lokale Dateien mitgeliefert (aus den offiziellen
//     npm-Paketen kopiert, unveraendert) -- macht die App wirklich
//     offlinefaehig und startet ohne Netzwerk-Roundtrip beim Booten.
//
// PDF.js bleibt bewusst CDN-basiert und lazy (nur bei tatsaechlicher
// PDF-Nutzung geladen, siehe js/core/pdf.js) -- das war schon vorher
// so optimiert und aendert sich nicht.

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'frontend-src');
const DIST = path.join(__dirname, 'dist');

// Exakt dieselbe Ladereihenfolge wie zuvor in index.html -- wichtig, da die
// Dateien sich gegenseitig per globalem Scope referenzieren.
const FILES_IN_ORDER = [
  'js/core/icons.js', 'js/core/tokens.js', 'js/core/dnd.js', 'js/core/parser.js', 'js/core/pdf.js', 'js/core/charts.js',
  'js/data/demo-data.js', 'js/data/local-store.js', 'js/data/sync-client.js', 'js/data/live-sync.js', 'js/data/ai-tools-registry.js',
  'js/components/primitives.js', 'js/components/sticky-note.js',
  'js/components/settings.js', 'js/components/ai-analysis.js', 'js/components/ai-tools-panel.js',
  'js/components/script-viewer.js', 'js/components/scripts-section.js', 'js/components/shot-list.js',
  'js/components/takes.js', 'js/components/dood-report.js', 'js/components/cast-section.js',
  'js/components/locations-section.js', 'js/components/equipment-section.js', 'js/components/budget-section.js',
  'js/components/scene-board.js', 'js/components/export-modal.js', 'js/components/import-modal.js',
  'js/components/project-modal.js', 'js/components/navigation.js',
  'js/app.js',
];

async function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(path.join(DIST, 'vendor'), { recursive: true });

  console.log('-> Transformiere + buendle ' + FILES_IN_ORDER.length + ' Dateien...');
  let bundle = '';
  for (const rel of FILES_IN_ORDER) {
    const abs = path.join(SRC, rel);
    const code = fs.readFileSync(abs, 'utf-8');
    const result = await esbuild.transform(code, {
      loader: 'jsx',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      minify: true,
      target: 'es2020',
    });
    bundle += '/* ' + rel + ' */\n' + result.code + '\n';
  }
  fs.writeFileSync(path.join(DIST, 'app.bundle.js'), bundle);
  const bundleSize = (Buffer.byteLength(bundle) / 1024).toFixed(0);
  console.log('   app.bundle.js geschrieben (' + bundleSize + ' KB, statt vorher 27 einzelne Requests + Live-Transpilation)');

  console.log('-> Vendor-Bibliotheken kopieren (statt CDN)...');
  const vendorFiles = [
    ['node_modules/react/umd/react.production.min.js', 'vendor/react.production.min.js'],
    ['node_modules/react-dom/umd/react-dom.production.min.js', 'vendor/react-dom.production.min.js'],
    ['node_modules/xlsx/dist/xlsx.full.min.js', 'vendor/xlsx.full.min.js'],
  ];
  for (const [from, to] of vendorFiles) {
    fs.copyFileSync(path.join(__dirname, from), path.join(DIST, to));
    console.log('   ' + to);
  }

  console.log('-> style.css kopieren...');
  fs.copyFileSync(path.join(SRC, 'style.css'), path.join(DIST, 'style.css'));

  console.log('-> index.html schreiben (1 Bundle statt 27 Script-Tags, lokale Vendor-Libs statt CDN)...');
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover"/>
<title>Close-up Systems</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="style.css"/>
<script src="vendor/react.production.min.js"></script>
<script src="vendor/react-dom.production.min.js"></script>
<script src="vendor/xlsx.full.min.js"></script>
</head>
<body>
<div id="root"></div>
<script src="app.bundle.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(DIST, 'index.html'), html);

  console.log('\nFertig. dist/ ist bereit fuer Tauri (siehe src-tauri/tauri.conf.json -> distDir).');
}

build().catch(e => { console.error(e); process.exit(1); });
