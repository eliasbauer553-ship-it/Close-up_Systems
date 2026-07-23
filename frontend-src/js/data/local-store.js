// js/data/local-store.js
// Lokaler Speicher (localStorage) -- Offline-Fallback und Standardmodus,
// wenn kein Cloudflare Worker konfiguriert ist. Debounced, um bei schnellen
// Aenderungen nicht bei jedem Tastendruck zu schreiben.

const LOCAL_STORAGE_KEY = 'cu9';
let _saveTimer = null;

function loadLocalState() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v) return parsed;
    }
  } catch (e) { /* ignore malformed data */ }
  return null;
}

function saveLocalState(state) {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('localStorage voll oder nicht verfuegbar'); }
  }, 300);
}

function resetLocalState() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}
