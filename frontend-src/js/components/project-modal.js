// js/components/project-modal.js
// Multi-Projekt-Verwaltung: anlegen, umbenennen, loeschen, wechseln.
// Jedes Projekt hat vollstaendig isolierte Daten (Szenen, Skripte, Takes, ...).

function ProjectModal({ projects, data, activeId, onSwitch, onCreate, onDelete, onRename, onClose, mob }) {
  const [showNew, setShowNew] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState('#E8A33D');
  const [newDesc, setNewDesc] = React.useState('');
  const [renameId, setRenameId] = React.useState(null);
  const [renameVal, setRenameVal] = React.useState('');

  function create() {
    if (!newName.trim()) return;
    onCreate('p' + Date.now(), newName.trim(), newColor, newDesc.trim());
    setShowNew(false); setNewName(''); setNewDesc('');
  }

  return (
    <Modal mob={mob} onClose={onClose} wide>
      <MHd title="PROJEKTE" sub="Jedes Projekt hat eigene Szenen, Drehbuecher, Takes und mehr" onClose={onClose} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {projects.map(p => {
          const pd = data[p.id];
          const active = p.id === activeId;
          return (
            <div key={p.id} style={{
              background: active ? '#1A1710' : '#161719', border: '1px solid ' + (active ? p.color : '#2A2C30'),
              borderRadius: 9, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: p.color + '22', border: '1px solid ' + p.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic n="Folder" sz={15} cl={p.color} />
              </div>
              {renameId === p.id ? (
                <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                  <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { onRename(p.id, renameVal); setRenameId(null); } }}
                    style={{ ...inp(mob), flex: 1, padding: '6px 8px', fontSize: 12 }} />
                  <button onClick={() => { onRename(p.id, renameVal); setRenameId(null); }} style={{ ...pr(mob), padding: '6px 10px', fontSize: 11 }}>OK</button>
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: active ? p.color : '#F2F1EC' }}>{p.name}</div>
                  {p.desc && <div style={{ fontSize: 10.5, color: '#7A7D83', marginTop: 1 }}>{p.desc}</div>}
                  <div style={{ fontSize: 10, color: '#5B5F66', marginTop: 2 }}>{pd?.scenes?.length || 0}Sz - {pd?.scripts?.length || 0}Sk - {pd?.takes?.length || 0}T</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {!active && <button onClick={() => { onSwitch(p.id); onClose(); }} style={{ ...pr(mob), padding: '6px 11px', fontSize: 11 }}>Oeffnen</button>}
                {active && <span style={{ fontSize: 10, color: p.color, fontWeight: 700, padding: '6px 8px' }}>AKTIV</span>}
                <button onClick={() => { setRenameId(p.id); setRenameVal(p.name); }} style={{ ...gh(mob), padding: '6px 8px' }}><Ic n="Edit" sz={12} /></button>
                {projects.length > 1 && (
                  <button onClick={() => { if (confirm('"' + p.name + '" loeschen?')) onDelete(p.id); }} style={{ ...S0, color: '#D16B5C' }}><Ic n="Trash" sz={12} /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showNew ? (
        <div style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 9, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#C9CBD0', marginBottom: 12, letterSpacing: .5 }}>NEUES PROJEKT</div>
          <Fld lbl="Name"><input autoFocus style={inp(mob)} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Mein Film 2025" /></Fld>
          <Fld lbl="Beschreibung"><input style={inp(mob)} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Optional" /></Fld>
          <Fld lbl="Farbe" mt={4}><ColPick value={newColor} onChange={setNewColor} /></Fld>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => setShowNew(false)} style={{ ...gh(mob), flex: 1, justifyContent: 'center' }}>Abbrechen</button>
            <button onClick={create} disabled={!newName.trim()} style={{ ...pr(mob), flex: 2, justifyContent: 'center', opacity: newName.trim() ? 1 : .4 }}>
              <Ic n="Plus" sz={13} cl="#15120A" />Anlegen
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNew(true)} style={{ ...gh(mob), width: '100%', justifyContent: 'center', padding: '11px' }}>
          <Ic n="Plus" sz={14} />Neues Projekt
        </button>
      )}
    </Modal>
  );
}
