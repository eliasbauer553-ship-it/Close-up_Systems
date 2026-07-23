// js/components/locations-section.js
// Motivverwaltung: Name, Adresse, INT/EXT-Typ, Notizen, Szenen-Zuordnung.

function LocationsSection({ locations, onChange, scenes, mob }) {
  const [edit, setEdit] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  function save(l) { onChange(locations.some(x => x.id === l.id) ? locations.map(x => x.id === l.id ? l : x) : [...locations, l]); }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid #1E2023', padding: mob ? '9px 14px' : '9px 18px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: 2, color: '#F2F1EC', marginRight: 'auto' }}>MOTIVE</div>
        <button onClick={() => setShowNew(true)} style={{ ...pr(mob), padding: '7px 12px', fontSize: 11 }}><Ic n="Plus" sz={13} cl="#15120A" />Motiv</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '12px 14px 90px' : '14px 18px' }}>
        {locations.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3F4147', fontSize: 13 }}>Keine Motive</div>}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
          {locations.map(l => (
            <div key={l.id} style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#4FA3D122', border: '1px solid #4FA3D144', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ic n="Map" sz={16} cl="#4FA3D1" />
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: l.type === 'INT' ? '#221D00' : '#08180A', color: l.type === 'INT' ? '#E8A33D' : '#7FBF8F', fontWeight: 700 }}>{l.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setEdit(l)} style={S0}><Ic n="Edit" sz={13} /></button>
                  <button onClick={() => onChange(locations.filter(x => x.id !== l.id))} style={{ ...S0, color: '#D16B5C' }}><Ic n="Trash" sz={13} /></button>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F2F1EC', marginBottom: 3 }}>{l.name}</div>
              {l.address && <div style={{ fontSize: 10.5, color: '#7A7D83', marginBottom: 4 }}>{l.address}</div>}
              {l.notes && <div style={{ fontSize: 11, color: '#9A9DA3', marginBottom: 6, fontStyle: 'italic' }}>{l.notes}</div>}
              {l.scenes?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {l.scenes.map(sid => {
                    const sc = scenes.find(s => s.id === sid);
                    return sc ? <span key={sid} style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 99, background: '#1A1B1E', color: '#9A9DA3', border: '1px solid #2A2C30' }}>Sz {sc.number}</span> : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {(showNew || edit) && (
        <LocModal mob={mob} loc={edit} scenes={scenes}
          onClose={() => { setShowNew(false); setEdit(null); }}
          onSave={l => { save(l); setShowNew(false); setEdit(null); }}
          onDelete={id => { onChange(locations.filter(x => x.id !== id)); setEdit(null); }} />
      )}
    </div>
  );
}

function LocModal({ loc, scenes, onClose, onSave, onDelete, mob }) {
  const [f, setF] = React.useState(loc || { id: '', name: '', address: '', type: 'INT', notes: '', scenes: [] });
  return (
    <Modal mob={mob} onClose={onClose}>
      <MHd title={loc ? 'MOTIV BEARBEITEN' : 'NEUES MOTIV'} onClose={onClose} />
      <Fld lbl="Name"><input style={inp(mob)} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="z.B. Cafe Kaiser" /></Fld>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <Fld lbl="Adresse"><input style={inp(mob)} value={f.address} onChange={e => setF({ ...f, address: e.target.value })} placeholder="Strasse, Stadt" /></Fld>
        <Fld lbl="Typ">
          <select style={inp(mob)} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
            <option value="INT">INT</option><option value="EXT">EXT</option><option value="INT/EXT">INT/EXT</option>
          </select>
        </Fld>
      </div>
      <Fld lbl="Notizen"><textarea style={{ ...inp(mob), minHeight: 60, resize: 'vertical' }} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></Fld>
      <Fld lbl="Szenen">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {scenes.map(s => (
            <button key={s.id} onClick={() => setF(p => ({ ...p, scenes: p.scenes.includes(s.id) ? p.scenes.filter(x => x !== s.id) : [...p.scenes, s.id] }))} style={{
              fontSize: 10.5, padding: '4px 9px', borderRadius: 6, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace",
              border: '1px solid ' + (f.scenes.includes(s.id) ? '#4FA3D1' : '#2A2C30'),
              background: f.scenes.includes(s.id) ? '#080F1E' : 'transparent',
              color: f.scenes.includes(s.id) ? '#4FA3D1' : '#8A8D93',
            }}>Sz {s.number}</button>
          ))}
        </div>
      </Fld>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8 }}>
        {loc ? <button onClick={() => { onDelete(loc.id); onClose(); }} style={{ ...gh(mob), color: '#D16B5C', borderColor: '#3a2622' }}>Loeschen</button> : <span />}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={gh(mob)}>Abbrechen</button>
          <button onClick={() => { if (!f.name.trim()) { alert('Name eingeben.'); return; } onSave({ ...f, id: loc ? loc.id : 'l' + Date.now() }); }} style={pr(mob)}>{loc ? 'Speichern' : 'Anlegen'}</button>
        </div>
      </div>
    </Modal>
  );
}
