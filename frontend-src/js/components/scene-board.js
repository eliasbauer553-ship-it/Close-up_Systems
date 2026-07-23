// js/components/scene-board.js
// Szenenkarte, Szenen-Bearbeitungsdialog, Kanban-Board-Ansicht und Kalender-Ansicht.

function ScCard({ scene, onClick, takes, dnd, mob, showTakes, locationsAll, equipmentAll }) {
  const unitColor = UC[scene.unit] || '#5B5F66';
  const sceneTakes = showTakes ? (takes || []).filter(t => t.sceneId === scene.id) : [];
  const done = sceneTakes.filter(t => t.status === 'Fertig').length;
  const linkedLocation = scene.locationId ? (locationsAll || []).find(l => l.id === scene.locationId) : null;
  const linkedEquipCount = (scene.equipmentIds || []).length;

  return (
    <div {...dnd.drag(scene)} onClick={() => onClick(scene)} style={{
      ...dnd.drag(scene).style, background: '#161719', border: '1px solid #2A2C30', borderLeft: '3px solid ' + unitColor,
      borderRadius: 9, padding: mob ? '13px' : '11px 12px', marginBottom: 9, color: '#E7E6E2',
      transition: 'border-color .12s,background .12s',
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#454850'; e.currentTarget.style.background = '#1A1B1E'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2C30'; e.currentTarget.style.background = '#161719'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: unitColor, fontWeight: 700, letterSpacing: .5 }}>SZ {scene.number}</span>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {showTakes && sceneTakes.length > 0 && <span style={{ fontSize: 9.5, color: '#7A7D83' }}><Ic n="Vid" sz={9} cl="#7A7D83" st={{ marginRight: 2 }} />{done}/{sceneTakes.length}</span>}
          <span style={{ fontSize: 10, color: '#5B5F66' }}>T{scene.day}&bull;{scene.unit}</span>
        </div>
      </div>
      <div style={{ fontSize: mob ? 13 : 12.5, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{scene.heading}</div>
      <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: '#9A9DA3', marginBottom: 3, flexWrap: 'wrap' }}>
        <span><Ic n="Layers" sz={10} st={{ marginRight: 2 }} />{scene.pages}S.</span>
        <span><Ic n="Clock" sz={10} st={{ marginRight: 2 }} />{scene.duration}m</span>
        <span><Ic n="Users" sz={10} st={{ marginRight: 2 }} />{scene.cast.length}</span>
      </div>
      <div style={{ fontSize: 10.5, color: '#7A7D83', marginBottom: scene.tags.length ? 6 : 0 }}><Ic n="Map" sz={10} st={{ marginRight: 2 }} />{scene.location}</div>
      {scene.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 5 }}>
          {scene.tags.map(t => <span key={t} style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 99, background: '#1F2023', color: '#9A9DA3', border: '1px solid #2A2C30' }}>{t}</span>)}
        </div>
      )}
      {(linkedLocation || linkedEquipCount > 0) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'center' }}>
          {linkedLocation && (
            <span style={{ fontSize: 9.5, color: '#4FA3D1', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Ic n="Link" sz={9} cl="#4FA3D1" />{linkedLocation.name}
            </span>
          )}
          {linkedEquipCount > 0 && (
            <span style={{ fontSize: 9.5, color: '#8FBF7F', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Ic n="Wrench" sz={9} cl="#8FBF7F" />{linkedEquipCount}
            </span>
          )}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: SDOT[scene.status] }} />
        <span style={{ fontSize: 9.5, color: '#6A6D73' }}>{scene.status.toUpperCase()}</span>
      </div>
    </div>
  );
}

