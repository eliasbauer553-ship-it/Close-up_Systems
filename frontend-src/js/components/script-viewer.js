// js/components/script-viewer.js
// Formatierter Drehbuch-Viewer: Suche mit Treffer-Navigation, Szenensprung,
// Schriftgroesse, Drucken und direkter Zugriff auf die KI-Analyse.

function ScriptViewer({ script, onClose, mob, apiKey, aiModel, scenesAll, onApplyFormat, onApplyBreakdown, onApplyBudget }) {
  const [search, setSearch] = React.useState('');
  const [hits, setHits] = React.useState([]);
  const [hitIdx, setHitIdx] = React.useState(0);
  const [fontSize, setFontSize] = React.useState(13);
  const [showAI, setShowAI] = React.useState(false);
  const [showTools, setShowTools] = React.useState(false);
  const containerRef = React.useRef(null);

  const blocks = React.useMemo(() => parseScriptBlocks(script?.content || ''), [script]);
  const scenes = React.useMemo(() => blocks.filter(b => b.type === 'scene'), [blocks]);
  const CLASS_MAP = { scene: 'sk-scene', char: 'sk-char', dial: 'sk-dial', paren: 'sk-paren', action: 'sk-action', trans: 'sk-trans' };

  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    root.querySelectorAll('.sk-hit,.sk-hit-cur').forEach(e => e.classList.remove('sk-hit', 'sk-hit-cur'));
    if (search.trim().length < 2) { setHits([]); return; }
    const found = [];
    root.querySelectorAll('[data-bi]').forEach(el => {
      if (el.textContent.toLowerCase().includes(search.toLowerCase())) { el.classList.add('sk-hit'); found.push(el); }
    });
    setHits(found); setHitIdx(0);
    if (found[0]) { found[0].classList.add('sk-hit-cur'); found[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, [search]);

  function jumpHit(dir) {
    if (!hits.length) return;
    hits[hitIdx]?.classList.remove('sk-hit-cur');
    const next = (hitIdx + dir + hits.length) % hits.length;
    setHitIdx(next);
    hits[next].classList.add('sk-hit-cur');
    hits[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function printScript() {
    const w = window.open('', '_blank');
    w.document.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + script.name + '</title>' +
      '<style>body{font-family:\'Courier New\',monospace;max-width:680px;margin:40px auto;font-size:12px;line-height:1.6;color:#111}' +
      '.sk-scene{font-weight:bold;text-transform:uppercase;margin:16px 0 4px}.sk-char{text-align:center;font-weight:bold;margin:10px 0 0}' +
      '.sk-dial{margin:0 80px}.sk-paren{margin:0 100px;font-style:italic}.sk-action{margin:3px 0}' +
      '.sk-trans{text-align:right;font-style:italic;color:#666}</style></head><body>'
    );
    w.document.write(containerRef.current?.innerHTML || '');
    w.document.write('</body></html>');
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B0C0E', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
      <div className="np" style={{
        background: '#0E0F11', borderBottom: '1px solid #1E2023', padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: mob ? 'wrap' : 'nowrap', flexShrink: 0,
      }}>
        <button onClick={onClose} style={{ ...gh(mob), padding: '6px 11px' }}><Ic n="CL" sz={13} />Zurueck</button>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, color: '#E8A33D', flexShrink: 0 }}>{script?.name}</div>

        <div style={{ position: 'relative', flex: 1, minWidth: mob ? '100%' : 150, order: mob ? 10 : 0 }}>
          <Ic n="Search" sz={12} cl="#5B5F66" st={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && jumpHit(e.shiftKey ? -1 : 1)}
            placeholder="Im Skript suchen..." style={{ ...inp(mob), paddingLeft: 28, fontSize: 12, padding: '7px 10px 7px 28px' }} />
        </div>
        {hits.length > 0 && (
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', fontSize: 11, color: '#7A7D83', flexShrink: 0 }}>
            <span>{hitIdx + 1}/{hits.length}</span>
            <button onClick={() => jumpHit(-1)} style={S0}><Ic n="CU" sz={12} /></button>
            <button onClick={() => jumpHit(1)} style={S0}><Ic n="CD" sz={12} /></button>
          </div>
        )}
        {!mob && scenes.length > 0 && (
          <select onChange={e => containerRef.current?.querySelector('[data-sid="' + e.target.value + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{ ...inp(mob), width: 'auto', fontSize: 11, padding: '6px 10px' }}>
            <option value="">Szene...</option>
            {scenes.map((s, i) => <option key={i} value={s.id}>{s.text.slice(0, 44)}</option>)}
          </select>
        )}
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button onClick={() => setFontSize(f => Math.max(9, f - 1))} style={{ ...S0, border: '1px solid #2A2C30', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>A-</button>
          <button onClick={() => setFontSize(f => Math.min(20, f + 1))} style={{ ...S0, border: '1px solid #2A2C30', borderRadius: 6, padding: '4px 9px', fontSize: 14 }}>A+</button>
        </div>
        <button onClick={() => setShowAI(true)} style={{ ...gh(mob), padding: '6px 11px', color: '#E8A33D', borderColor: '#E8A33D44' }}>
          <Ic n="AI" sz={13} cl="#E8A33D" />{!mob && 'KI'}
        </button>
        <button onClick={() => setShowTools(true)} style={{ ...gh(mob), padding: '6px 11px', color: '#7FBF8F', borderColor: '#7FBF8F44' }}>
          <Ic n="Wrench" sz={13} cl="#7FBF8F" />{!mob && 'KI-Werkzeuge'}
        </button>
        <button onClick={printScript} style={{ ...gh(mob), padding: '6px 11px' }}><Ic n="Print" sz={13} />{!mob && 'Drucken'}</button>
      </div>

      <div ref={containerRef} style={{
        flex: 1, overflowY: 'auto', padding: mob ? '16px 14px' : '40px 8vw', background: '#0B0C0E',
        fontSize, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.65,
      }}>
        {blocks.map((b, i) => (
          <p key={i} data-bi={i} data-sid={b.type === 'scene' ? b.id : undefined} className={CLASS_MAP[b.type] || 'sk-action'}>{b.text}</p>
        ))}
      </div>

      <div className="np" style={{ background: '#0E0F11', borderTop: '1px solid #1E2023', padding: '5px 14px', fontSize: 10, color: '#5B5F66', display: 'flex', gap: 16 }}>
        <span>{scenes.length} Szenen</span><span>{script?.pages} Seiten</span>
      </div>

      {showAI && <AIAnalysisModal script={script} apiKey={apiKey} aiModel={aiModel} onClose={() => setShowAI(false)} mob={mob} />}
      {showTools && (
        <AIToolsPanel script={script} scenes={scenesAll} apiKey={apiKey} aiModel={aiModel} onClose={() => setShowTools(false)} mob={mob}
          onApplyFormat={onApplyFormat} onApplyBreakdown={onApplyBreakdown} onApplyBudget={onApplyBudget} />
      )}
    </div>
  );
}
