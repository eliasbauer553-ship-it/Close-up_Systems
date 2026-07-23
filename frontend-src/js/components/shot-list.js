// js/components/shot-list.js
// Shot List: Kameratypen, Winkel, Bewegung, Linse pro Szene.

function ShotList({ shots, onChange, scenes, mob, dnd }) {
  const [showNew, setShowNew] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [sceneFilter, setSceneFilter] = React.useState('Alle');

  const filtered = React.useMemo(
    () => sceneFilter === 'Alle' ? shots : shots.filter(s => s.sceneNumber === sceneFilter),
    [shots, sceneFilter]
  );
  const sceneNumbers = [...new Set(shots.map(s => s.sceneNumber))].sort((a, b) => +a - +b);
  const STATUS_DOT = { 'Planned': '#5B5F66', 'In Progress': '#E8A33D', 'Fertig': '#7FBF8F' };

  function save(sh) { onChange(shots.some(s => s.id === sh.id) ? shots.map(s => s.id === sh.id ? sh : s) : [...shots, sh]); }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid #1E2023', padding: mob ? '9px 14px' : '9px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: 2, color: '#F2F1EC', marginRight: 'auto' }}>SHOT LIST</div>
        <select value={sceneFilter} onChange={e => setSceneFilter(e.target.value)} style={{ ...inp(mob), width: 'auto', fontSize: 11, padding: '6px 10px' }}>
          <option value="Alle">Alle Szenen</option>
          {sceneNumbers.map(n => <option key={n} value={n}>Szene {n}</option>)}
        </select>
        <button onClick={() => setShowNew(true)} style={{ ...pr(mob), padding: '7px 12px', fontSize: 11 }}><Ic n="Plus" sz={13} cl="#15120A" />Shot</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '10px 12px 90px' : '12px 18px' }}>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3F4147', fontSize: 13 }}>Keine Shots</div>}
        {filtered.map(sh => (
          <div key={sh.id} {...dnd.drag(sh)} style={{
            ...dnd.drag(sh).style, background: '#161719', border: '1px solid #2A2C30', borderRadius: 8,
            padding: '9px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 12, color: '#C9CBD0', flexWrap: mob ? 'wrap' : 'nowrap',
          }} onMouseEnter={e => e.currentTarget.style.borderColor = '#454850'} onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2C30'}>
            <span style={{ color: '#E8A33D', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>SZ {sh.sceneNumber}</span>
            <span style={{ fontWeight: 600, color: '#F2F1EC', flexShrink: 0 }}>{sh.shotType}</span>
            {!mob && <><span style={{ color: '#9A9DA3' }}>{sh.angle}</span><span style={{ color: '#9A9DA3' }}>{sh.movement}</span><span style={{ color: '#9A9DA3' }}>{sh.lens}</span></>}
            <span style={{ color: '#7A7D83', fontSize: 11, flex: 1 }}>{sh.note}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: STATUS_DOT[sh.status] || '#5B5F66' }} />
              <span style={{ fontSize: 10, color: '#7A7D83' }}>{sh.status}</span>
            </span>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button onClick={e => { e.stopPropagation(); setEdit(sh); }} style={S0}><Ic n="Edit" sz={12} /></button>
              <button onClick={e => { e.stopPropagation(); onChange(shots.filter(s => s.id !== sh.id)); }} style={{ ...S0, color: '#D16B5C' }}><Ic n="Trash" sz={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {(showNew || edit) && (
        <ShotModal mob={mob} shot={edit} scenes={scenes}
          onClose={() => { setShowNew(false); setEdit(null); }}
          onSave={sh => { save(sh); setShowNew(false); setEdit(null); }}
          onDelete={id => { onChange(shots.filter(s => s.id !== id)); setEdit(null); }} />
      )}
    </div>
  );
}

function ShotModal({ shot, scenes, onClose, onSave, onDelete, mob }) {
  const [f, setF] = React.useState(shot || { id: '', sceneId: '', sceneNumber: '', shotType: 'WS', angle: 'normal', movement: 'statisch', lens: '50mm', note: '', status: 'Planned' });
  function pickScene(id) { const s = scenes.find(x => x.id === id); if (s) setF(p => ({ ...p, sceneId: s.id, sceneNumber: s.number })); }

  return (
    <Modal mob={mob} onClose={onClose}>
      <MHd title={shot ? 'SHOT BEARBEITEN' : 'NEUER SHOT'} onClose={onClose} />
      <Fld lbl="Szene">
        <select style={inp(mob)} value={f.sceneId} onChange={e => pickScene(e.target.value)}>
          <option value="">Szene waehlen...</option>
          {scenes.map(s => <option key={s.id} value={s.id}>Sz {s.number} - {s.heading.slice(0, 38)}</option>)}
        </select>
      </Fld>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld lbl="Typ"><select style={inp(mob)} value={f.shotType} onChange={e => setF({ ...f, shotType: e.target.value })}>{SHOT_T.map(t => <option key={t}>{t}</option>)}</select></Fld>
        <Fld lbl="Status"><select style={inp(mob)} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>{['Planned', 'In Progress', 'Fertig'].map(s => <option key={s}>{s}</option>)}</select></Fld>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Fld lbl="Winkel"><input style={inp(mob)} value={f.angle} onChange={e => setF({ ...f, angle: e.target.value })} placeholder="normal" /></Fld>
        <Fld lbl="Bewegung"><input style={inp(mob)} value={f.movement} onChange={e => setF({ ...f, movement: e.target.value })} placeholder="statisch" /></Fld>
        <Fld lbl="Linse"><input style={inp(mob)} value={f.lens} onChange={e => setF({ ...f, lens: e.target.value })} placeholder="50mm" /></Fld>
      </div>
      <Fld lbl="Notiz"><input style={inp(mob)} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></Fld>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8 }}>
        {shot ? <button onClick={() => { onDelete(shot.id); onClose(); }} style={{ ...gh(mob), color: '#D16B5C', borderColor: '#3a2622' }}>Loeschen</button> : <span />}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={gh(mob)}>Abbrechen</button>
          <button onClick={() => { if (!f.sceneId) { alert('Szene waehlen.'); return; } onSave({ ...f, id: shot ? shot.id : 'sh' + Date.now() }); }} style={pr(mob)}>{shot ? 'Speichern' : 'Anlegen'}</button>
        </div>
      </div>
    </Modal>
  );
}
