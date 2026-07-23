// src-tauri/src/main.rs
// Bewusst minimal: die App braucht keine nativen Rust-Kommandos -- sie ist
// derselbe eigenstaendige Frontend-Code wie die Web-/Electron-Version.
// Tauri liefert hier nur das Fenster + die gebuendelten Dateien aus dist/
// (siehe tauri.conf.json -> build.distDir) ueber das System-WebView aus --
// kein eigenes Chromium wie bei Electron, dadurch deutlich kleinere
// Programmgroesse und geringerer Speicherverbrauch.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Fehler beim Starten von Close-up Systems");
}
