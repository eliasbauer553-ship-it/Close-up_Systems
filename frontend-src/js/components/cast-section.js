// js/components/cast-section.js
// Besetzungsverwaltung: Name, Rolle, Alter, Kontakt, Notizen, Szenen-Zuordnung.

function CastSection({ cast, onChange, scenes, mob }) {
  const [edit, setEdit] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  const [showDood, setShowDood] = React.useState(false);
  function save(c) { onChange(cast.some(x => x.id === c.id) ? cast.map(x => x.id === c.id ? c : x) : [...cast, c]); }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid #1E2023', padding: mob ? '9px 14px' : '9px 18px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: 2, color: '#F2F1EC', marginRight: 'auto' }}>BESETZUNG</div>
        <button onClick={() => setShowDood(true)} style={{ ...gh(mob), padding: '7px 11px', fontSize: 11 }}><Ic n="Cal" sz={13} />Day-Out-of-Days</button>
        <button onClick={() => setShowNew(true)} style={{ ...pr(mob), padding: '7px 12px', fontSize: 11 }}><Ic n="Plus" sz={13} cl="#15120A" />Person</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '12px 14px 90px' : '14px 18px' }}>
        {cast.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3F4147', fontSize: 13 }}>Keine Besetzung</div>}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
          {cast.map(c => (
            <div key={c.id} style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#E8A33D22', border: '1px solid #E8A33D44', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ic n="Users" sz={18} cl="#E8A33D" />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setEdit(c)} style={S0}><Ic n="Edit" sz={13} /></button>
                  <button onClick={() => onChange(cast.filter(x => x.id !== c.id))} style={{ ...S0, color: '#D16B5C' }}><Ic n="Trash" sz={13} /></button>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F2F1EC', marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: '#E8A33D', marginBottom: 4 }}>{c.role}</div>
              {c.age && <div style={{ fontSize: 10.5, color: '#7A7D83', marginBottom: 3 }}>Alter: {c.age}</div>}
              {c.notes && <div style={{ fontSize: 11, color: '#9A9DA3', marginBottom: 6, fontStyle: 'italic' }}>{c.notes}</div>}
              {c.contact && <div style={{ fontSize: 10.5, color: '#5B5F66' }}>{c.contact}</div>}
              {c.scenes?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {c.scenes.map(sid => {
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
        <CastModal mob={mob} person={edit} scenes={scenes}
          onClose={() => { setShowNew(false); setEdit(null); }}
          onSave={c => { save(c); setShowNew(false); setEdit(null); }}
          onDelete={id => { onChange(cast.filter(x => x.id !== id)); setEdit(null); }} />
      )}
      {showDood && <DoodReport cast={cast} scenes={scenes} onClose={() => setShowDood(false)} mob={mob} />}
    </div>
  );
}

function CastModal({ person, scenes, onClose, onSave, onDelete, mob }) {
  const [f, setF] = React.useState(person || { id: '', name: '', role: '', age: '', notes: '', contact: '', scenes: [] });
  return (
    <Modal mob={mob} onClose={onClose}>
      <MHd title={person ? 'PERSON BEARBEITEN' : 'NEUE PERSON'} onClose={onClose} />
      <Fld lbl="Name"><input style={inp(mob)} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Vorname Nachname" /></Fld>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld lbl="Rolle"><input style={inp(mob)} value={f.role} onChange={e => setF({ ...f, role: e.target.value })} placeholder="Hauptrolle" /></Fld>
        <Fld lbl="Alter"><input style={inp(mob)} value={f.age} onChange={e => setF({ ...f, age: e.target.value })} placeholder="35" /></Fld>
      </div>
      <Fld lbl="Kontakt"><input style={inp(mob)} value={f.contact} onChange={e => setF({ ...f, contact: e.target.value })} placeholder="Email / Telefon" /></Fld>
      <Fld lbl="Notizen"><textarea style={{ ...inp(mob), minHeight: 60, resize: 'vertical' }} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></Fld>
      <Fld lbl="Szenen (Mehrfachauswahl)">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {scenes.map(s => (
            <button key={s.id} onClick={() => setF(p => ({ ...p, scenes: p.scenes.includes(s.id) ? p.scenes.filter(x => x !== s.id) : [...p.scenes, s.id] }))} style={{
              fontSize: 10.5, padding: '4px 9px', borderRadius: 6, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace",
              border: '1px solid ' + (f.scenes.includes(s.id) ? '#E8A33D' : '#2A2C30'),
              background: f.scenes.includes(s.id) ? '#1A1710' : 'transparent',
              color: f.scenes.includes(s.id) ? '#E8A33D' : '#8A8D93',
            }}>Sz {s.number}</button>
          ))}
        </div>
      </Fld>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8 }}>
        {person ? <button onClick={() => { onDelete(person.id); onClose(); }} style={{ ...gh(mob), color: '#D16B5C', borderColor: '#3a2622' }}>Loeschen</button> : <span />}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={gh(mob)}>Abbrechen</button>
          <button onClick={() => { if (!f.name.trim()) { alert('Name eingeben.'); return; } onSave({ ...f, id: person ? person.id : 'c' + Date.now() }); }} style={pr(mob)}>{person ? 'Speichern' : 'Anlegen'}</button>
        </div>
      </div>
    </Modal>
  );
}
