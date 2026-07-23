// js/data/sync-client.js
// Client fuer die Worker-API (D1-Sync). Wird nur genutzt, wenn in den
// Einstellungen eine Worker-URL hinterlegt ist ("syncMode: 'cloud'").
// Faellt bei Netzwerkfehlern automatisch auf lokalen Speicher zurueck --
// die App bleibt dadurch auch offline voll funktionsfaehig.

class SyncClient {
  constructor(baseUrl) {
    // Wenn keine explizite URL gesetzt ist, wird automatisch die aktuelle
    // Domain verwendet -- der Worker liefert Frontend UND API aus demselben
    // Origin aus, daher funktioniert Cloud-Sync direkt nach dem Deploy ohne
    // manuelle Konfiguration. window.location.origin ist bei file:// leer/
    // "null" -- dann bleibt Sync einfach inaktiv (enabled === false).
    const resolved = baseUrl || (typeof window !== 'undefined' && /^https?:/.test(window.location.origin) ? window.location.origin : '');
    this.base = (resolved || '').replace(/\/$/, '');
  }

  get enabled() { return !!this.base; }

  async _fetch(path, opts) {
    if (!this.enabled) throw new Error('Keine Worker-URL konfiguriert');
    const res = await fetch(this.base + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || ('HTTP ' + res.status));
    }
    return res.json();
  }

  listProjects() { return this._fetch('/api/projects'); }

  // Laedt ALLE Projekte + deren kompletten Inhalt in einem Aufruf --
  // wird beim (Wieder-)Verbinden genutzt, um lokal garantiert einen
  // vollstaendigen, konsistenten Stand zu haben.
  getFullState() { return this._fetch('/api/full'); }

  createProject(project) {
    return this._fetch('/api/projects', { method: 'POST', body: JSON.stringify(project) });
  }

  renameProject(id, name) {
    return this._fetch('/api/projects/' + id, { method: 'PATCH', body: JSON.stringify({ name }) });
  }

  deleteProject(id) {
    return this._fetch('/api/projects/' + id, { method: 'DELETE' });
  }

  getProjectData(id) {
    return this._fetch('/api/projects/' + id + '/data');
  }

  // Ersetzt eine ganze Kategorie (z.B. alle Szenen eines Projekts)
  replaceCategory(projectId, category, items) {
    return this._fetch('/api/projects/' + projectId + '/' + category, {
      method: 'PUT', body: JSON.stringify(items),
    });
  }

  // Einzelnes Element anlegen/aktualisieren (kleinere Payload als replaceCategory)
  upsertItem(projectId, category, item) {
    return this._fetch('/api/projects/' + projectId + '/' + category + '/item', {
      method: 'POST', body: JSON.stringify(item),
    });
  }

  deleteRecord(id) {
    return this._fetch('/api/records/' + id, { method: 'DELETE' });
  }

  getSettings() { return this._fetch('/api/settings'); }
  saveSettings(data) { return this._fetch('/api/settings', { method: 'PUT', body: JSON.stringify(data) }); }
}

// React-Hook: liefert eine stabile SyncClient-Instanz (fuer REST-Aufrufe:
// initiales Laden, Fallback wenn WebSocket kurz getrennt ist, Projekt-
// Verwaltung). Der eigentliche "online"-Status kommt aus der Echtzeit-
// WebSocket-Verbindung (siehe live-sync.js) -- hier wird bewusst NICHT mehr
// gepollt, das waere bei einer echten Push-Verbindung redundant.
function useSyncClient(workerUrl) {
  const ref = React.useRef(new SyncClient(workerUrl));
  React.useEffect(() => { ref.current = new SyncClient(workerUrl); }, [workerUrl]);
  return ref.current;
}
