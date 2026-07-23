// js/components/import-modal.js
// Szenen-Import direkt ins Production Board (unabhaengig von der
// Drehbuch-Bibliothek) -- z.B. fuer schnelle Aenderungen ohne neues Skript.

function ImportModal({ onClose, onImport, mob }) {
  const pdfReady = usePdfJs();
  const [raw, setRaw] = React.useState('');
  const [preview, setPreview] = React.useState([]);
  const [stage, setStage] = React.useState('input');
  const [fileName, setFileName] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setFileName(f.name);
    if (f.name.endsWith('.pdf')) {
      if (!pdfReady) { setMsg('PDF.js laedt...'); return; }
      setLoading(true); setMsg('Extrahiere...');
      try { const t = await extractPdfText(f); setRaw(t); setMsg('\u2713 ' + t.split('\n').length + ' Zeilen'); }
      catch (x) { setMsg('Fehler: ' + x.message); }
      finally { setLoading(false); }
      return;
    }
    if (f.name.endsWith('.html') || f.name.endsWith('.htm')) {
      const r = new FileReader();
      r.onload = ev => { setRaw(htmlToPlainText(String(ev.target.result || ''))); setMsg('\u2713 HTML'); };
      r.readAsText(f, 'utf-8');
      return;
    }
    const r = new FileReader();
    r.onload = ev => { setRaw(String(ev.target.result || '')); setMsg(''); };
    r.readAsText(f, 'utf-8');
  }

  return (
    <Modal mob={mob} onClose={onClose} wide>
      <MHd title="SZENEN IMPORTIEREN" sub="Aus Drehbuch erkennen" onClose={onClose} />
      {stage === 'input' && (
        <>
          <label style={{ ...gh(mob), justifyContent: 'center', padding: '12px', marginBottom: 10, cursor: 'pointer' }}>
            <Ic n="Up" sz={14} />Datei waehlen (.pdf - .txt - .fountain - .html)
            <input type="file" accept=".txt,.fountain,.pdf,.html,.htm" onChange={handleFile} style={{ display: 'none' }} disabled={loading} />
          </label>
          {fileName && <div style={{ fontSize: 11, color: '#7A7D83', marginBottom: 8, textAlign: 'center' }}>{fileName}</div>}
          {msg && (
            <div style={{ fontSize: 11, color: msg.startsWith('\u2713') ? '#7FBF8F' : '#E8A33D', marginBottom: 10, padding: '9px 12px', background: '#0F1011', borderRadius: 8, border: '1px solid #2A2C30' }}>{msg}</div>
          )}
          <textarea value={raw} onChange={e => setRaw(e.target.value)}
            placeholder={'Text einfuegen:\n\n1 INT. BUERO - TAG\nFRANZ\nHallo.\n\n2 EXT. STRASSE - NACHT'}
            style={{ ...inp(mob), minHeight: 150, resize: 'vertical', lineHeight: 1.5, marginBottom: 14 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ ...gh(mob), flex: 1, justifyContent: 'center' }}>Abbrechen</button>
            <button onClick={() => { setPreview(parseScenesFromText(raw)); setStage('preview'); }}
              disabled={!raw.trim() || loading} style={{ ...pr(mob), flex: 2, justifyContent: 'center', opacity: raw.trim() && !loading ? 1 : .4 }}>
              Szenen erkennen
            </button>
          </div>
        </>
      )}
      {stage === 'preview' && (
        <>
          <div style={{ fontSize: 12, color: preview.length ? '#7FBF8F' : '#D16B5C', marginBottom: 12, fontWeight: 600 }}>
            {preview.length} Szene{preview.length === 1 ? '' : 'n'} erkannt
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid #2A2C30', borderRadius: 8, marginBottom: 14 }}>
            {preview.map((s, i) => (
              <div key={s.id} style={{ padding: '8px 12px', borderBottom: i < preview.length - 1 ? '1px solid #1E2023' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                <div><span style={{ color: '#E8A33D', fontWeight: 700, marginRight: 8, fontSize: 11 }}>#{s.number}</span><span style={{ fontSize: 11.5 }}>{s.heading}</span></div>
                <span style={{ color: '#7A7D83', fontSize: 10.5 }}>{s.pages}S</span>
              </div>
            ))}
            {!preview.length && <div style={{ padding: 16, fontSize: 12, color: '#7A7D83' }}>Kein Format erkannt.</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStage('input')} style={{ ...gh(mob), flex: 1, justifyContent: 'center' }}>&larr; Zurueck</button>
            <button onClick={() => { onImport(preview); onClose(); }} disabled={!preview.length} style={{ ...pr(mob), flex: 2, justifyContent: 'center', opacity: preview.length ? 1 : .4 }}>
              {preview.length} Szenen uebernehmen
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
