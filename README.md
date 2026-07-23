# Close-up Systems -- Desktop-Version (Tauri)

Zweite Generation der Desktop-App, als Ersatz fuer die fruehere
Electron-Version. Gleiches Aussehen, gleiche Bedienung, gleicher
Funktionsumfang -- aber deutlich schlanker:

| | Electron (alt) | Tauri (neu) |
|---|---|---|
| Programmgroesse | ~150-200 MB | ~8-15 MB |
| RAM im Leerlauf | ~150-250 MB | ~40-80 MB |
| Rendering-Engine | eigenes gebuendeltes Chromium | System-WebView (WKWebView/WebView2/WebKitGTK) |
| Runtime | Node.js im Hintergrund | Rust (nativ kompiliert) |

Zusaetzlich wurde das Frontend selbst optimiert (siehe "Was sich am Code
geaendert hat" unten): einmaliges Bundling beim Bauen statt Live-Uebersetzung
bei jedem Start, lokale statt CDN-geladene Bibliotheken.

---

## Ehrlicher Hinweis zum Status dieses Pakets

Ich habe in meiner Bau-Umgebung (ein frisches Linux-Sandbox-Containersystem)
**den Rust/Tauri-Teil nicht vollstaendig kompilieren koennen** -- das
verfuegbare System-Rust dort war Version 1.75 (aus `apt`), waehrend
mehrere Standard-Abhaengigkeiten aus der crates.io-Registry inzwischen ein
neueres Rust verlangen (die `edition2024`-Cargo-Funktion, stabil seit Rust
1.85). Ich habe versucht, das durch gezieltes Zurueckpinnen einzelner
Pakete zu umgehen (`getrandom`, `time`, `idna_adapter`, `tempfile`, `uuid`,
`hashbrown`) -- kam damit ein gutes Stueck weiter, aber es zeigte sich,
dass praktisch das gesamte crates.io-Oekosystem inzwischen ein aktuelles
Rust voraussetzt. Weiteres Pinnen haette immer neue, tiefer verschachtelte
Abhaengigkeiten offengelegt -- eine Sackgasse fuer diese konkrete
Sandbox, keine Eigenschaft des Projekts selbst.

**Was ich tatsaechlich verifiziert habe:**
- Das komplette Frontend-Bundling (`build.js`) laeuft fehlerfrei durch
- Das erzeugte `dist/app.bundle.js` ist syntaktisch valide
- `src-tauri/tauri.conf.json` wurde gegen das **offizielle Tauri-v1-
  JSON-Schema** validiert (per `jsonschema`-Bibliothek, nicht nur
  Handpruefung) -- ist zu 100% konform
- Die npm-basierte `@tauri-apps/cli` erkennt das Projekt korrekt
  (`tauri info` laeuft durch, Rust/Cargo werden gefunden)

**Was ich NICHT verifizieren konnte:** einen tatsaechlich fertig
kompilierten, lauffaehigen Binary -- dafuer reicht das System-Rust
dieser Sandbox nicht aus.

**Deshalb liegt diesem Paket ein GitHub-Actions-Workflow bei**
(`.github/workflows/build.yml`), der auf echten, aktuellen
Windows-/Mac-/Linux-Runnern baut -- dort ist ein zeitgemaesses Rust
vorinstalliert, und der Build sollte genauso normal durchlaufen wie auf
deinem eigenen Mac mit `rustup`. Das ist auch der zuverlaessigste Weg,
um an eine **echte Windows-.exe** zu kommen, ohne selbst einen
Windows-Rechner zu benoetigen (siehe "Automatisch bauen via GitHub
Actions" weiter unten).

Falls beim lokalen `cargo tauri build` auf deinem Mac dieselben
Fehlermeldungen auftauchen sollten (z.B. "feature edition2024 is
required"), heisst das schlicht: dein installiertes Rust ist aelter als
1.85 -- `rustup update` behebt das in der Regel sofort.

---

## Voraussetzungen

1. **Rust** (aktuelle Version, per rustup -- NICHT die alte `apt`/`brew`-
   Systemversion, die ist oft veraltet):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
   (Windows: Installer von https://rustup.rs herunterladen)

2. **Node.js** 18+ (fuer das Bundling-Script)

3. **Tauri-CLI**:
   ```bash
   cargo install tauri-cli --version "^1"
   ```

4. Plattform-Abhaengigkeiten (nur fuer den jeweiligen Build noetig):
   - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
   - **Windows**: "Desktop development with C++" via Visual Studio Build Tools + WebView2 (ist auf aktuellem Windows 10/11 meist schon vorinstalliert)
   - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev` (Ubuntu/Debian: per `apt`)

## Ordnerstruktur

```
cu-tauri/
├── package.json          -- Build-Tooling (esbuild, react, react-dom, xlsx, tauri-cli)
├── build.js               -- Buendelt frontend-src/ -> dist/ (siehe unten)
├── frontend-src/          -- Identischer App-Code wie Web-/Electron-Version
│   ├── index.html          (Vorlage, wird von build.js nicht direkt genutzt)
│   ├── style.css
│   └── js/...              (alle 27 Komponenten-/Core-/Data-Dateien)
├── dist/                  -- Build-Ausgabe (von build.js erzeugt, bereits generiert)
│   ├── index.html
│   ├── app.bundle.js       -- alle 27 Dateien gebuendelt + minifiziert
│   ├── style.css
│   └── vendor/             -- lokale React/ReactDOM/XLSX statt CDN
└── src-tauri/
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json     -- zeigt auf dist/ als Frontend
    ├── icons/               -- PLATZHALTER-Icons (siehe Hinweis unten!)
    └── src/main.rs
```

## Automatisch bauen via GitHub Actions (empfohlener Weg zur echten .exe)

Dieses Paket enthaelt `.github/workflows/build.yml` -- einen fertigen
Workflow, der auf **echten** Windows-, Mac- und Linux-Runnern baut (keine
Sandbox-Einschraenkungen wie oben beschrieben).

**So kommst du an eine echte Windows-.exe/.msi, ohne eigenen Windows-Rechner:**

1. Dieses `cu-tauri`-Verzeichnis in ein GitHub-Repository pushen (leeres
   Repo anlegen, dann `git init && git add -A && git commit -m "init" && git push`)
2. Im Repo auf GitHub oben auf **Actions** klicken
3. Den Workflow **"Build Desktop Installers"** auswaehlen -> **"Run workflow"**
4. Nach ein paar Minuten (Windows-Runner installiert Rust automatisch
   und kompiliert) erscheint unter dem abgeschlossenen Lauf ein Bereich
   **"Artifacts"** mit z.B. `close-up-systems-windows` -- das ist die
   fertige `.exe`/`.msi` zum Herunterladen
5. Derselbe Lauf baut gleichzeitig auch die Mac- (`.dmg`) und
   Linux-Version (`.AppImage`/`.deb`) -- alle drei als separate Artefakte

Der Workflow laesst sich auch automatisch bei jedem Versions-Tag ausloesen
(`git tag v1.0.0 && git push --tags`), falls spaeter Release-Automatisierung
gewuenscht ist.

## Bauen (lokal, auf deinem eigenen Rechner)

```bash
cd cu-tauri
npm install
npm run tauri:dev
```

Das fuehrt automatisch `build.js` aus (baut `dist/` neu) und startet dann
`tauri dev` -- ein natives Fenster mit der App oeffnet sich.

## Fertige Installer bauen

```bash
npm run tauri:build
```

Erzeugt je nach Betriebssystem, auf dem der Befehl laeuft:
- **macOS**: `.app` + `.dmg` in `src-tauri/target/release/bundle/`
- **Windows**: `.msi` und/oder `.exe` (NSIS)
- **Linux**: `.AppImage` und/oder `.deb`

Genau wie bei der Electron-Version gilt: **ein Build-Lauf erzeugt nur das
Format des Betriebssystems, auf dem er laeuft.** Fuer alle drei Formate
entweder auf drei verschiedenen Rechnern bauen, oder GitHub Actions
nutzen (Workflow-Beispiel wie zuvor bei der Electron-Version, nur mit
`tauri-apps/tauri-action` als Schritt).

## Wichtig: Icons austauschen

`src-tauri/icons/` enthaelt aktuell nur **einfache Platzhalter** (ein
schlichtes "C" auf Akzentfarbe) -- generiert, weil kein echtes Logo
vorlag. Vor einer echten Veroeffentlichung durch das richtige Logo
ersetzen. Am einfachsten mit der Tauri-CLI aus einer einzigen PNG-Datei:

```bash
cargo tauri icon pfad/zu/deinem-logo.png
```

Das erzeugt automatisch alle noetigen Groessen/Formate (inkl. `.ico`
fuer Windows und `.icns` fuer macOS, die aktuell fehlen).

## Cloud-Sync

Funktioniert identisch zur Web- und zur Electron-Version: in den
Einstellungen -> Cloud-Sync die Worker-URL der deployten Web-Version
eintragen, dann synchronisieren alle drei Versionen (Web, Electron,
Tauri) in Echtzeit ueber dieselbe Cloudflare-D1-Datenbank.

---

## Was sich am Code gegenueber Electron geaendert hat

Layout, Bedienung und Funktionsumfang sind **exakt identisch** --
`frontend-src/` ist inhaltlich derselbe Code wie `public/` in der
Electron-Version. Geaendert hat sich nur, WIE er ausgeliefert wird:

1. **Bundling statt Live-Uebersetzung**: Vorher hat der Browser bei
   *jedem* App-Start alle 27 Dateien einzeln geladen und deren JSX live
   per `@babel/standalone` uebersetzt. Jetzt passiert das einmalig beim
   Bauen (`build.js`, via `esbuild`) -- zur Laufzeit wird nur noch eine
   fertige, bereits uebersetzte Datei (`app.bundle.js`) geladen.

2. **Lokale statt CDN-geladene Bibliotheken**: React, ReactDOM und XLSX
   kamen vorher live von `unpkg.com`/`cdnjs.cloudflare.com` -- die App
   startete ohne Internetverbindung also gar nicht richtig. Jetzt liegen
   unveraenderte Kopien dieser Bibliotheken lokal in `dist/vendor/`, die
   App ist dadurch wirklich offlinefaehig.

3. **Tauri statt Electron**: nutzt das WebView des Betriebssystems statt
   ein eigenes Chromium mitzubringen -- daher die deutlich kleinere
   Programmgroesse und der geringere Speicherverbrauch (siehe Tabelle oben).

PDF.js bleibt bewusst weiterhin CDN-basiert und wird nur bei tatsaechlicher
PDF-Nutzung nachgeladen (war schon vorher so optimiert, siehe
`js/core/pdf.js`) -- dafuer ist bei reiner PDF-Funktion eine
Internetverbindung noetig.
