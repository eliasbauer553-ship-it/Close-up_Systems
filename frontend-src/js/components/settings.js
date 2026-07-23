// js/components/settings.js
// Einstellungen: Allgemein, Sync & KI (inkl. Cloudflare Worker/D1-Verbindung), Daten, Info.

function Settings({ cfg, onChange, onClose, mob, onExport, onImport, onReset, syncOnline, cloudEnabled, onRefresh, refreshing, lastRefresh }) {
  const [tab, setTab] = React.useState('gen');
  const [testMsg, setTestMsg] = React.useState('');
  const [testing, setTesting] = React.useState(false);

  async function testConnection() {
    if (!cfg.workerUrl) { setTestMsg('Bitte zuerst eine Worker-URL eintragen.'); return; }
    setTesting(true); setTestMsg('');
    try {
      const client = new SyncClient(cfg.workerUrl);
      await client.listProjects();
      setTestMsg('\u2713 Verbindung erfolgreich -- D1-Datenbank erreichbar.');
    } catch (e) {
      setTestMsg('Fehler: ' + e.message);
    } finally {
      setTesting(false);
    }
  }

  return (
    <Modal onClose={onClose} mob={mob} wide>
      <MHd title="EINSTELLUNGEN" onClose={onClose} />
      <Tabs
        tabs={[
          { id: 'gen', lbl: 'Allgemein', ic: 'Gear' },
          { id: 'sync', lbl: 'Cloud-Sync', ic: 'Cloud' },
          { id: 'ai', lbl: 'KI', ic: 'AI' },
          { id: 'data', lbl: 'Daten', ic: 'FileDn' },
          { id: 'info', lbl: 'Info', ic: 'Info' },
        ]}
        active={tab} onChange={setTab}
      />
      <div style={{ marginTop: 16 }}>
        {tab === 'gen' && (
          <>
            <Fld lbl="Akzentfarbe"><ColPick value={cfg.accent || '#E8A33D'} onChange={v => onChange({ ...cfg, accent: v })} /></Fld>
            <Tog val={cfg.showTakes} onChange={v => onChange({ ...cfg, showTakes: v })} lbl="Takes auf Szenenkarten anzeigen" />
            <Tog val={cfg.compact} onChange={v => onChange({ ...cfg, compact: v })} lbl="Kompakte Ansicht" />
          </>
        )}

        {tab === 'sync' && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 8,
              background: syncOnline ? '#08180A' : '#161719', border: '1px solid ' + (syncOnline ? '#7FBF8F44' : '#2A2C30'),
              marginBottom: 16, fontSize: 11.5, color: syncOnline ? '#7FBF8F' : '#7A7D83',
            }}>
              <Ic n={syncOnline ? 'Sync' : 'NoWifi'} sz={14} cl={syncOnline ? '#7FBF8F' : '#7A7D83'} />
              {syncOnline ? 'Echtzeit-Sync aktiv -- WebSocket verbunden, Aenderungen erscheinen sofort auf allen Geraeten' : 'Cloud-Sync ist an, aber die Echtzeit-Verbindung steht (noch) nicht -- pruefe die Worker-URL oder das Deployment. Verbindet automatisch neu.'}
            </div>

            <Tog
              val={cfg.syncMode === 'cloud'}
              onChange={v => onChange({ ...cfg, syncMode: v ? 'cloud' : 'local' })}
              lbl="Cloud-Sync ueber Cloudflare Worker + D1 (standardmaessig aktiv)"
            />

            <Fld lbl="Worker-URL (optional -- leer = aktuelle Domain)" mt={10}>
              <input
                style={inp(mob)} value={cfg.workerUrl || ''}
                onChange={e => onChange({ ...cfg, workerUrl: e.target.value })}
                placeholder={typeof window !== 'undefined' ? window.location.origin : 'https://close-up-systems.dein-account.workers.dev'}
              />
            </Fld>
            <div style={{ fontSize: 11, color: '#7A7D83', marginBottom: 14, lineHeight: 1.6 }}>
              Bleibt dieses Feld leer, verwendet die App automatisch die
              aktuelle Domain als API-Adresse -- das funktioniert immer dann,
              wenn die App direkt vom Cloudflare Worker ausgeliefert wird
              (Standardfall nach <code>wrangler deploy</code>). Eine eigene
              URL ist nur noetig, wenn Frontend und Worker getrennt gehostet werden.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={testConnection} disabled={testing} style={{ ...gh(mob), flex: 1, justifyContent: 'center', padding: '10px', opacity: testing ? .6 : 1 }}>
                <Ic n="Sync" sz={13} />{testing ? 'Teste...' : 'Verbindung testen'}
              </button>
              {cloudEnabled && (
                <button onClick={onRefresh} disabled={refreshing} style={{ ...pr(mob), flex: 1, justifyContent: 'center', padding: '10px', opacity: refreshing ? .6 : 1 }}>
                  <Ic n="Ref" sz={13} cl="#15120A" st={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
                  {refreshing ? 'Aktualisiere...' : 'Jetzt aktualisieren'}
                </button>
              )}
            </div>
            {lastRefresh && (
              <div style={{ fontSize: 10.5, color: '#5B5F66', marginTop: 8 }}>
                Zuletzt aktualisiert: {new Date(lastRefresh).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            )}
            {testMsg && (
              <div style={{
                fontSize: 11, marginTop: 10, padding: '9px 12px', borderRadius: 8,
                background: '#0F1011', border: '1px solid #2A2C30',
                color: testMsg.startsWith('\u2713') ? '#7FBF8F' : '#E8A33D',
              }}>{testMsg}</div>
            )}
          </>
        )}

        {tab === 'ai' && (
          <>
            <div style={{ fontSize: 11, color: '#7A7D83', marginBottom: 14, lineHeight: 1.6 }}>
              KI-Analyse laeuft ueber <strong style={{ color: '#C9CBD0' }}>OpenRouter</strong> (Zugriff
              auf viele Modelle, inkl. kostenloser Free-Tier-Varianten). Ein
              Key ist bereits vorausgefuellt -- bei Bedarf hier durch einen
              eigenen ersetzen.
            </div>
            <Fld lbl="OpenRouter API-Key">
              <input style={inp(mob)} type="password" value={cfg.apiKey || ''} onChange={e => onChange({ ...cfg, apiKey: e.target.value })} placeholder="sk-or-v1-..." />
            </Fld>
            <Fld lbl="Modell">
              <input style={inp(mob)} value={cfg.aiModel || ''} onChange={e => onChange({ ...cfg, aiModel: e.target.value })} placeholder="deepseek/deepseek-chat-v3-0324:free" />
            </Fld>
            <div style={{ fontSize: 11, color: '#7A7D83', lineHeight: 1.6 }}>
              Weitere Modell-IDs (auch kostenpflichtige mit mehr Leistung)
              unter <span style={{ color: '#9A9DA3' }}>openrouter.ai/models</span>.
              Der Key wird ausschliesslich im Browser gespeichert und direkt
              an OpenRouter gesendet -- niemals ueber den eigenen Worker geleitet.
            </div>
          </>
        )}

        {tab === 'data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#9A9DA3', lineHeight: 1.6, marginBottom: 4 }}>
              Ohne Cloud-Sync werden alle Daten nur lokal im Browser gespeichert.
              Exportiere regelmaessig ein Backup.
            </div>
            <button onClick={onExport} style={{ ...gh(mob), justifyContent: 'center', padding: '11px' }}>
              <Ic n="Dn" sz={14} />Alles als JSON exportieren
            </button>
            <label style={{ ...gh(mob), justifyContent: 'center', padding: '11px', cursor: 'pointer' }}>
              <Ic n="Up" sz={14} />JSON-Backup importieren
              <input type="file" accept=".json" onChange={e => {
                const f = e.target.files?.[0]; if (!f) return;
                const r = new FileReader();
                r.onload = ev => { try { onImport(JSON.parse(ev.target.result)); } catch (x) { alert('Ungueltige Datei.'); } };
                r.readAsText(f);
              }} style={{ display: 'none' }} />
            </label>
            <div style={{ height: 1, background: '#1E2023' }} />
            <button onClick={() => { if (confirm('ACHTUNG: Alle lokalen Daten werden geloescht!')) onReset(); }}
              style={{ ...gh(mob), justifyContent: 'center', padding: '11px', color: '#D16B5C', borderColor: '#3a2622' }}>
              <Ic n="Trash" sz={14} cl="#D16B5C" />Alle lokalen Daten zuruecksetzen
            </button>
          </div>
        )}

        {tab === 'info' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: 2, color: '#E8A33D', marginBottom: 4 }}>CLOSE-UP SYSTEMS</div>
            <div style={{ fontSize: 11, color: '#5B5F66', marginBottom: 16 }}>Professionelle Film-Produktionssoftware</div>
            <div style={{ fontSize: 12, color: '#9A9DA3', lineHeight: 2 }}>
              Production Board + Kalender + Drehbuecher<br />
              KI-Analyse + Shot List + Takes-Board<br />
              Sticky Notes + Multi-Projekt + iCal-Export<br />
              Besetzung + Motive + Budget<br />
              Cloudflare D1 Sync + Offline-Modus + Responsive
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