function SceneModal({ scene, onClose, onSave, onDelete, mob, castAll, locationsAll, equipmentAll }) {
  const [f, setF] = React.useState(scene || {
    number: '', heading: '', pages: 1, duration: 10, cast: [], location: '', unit: 'A', status: 'Planned', day: 1, tags: [],
    castIds: [], locationId: '', equipmentIds: [],
  });
  // Backwards-kompatibel: aeltere Szenen ohne die neuen Felder bekommen sie
  // beim Oeffnen des Editors ergaenzt, ohne bestehende Daten zu ueberschreiben.
  React.useEffect(() => {
    setF(p => ({ castIds: [], locationId: '', equipmentIds: [], ...p }));
  }, []);

  function toggleCastId(id) {
    setF(p => ({ ...p, castIds: (p.castIds || []).includes(id) ? p.castIds.filter(x => x !== id) : [...(p.castIds || []), id] }));
  }
  function toggleEquipmentId(id) {
    setF(p => ({ ...p, equipmentIds: (p.equipmentIds || []).includes(id) ? p.equipmentIds.filter(x => x !== id) : [...(p.equipmentIds || []), id] }));
  }
  function pickLocation(id) {
    const loc = (locationsAll || []).find(l => l.id === id);
    setF(p => ({ ...p, locationId: id, location: loc ? loc.name : p.location }));
  }

  return (
    <Modal mob={mob} onClose={onClose} wide>
      <MHd title={scene ? 'SZENE ' + scene.number : 'NEUE SZENE'} onClose={onClose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld lbl="Szenennummer"><input style={inp(mob)} value={f.number} onChange={e => setF({ ...f, number: e.target.value })} /></Fld>
        <Fld lbl="Drehtag"><input type="number" min={1} style={inp(mob)} value={f.day} onChange={e => setF({ ...f, day: +e.target.value })} /></Fld>
      </div>
      <Fld lbl="Ueberschrift"><input style={inp(mob)} placeholder="INT. ORT - TAG/NACHT" value={f.heading} onChange={e => setF({ ...f, heading: e.target.value.toUpperCase() })} /></Fld>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld lbl="Seiten"><input type="number" step=".125" style={inp(mob)} value={f.pages} onChange={e => setF({ ...f, pages: +e.target.value })} /></Fld>
        <Fld lbl="Dauer (Min)"><input type="number" style={inp(mob)} value={f.duration} onChange={e => setF({ ...f, duration: +e.target.value })} /></Fld>
      </div>
      <Fld lbl="Location (Freitext-Anzeige)"><input style={inp(mob)} value={f.location} onChange={e => setF({ ...f, location: e.target.value })} /></Fld>
      <Fld lbl="Cast (Freitext, Komma-getrennt)"><input style={inp(mob)} value={f.cast.join(', ')} onChange={e => setF({ ...f, cast: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></Fld>
      <Fld lbl="Tags (Komma-getrennt)"><input style={inp(mob)} value={f.tags.join(', ')} onChange={e => setF({ ...f, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></Fld>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld lbl="Unit"><select style={inp(mob)} value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })}>{Object.keys(UC).map(u => <option key={u} value={u}>Unit {u}</option>)}</select></Fld>
        <Fld lbl="Status"><select style={inp(mob)} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>{STATS.map(s => <option key={s}>{s}</option>)}</select></Fld>
      </div>

      <div style={{ height: 1, background: '#1E2023', margin: '16px 0 14px' }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: '#C9CBD0', letterSpacing: .5, marginBottom: 2 }}>
        <Ic n="Link" sz={12} cl="#E8A33D" st={{ marginRight: 5 }} />VERKNUEPFTE RESSOURCEN
      </div>
      <div style={{ fontSize: 10.5, color: '#7A7D83', marginBottom: 12, lineHeight: 1.5 }}>
        Diese Auswahl erscheint automatisch auch in den Listen Besetzung, Motive
        und Equipment -- so sieht man an einer Szene direkt, wer/was/wo gebraucht wird.
      </div>

      <Fld lbl="Motiv (aus Liste verknuepfen)">
        <select style={inp(mob)} value={f.locationId || ''} onChange={e => pickLocation(e.target.value)}>
          <option value="">Kein verknuepftes Motiv</option>
          {(locationsAll || []).map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
        </select>
      </Fld>

      <Fld lbl="Besetzung (aus Liste verknuepfen)">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(castAll || []).length === 0 && <span style={{ fontSize: 11, color: '#5B5F66' }}>Noch keine Besetzung angelegt</span>}
          {(castAll || []).map(c => (
            <button key={c.id} onClick={() => toggleCastId(c.id)} style={{
              fontSize: 10.5, padding: '4px 9px', borderRadius: 6, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace",
              border: '1px solid ' + ((f.castIds || []).includes(c.id) ? '#E8A33D' : '#2A2C30'),
              background: (f.castIds || []).includes(c.id) ? '#1A1710' : 'transparent',
              color: (f.castIds || []).includes(c.id) ? '#E8A33D' : '#8A8D93',
            }}>{c.name}</button>
          ))}
        </div>
      </Fld>

      <Fld lbl="Equipment (aus Liste verknuepfen)">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(equipmentAll || []).length === 0 && <span style={{ fontSize: 11, color: '#5B5F66' }}>Noch kein Equipment angelegt</span>}
          {(equipmentAll || []).map(e => (
            <button key={e.id} onClick={() => toggleEquipmentId(e.id)} style={{
              fontSize: 10.5, padding: '4px 9px', borderRadius: 6, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace",
              border: '1px solid ' + ((f.equipmentIds || []).includes(e.id) ? '#7FBF8F' : '#2A2C30'),
              background: (f.equipmentIds || []).includes(e.id) ? '#08180A' : 'transparent',
              color: (f.equipmentIds || []).includes(e.id) ? '#7FBF8F' : '#8A8D93',
            }}>{e.name}</button>
          ))}
        </div>
      </Fld>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8 }}>
        {scene ? <button onClick={() => { onDelete(scene.id); onClose(); }} style={{ ...gh(mob), color: '#D16B5C', borderColor: '#3a2622' }}>Loeschen</button> : <span />}
        <div style={{ display: 'flex', gap: 8 }}>
          {!mob && <button onClick={onClose} style={gh(mob)}>Abbrechen</button>}
          <button onClick={() => onSave({ ...f, id: scene ? scene.id : 's' + Date.now() })} style={pr(mob)}>{scene ? 'Speichern' : 'Anlegen'}</button>
        </div>
      </div>
    </Modal>
  );
}

