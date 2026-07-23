// js/components/scripts-section.js
// Drehbuch-Bibliothek: Skripte laden (PDF/TXT/Fountain/HTML), lesen,
// per Szenenerkennung ins Production Board importieren.

function ScriptsSection({ scripts, onChange, onImportToBoard, mob, desk, apiKey, aiModel, scenesAll, onApplyFormat, onApplyBreakdown, onApplyBudget }) {
  const [viewer, setViewer] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const pdfReady = usePdfJs();

  if (viewer) return <ScriptViewer script={viewer} onClose={() => setViewer(null)} mob={mob} apiKey={apiKey} aiModel={aiModel} scenesAll={scenesAll} onApplyFormat={t => onApplyFormat(viewer.id, t)} onApplyBreakdown={onApplyBreakdown} onApplyBudget={onApplyBudget} />;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '14px 14px 90px' : '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: mob ? 20 : 26, letterSpacing: 2, color: '#F2F1EC' }}>DREHBUECHER</div>
          <div style={{ fontSize: 11, color: '#5B5F66' }}>{scripts.length} Skript{scripts.length === 1 ? '' : 's'}</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={pr(mob)}><Ic n="Plus" sz={14} cl="#15120A" />Skript laden</button>
      </div>

      {scripts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #2A2C30', borderRadius: 12 }}>
          <Ic n="Book" sz={40} cl="#3A3C40" st={{ display: 'block', margin: '0 auto 14px' }} />
          <div style={{ fontSize: 13, color: '#5B5F66', marginBottom: 14 }}>Noch kein Drehbuch geladen</div>
          <button onClick={() => setShowAdd(true)} style={pr(mob)}><Ic n="Up" sz={13} cl="#15120A" />Laden</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : desk ? 'repeat(3,1fr)' : '1fr 1fr', gap: 12 }}>
        {scripts.map(s => (
          <div key={s.id} style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1A1B1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ic n="Book" sz={16} cl="#E8A33D" />
              </div>
              <button onClick={() => onChange(scripts.filter(x => x.id !== s.id))} style={{ ...S0, color: '#D16B5C' }}><Ic n="Trash" sz={13} /></button>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F2F1EC', marginBottom: 3 }}>{s.name}</div>
              <div style={{ fontSize: 10.5, color: '#7A7D83' }}>{s.scenes} Szenen - {s.pages} S.</div>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={() => setViewer(s)} style={{ ...pr(mob), flex: 1, justifyContent: 'center', padding: '8px', fontSize: 11 }}>
                <Ic n="Eye" sz={12} cl="#15120A" />Lesen
              </button>
              <button onClick={() => {
                const parsed = parseScenesFromText(s.content);
                if (!parsed.length) { alert('Keine Szenen erkannt.'); return; }
                if (confirm(parsed.length + ' Szenen ins Board importieren?')) onImportToBoard(parsed);
              }} style={{ ...gh(mob), flex: 1, justifyContent: 'center', padding: '8px', fontSize: 11 }}>
                <Ic n="Grid" sz={12} />Board
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <ScriptAddModal mob={mob} pdfReady={pdfReady} onClose={() => setShowAdd(false)}
        onAdd={s => { onChange([...scripts, s]); setShowAdd(false); }} />}
    </div>
  );
}

function ScriptAddModal({ onClose, onAdd, mob, pdfReady }) {
  const [name, setName] = React.useState('');
  const [raw, setRaw] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [stage, setStage] = React.useState('input');
  const [preview, setPreview] = React.useState([]);

  async function handleFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setFileName(f.name);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));

    if (f.name.endsWith('.pdf')) {
      if (!pdfReady) { setMsg('PDF.js laedt...'); return; }
      setLoading(true); setMsg('Extrahiere Text...');
      try {
        const text = await extractPdfText(f);
        setRaw(text);
        setMsg('\u2713 ' + text.split('\n').length + ' Zeilen extrahiert');
      } catch (x) { setMsg('Fehler: ' + x.message); }
      finally { setLoading(false); }
      return;
    }
    if (f.name.endsWith('.html') || f.name.endsWith('.htm')) {
      const r = new FileReader();
      r.onload = ev => { setRaw(htmlToPlainText(String(ev.target.result || ''))); setMsg('\u2713 HTML geladen'); };
      r.readAsText(f, 'utf-8');
      return;
    }
    const r = new FileReader();
    r.onload = ev => { setRaw(String(ev.target.result || '')); setMsg(''); };
    r.readAsText(f, 'utf-8');
  }

  return (
    <Modal mob={mob} onClose={onClose} wide>
      <MHd title="SKRIPT HINZUFUEGEN" sub="PDF - TXT - Fountain - HTML" onClose={onClose} />

      {stage === 'input' && (
        <>
          <Fld lbl="Titel"><input style={inp(mob)} value={name} onChange={e => setName(e.target.value)} placeholder="Filmtitel FINAL" /></Fld>
          <label style={{ ...gh(mob), justifyContent: 'center', padding: '12px', marginBottom: 10, cursor: 'pointer' }}>
            <Ic n="Up" sz={14} />{loading ? 'Laedt...' : 'Datei waehlen (.pdf - .txt - .fountain - .html)'}
            <input type="file" accept=".txt,.fountain,.pdf,.html,.htm" onChange={handleFile} style={{ display: 'none' }} disabled={loading} />
          </label>
          {fileName && <div style={{ fontSize: 11, color: '#7A7D83', marginBottom: 8, textAlign: 'center' }}>{fileName}</div>}
          {msg && (
            <div style={{
              fontSize: 11, color: msg.startsWith('\u2713') ? '#7FBF8F' : '#E8A33D', marginBottom: 10,
              padding: '9px 12px', background: '#0F1011', borderRadius: 8, border: '1px solid #2A2C30',
            }}>{msg}</div>
          )}
          <textarea value={raw} onChange={e => setRaw(e.target.value)}
            placeholder={'Oder Text einfuegen:\n\n1 INT. BUERO - TAG\nFRANZ\nWir fangen an.'}
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
            <button onClick={() => {
              const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';
              onAdd({
                id: 'sc' + Date.now(), name: name || fileName || 'Skript', type: ext, content: raw,
                scenes: preview.length, pages: Math.round(raw.split('\n').length / 55 * 10) / 10, uploadedAt: Date.now(),
              });
            }} style={{ ...pr(mob), flex: 2, justifyContent: 'center' }}>Speichern</button>
          </div>
        </>
      )}
    </Modal>
  );
}
