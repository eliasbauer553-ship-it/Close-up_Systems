// js/components/takes.js
// Takes-Board: Kanban Geplant/Klappe/Fertig/NG + Auto-Generierung fuer
// Szenen, die gerade "In Progress" sind.

function Takes({ takes, onChange, scenes, mob, dnd }) {
  const [edit, setEdit] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  const [sceneFilter, setSceneFilter] = React.useState('Alle');
  const [tab, setTab] = React.useState('Klappe');

  const filtered = React.useMemo(
    () => sceneFilter === 'Alle' ? takes : takes.filter(t => t.sceneNumber === sceneFilter),
    [takes, sceneFilter]
  );
  const grouped = React.useMemo(() => {
    const g = {}; TSTAT.forEach(s => (g[s] = [])); filtered.forEach(t => g[t.status]?.push(t)); return g;
  }, [filtered]);
  const sceneNumbers = [...new Set(takes.map(t => t.sceneNumber))].sort((a, b) => +a - +b);

  function save(t) { onChange(takes.some(x => x.id === t.id) ? takes.map(x => x.id === t.id ? t : x) : [...takes, t]); }

  function autoGenerate() {
    const existing = new Set(takes.map(t => t.sceneId + '-1'));
    const newTakes = scenes.filter(s => s.status === 'In Progress' && !existing.has(s.id + '-1')).map(s => ({
      id: 'tka' + s.id, sceneId: s.id, sceneNumber: s.number, sceneHeading: s.heading,
      takeNum: 1, status: 'Geplant', note: 'Auto', time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    }));
    if (!newTakes.length) { alert('Alle In-Progress-Szenen haben bereits Takes.'); return; }
    onChange([...takes, ...newTakes]);
  }

  const live = (grouped['Klappe'] || []).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid #1E2023', padding: mob ? '9px 14px' : '9px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: 2, color: '#F2F1EC' }}>TAKES</div>
        {live > 0 && <span style={{ fontSize: 9, background: '#E8A33D', color: '#15120A', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>{live} LIVE</span>}
        <div style={{ fontSize: 10.5, color: '#7A7D83', marginRight: 'auto' }}>{takes.length} Total</div>
        <select value={sceneFilter} onChange={e => setSceneFilter(e.target.value)} style={{ ...inp(mob), width: 'auto', fontSize: 11, padding: '6px 10px' }}>
          <option value="Alle">Alle Szenen</option>
          {sceneNumbers.map(n => <option key={n} value={n}>Szene {n}</option>)}
        </select>
        <button onClick={autoGenerate} style={{ ...gh(mob), padding: '6px 11px', fontSize: 11 }}><Ic n="Ref" sz={12} />Auto</button>
        <button onClick={() => setShowNew(true)} style={{ ...pr(mob), padding: '6px 12px', fontSize: 11 }}><Ic n="Plus" sz={13} cl="#15120A" />Take</button>
      </div>

      {mob ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Tabs tabs={TSTAT.map(s => ({ id: s, lbl: s, dot: TDOT[s], cnt: (grouped[s] || []).length }))} active={tab} onChange={setTab} />
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 90px' }}>
            {(grouped[tab] || []).map(t => <TakeCard key={t.id} take={t} onClick={setEdit} dnd={dnd} />)}
            {!(grouped[tab] || []).length && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3F4147', fontSize: 13 }}>Leer</div>}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: 14, overflowX: 'auto', overflowY: 'hidden' }}>
          {TSTAT.map(st => (
            <div key={st} {...dnd.zone('tk-' + st)} style={{
              background: '#0E0F11', border: '1px solid #1E2023', borderRadius: 10, padding: 11,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              ...(dnd.isOver('tk-' + st) ? { boxShadow: '0 0 0 2px #E8A33D' } : {}),
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11, flexShrink: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: TDOT[st] }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, color: '#C9CBD0' }}>{st.toUpperCase()}</span>
                {st === 'Klappe' && <span style={{ fontSize: 9, background: '#E8A33D', color: '#15120A', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>LIVE</span>}
                <span style={{ fontSize: 10, color: '#5B5F66', marginLeft: 'auto' }}>{(grouped[st] || []).length}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {(grouped[st] || []).map(t => <TakeCard key={t.id} take={t} onClick={setEdit} dnd={dnd} />)}
                {!(grouped[st] || []).length && <div style={{ fontSize: 11, color: '#3F4147', padding: '14px 6px', textAlign: 'center', border: '1px dashed #1E2023', borderRadius: 8 }}>Leer</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {(edit || showNew) && (
        <TakeModal mob={mob} take={edit} scenes={scenes}
          onClose={() => { setEdit(null); setShowNew(false); }}
          onSave={t => { save(t); setEdit(null); setShowNew(false); }}
          onDelete={id => { onChange(takes.filter(t => t.id !== id)); setEdit(null); }} />
      )}
    </div>
  );
}

function TakeCard({ take, onClick, dnd }) {
  const dot = TDOT[take.status] || '#5B5F66';
  return (
    <div {...dnd.drag(take)} onClick={() => onClick(take)} style={{
      ...dnd.drag(take).style, background: '#161719', border: '1px solid #2A2C30', borderLeft: '3px solid ' + dot,
      borderRadius: 8, padding: '11px 12px', marginBottom: 8, color: '#E7E6E2', transition: 'border-color .12s',
    }} onMouseEnter={e => e.currentTarget.style.borderColor = '#454850'} onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2C30'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#E8A33D', fontWeight: 700 }}>SZ {take.sceneNumber} - TAKE {take.takeNum}</span>
        {take.time && <span style={{ fontSize: 10, color: '#5B5F66' }}>{take.time}</span>}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#C9CBD0', marginBottom: take.note ? 4 : 0, lineHeight: 1.3 }}>{take.sceneHeading}</div>
      {take.note && <div style={{ fontSize: 11, color: '#7A7D83', fontStyle: 'italic', marginBottom: 5 }}>{take.note}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: dot }} />
        <span style={{ fontSize: 9.5, color: '#6A6D73' }}>{take.status.toUpperCase()}</span>
        {take.status === 'Klappe' && <span style={{ fontSize: 9, background: 'rgba(232,163,61,.18)', color: '#E8A33D', borderRadius: 4, padding: '1px 6px', marginLeft: 4 }}>&bull; REC</span>}
      </div>
    </div>
  );
}

function TakeModal({ take, scenes, onClose, onSave, onDelete, mob }) {
  const now = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const [f, setF] = React.useState(take || { id: '', sceneId: '', sceneNumber: '', sceneHeading: '', takeNum: 1, status: 'Geplant', note: '', time: now });
  function pickScene(id) { const s = scenes.find(x => x.id === id); if (s) setF(p => ({ ...p, sceneId: s.id, sceneNumber: s.number, sceneHeading: s.heading })); }

  return (
    <Modal mob={mob} onClose={onClose}>
      <MHd title={take ? 'TAKE BEARBEITEN' : 'NEUER TAKE'} onClose={onClose} />
      <Fld lbl="Szene">
        <select style={inp(mob)} value={f.sceneId} onChange={e => pickScene(e.target.value)}>
          <option value="">Szene waehlen...</option>
          {scenes.map(s => <option key={s.id} value={s.id}>Sz {s.number} - {s.heading.slice(0, 38)}</option>)}
        </select>
      </Fld>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld lbl="Take #"><input type="number" min={1} style={inp(mob)} value={f.takeNum} onChange={e => setF({ ...f, takeNum: +e.target.value })} /></Fld>
        <Fld lbl="Zeit"><input style={inp(mob)} value={f.time} onChange={e => setF({ ...f, time: e.target.value })} /></Fld>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {TSTAT.map(st => (
          <button key={st} onClick={() => setF(p => ({ ...p, status: st }))} style={{
            border: '1px solid ' + (f.status === st ? TDOT[st] : '#2A2C30'), background: f.status === st ? '#1A1B1E' : 'transparent',
            color: f.status === st ? TDOT[st] : '#7A7D83', borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
            fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600,
          }}>{st}</button>
        ))}
      </div>
      <Fld lbl="Notiz"><input style={inp(mob)} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="Perfekter Take, Ton pruefen..." /></Fld>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8 }}>
        {take ? <button onClick={() => { onDelete(take.id); onClose(); }} style={{ ...gh(mob), color: '#D16B5C', borderColor: '#3a2622' }}>Loeschen</button> : <span />}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={gh(mob)}>Abbrechen</button>
          <button onClick={() => { if (!f.sceneId) { alert('Szene waehlen.'); return; } onSave({ ...f, id: take ? take.id : 'tk' + Date.now() }); }} style={pr(mob)}>{take ? 'Speichern' : 'Anlegen'}</button>
        </div>
      </div>
    </Modal>
  );
}
