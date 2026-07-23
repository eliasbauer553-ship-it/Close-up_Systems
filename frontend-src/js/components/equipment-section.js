// js/components/equipment-section.js
// Equipmentverwaltung: Name, Kategorie, Besitzer/Verleiher, Notizen.
// Die Verknuepfung "wann/wo gebraucht" passiert im SceneModal (scene-board.js)
// -- dort waehlt man Equipment fuer eine Szene aus, was hier automatisch als
// "verwendet in Szene X" angezeigt wird (bidirektional gepflegt in app.js).

const EQUIPMENT_CATEGORIES = ['Kamera', 'Ton', 'Licht', 'Grip', 'Buehne', 'Fahrzeug', 'Sonstiges'];
const EQ_CAT_COLOR = {
  Kamera: '#E8A33D', Ton: '#4FA3D1', Licht: '#D1A34F', Grip: '#7FBF8F',
  Buehne: '#C97FBF', Fahrzeug: '#D16B5C', Sonstiges: '#8A8D93',
};

function EquipmentSection({ equipment, onChange, scenes, mob }) {
  const [edit, setEdit] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  const [catFilter, setCatFilter] = React.useState('Alle');

  function save(e) { onChange(equipment.some(x => x.id === e.id) ? equipment.map(x => x.id === e.id ? e : x) : [...equipment, e]); }

  const filtered = catFilter === 'Alle' ? equipment : equipment.filter(e => e.category === catFilter);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid #1E2023', padding: mob ? '9px 14px' : '9px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: 2, color: '#F2F1EC', marginRight: 'auto' }}>EQUIPMENT</div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inp(mob), width: 'auto', fontSize: 11, padding: '6px 10px' }}>
          <option value="Alle">Alle Kategorien</option>
          {EQUIPMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => setShowNew(true)} style={{ ...pr(mob), padding: '7px 12px', fontSize: 11 }}><Ic n="Plus" sz={13} cl="#15120A" />Equipment</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '12px 14px 90px' : '14px 18px' }}>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3F4147', fontSize: 13 }}>Kein Equipment erfasst</div>}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
          {filtered.map(e => {
            const col = EQ_CAT_COLOR[e.category] || '#8A8D93';
            const usedIn = scenes.filter(s => (e.scenes || []).includes(s.id));
            return (
              <div key={e.id} style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: col + '22', border: '1px solid ' + col + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Ic n="Wrench" sz={16} cl={col} />
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: col + '1A', color: col, fontWeight: 700 }}>{e.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setEdit(e)} style={S0}><Ic n="Edit" sz={13} /></button>
                    <button onClick={() => onChange(equipment.filter(x => x.id !== e.id))} style={{ ...S0, color: '#D16B5C' }}><Ic n="Trash" sz={13} /></button>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F2F1EC', marginBottom: 3 }}>{e.name}</div>
                {e.owner && <div style={{ fontSize: 10.5, color: '#7A7D83', marginBottom: 4 }}><Ic n="Tag" sz={10} st={{ marginRight: 3 }} />{e.owner}</div>}
                {e.notes && <div style={{ fontSize: 11, color: '#9A9DA3', marginBottom: 6, fontStyle: 'italic' }}>{e.notes}</div>}
                {usedIn.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 9.5, color: '#5B5F66', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 3 }}><Ic n="Link" sz={9} cl="#5B5F66" />Verwendet in:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {usedIn.map(s => <span key={s.id} style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 99, background: '#1A1B1E', color: '#9A9DA3', border: '1px solid #2A2C30' }}>Sz {s.number} &bull; T{s.day}</span>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {(showNew || edit) && (
        <EquipmentModal mob={mob} item={edit}
          onClose={() => { setShowNew(false); setEdit(null); }}
          onSave={e => { save(e); setShowNew(false); setEdit(null); }}
          onDelete={id => { onChange(equipment.filter(x => x.id !== id)); setEdit(null); }} />
      )}
    </div>
  );
}

function EquipmentModal({ item, onClose, onSave, onDelete, mob }) {
  const [f, setF] = React.useState(item || { id: '', name: '', category: 'Kamera', owner: '', notes: '', scenes: [] });
  return (
    <Modal mob={mob} onClose={onClose}>
      <MHd title={item ? 'EQUIPMENT BEARBEITEN' : 'NEUES EQUIPMENT'} sub="Zuordnung zu Szenen erfolgt beim Bearbeiten der jeweiligen Szene" onClose={onClose} />
      <Fld lbl="Bezeichnung"><input style={inp(mob)} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="z.B. RED Dragon 6K" /></Fld>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld lbl="Kategorie">
          <select style={inp(mob)} value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
            {EQUIPMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Fld>
        <Fld lbl="Gehoert / Verleiher"><input style={inp(mob)} value={f.owner} onChange={e => setF({ ...f, owner: e.target.value })} placeholder="Eigenbestand, Verleih XY, Privat: Name..." /></Fld>
      </div>
      <Fld lbl="Notizen"><textarea style={{ ...inp(mob), minHeight: 60, resize: 'vertical' }} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} placeholder="Zubehoer, Zustand, Seriennummer..." /></Fld>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8 }}>
        {item ? <button onClick={() => { onDelete(item.id); onClose(); }} style={{ ...gh(mob), color: '#D16B5C', borderColor: '#3a2622' }}>Loeschen</button> : <span />}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={gh(mob)}>Abbrechen</button>
          <button onClick={() => { if (!f.name.trim()) { alert('Bezeichnung eingeben.'); return; } onSave({ ...f, id: item ? item.id : 'eq' + Date.now() }); }} style={pr(mob)}>{item ? 'Speichern' : 'Anlegen'}</button>
        </div>
      </div>
    </Modal>
  );
}