function BoardView({ grouped, onClick, takes, dnd, mob, tab, showTakes, locationsAll, equipmentAll }) {
  if (mob) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs tabs={STATS.map(s => ({ id: s, lbl: s, dot: SDOT[s], cnt: (grouped[s] || []).length }))} active={tab.val} onChange={tab.set} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 90px' }}>
          {(grouped[tab.val] || []).map(s => <ScCard key={s.id} scene={s} onClick={onClick} takes={takes} dnd={dnd} mob={mob} showTakes={showTakes} locationsAll={locationsAll} equipmentAll={equipmentAll} />)}
          {!(grouped[tab.val] || []).length && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3F4147', fontSize: 13 }}>Keine Szenen</div>}
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,minmax(220px,1fr))', gap: 12, padding: 14, overflowX: 'auto', overflowY: 'auto', alignContent: 'start' }}>
      {STATS.map(st => (
        <div key={st} {...dnd.zone('sc-' + st)} style={{
          background: '#0E0F11', border: '1px solid #1E2023', borderRadius: 10, padding: 11,
          display: 'flex', flexDirection: 'column', minHeight: 160,
          ...(dnd.isOver('sc-' + st) ? { boxShadow: '0 0 0 2px #E8A33D' } : {}),
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11, flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: SDOT[st] }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, color: '#C9CBD0' }}>{st.toUpperCase()}</span>
            <span style={{ fontSize: 10, color: '#5B5F66', marginLeft: 'auto' }}>{(grouped[st] || []).length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {(grouped[st] || []).map(s => <ScCard key={s.id} scene={s} onClick={onClick} takes={takes} dnd={dnd} mob={mob} showTakes={showTakes} locationsAll={locationsAll} equipmentAll={equipmentAll} />)}
            {!(grouped[st] || []).length && <div style={{ fontSize: 11, color: '#3F4147', padding: '14px 6px', textAlign: 'center', border: '1px dashed #1E2023', borderRadius: 8 }}>Hierher ziehen</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalView({ scenes, takes, dnd, onClick, mob, showTakes, locationsAll, equipmentAll }) {
  const days = React.useMemo(() => {
    const d = new Set(scenes.map(s => s.day));
    const mx = d.size ? Math.max(...d) : 1;
    return Array.from({ length: Math.max(mx, 1) }, (_, i) => i + 1);
  }, [scenes]);
  const byDay = React.useMemo(() => {
    const g = {}; days.forEach(d => (g[d] = [])); scenes.forEach(s => { (g[s.day] || (g[s.day] = [])).push(s); }); return g;
  }, [scenes, days]);

  return (
    <div style={{
      flex: 1, display: 'grid',
      gridTemplateColumns: mob ? 'repeat(' + (days.length + 1) + ',min(85vw,300px))' : 'repeat(auto-fill,minmax(250px,1fr))',
      gap: 12, padding: mob ? '12px 14px 90px' : 14, overflowX: 'auto', overflowY: 'auto', alignContent: 'start',
    }}>
      {days.map(day => {
        const ds = byDay[day] || [];
        const pg = ds.reduce((a, s) => a + s.pages, 0);
        const mn = ds.reduce((a, s) => a + s.duration, 0);
        const units = [...new Set(ds.map(s => s.unit))];
        return (
          <div key={day} {...dnd.zone('cal-' + day)} style={{
            background: '#0E0F11', border: '1px solid #1E2023', borderRadius: 10, padding: 11,
            display: 'flex', flexDirection: 'column', minHeight: 100,
            ...(dnd.isOver('cal-' + day) ? { boxShadow: '0 0 0 2px #E8A33D' } : {}),
          }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 1.5, color: '#F2F1EC' }}>TAG {day}</span>
                <span style={{ fontSize: 10, color: '#5B5F66' }}>{ds.length}Sz</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 10.5, color: '#7A7D83', marginTop: 1, alignItems: 'center' }}>
                <span>{pg.toFixed(2)}S</span><span>{Math.floor(mn / 60)}h{mn % 60}m</span>
                <span style={{ display: 'flex', gap: 3 }}>{units.map(u => <span key={u} style={{ width: 6, height: 6, borderRadius: 99, background: UC[u] }} />)}</span>
              </div>
            </div>
            {ds.map(s => <ScCard key={s.id} scene={s} onClick={onClick} takes={takes} dnd={dnd} mob={mob} showTakes={showTakes} locationsAll={locationsAll} equipmentAll={equipmentAll} />)}
            {!ds.length && <div style={{ fontSize: 11, color: '#3F4147', padding: '12px 6px', textAlign: 'center', border: '1px dashed #1E2023', borderRadius: 8 }}>Leer</div>}
          </div>
        );
      })}
      <div {...dnd.zone('cal-new')} style={{
        minWidth: 50, minHeight: 100, background: 'transparent', border: '1px dashed #2A2C30', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#5B5F66',
        ...(dnd.isOver('cal-new') ? { boxShadow: '0 0 0 2px #E8A33D' } : {}),
      }}>+</div>
    </div>
  );
}
