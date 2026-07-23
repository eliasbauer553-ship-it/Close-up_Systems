// js/components/navigation.js
// Navigation: Sidebar (Desktop), BottomNav (Mobile), Board-Header mit Filtern.

function Sidebar({ sec, setSec, syncOnline, cloudEnabled, onRefresh, refreshing, pd, proj, projs, onNote, onProj, onSet }) {
  const NAV = [
    { id: 'board', ic: 'Grid', lbl: 'Production Board', cnt: pd.scenes?.length },
    { id: 'calendar', ic: 'Cal', lbl: 'Kalender' },
    { id: 'scripts', ic: 'Book', lbl: 'Drehbuecher', cnt: pd.scripts?.length },
    { id: 'takes', ic: 'Vid', lbl: 'Takes', cnt: pd.takes?.length, live: (pd.takes || []).filter(t => t.status === 'Klappe').length },
    { id: 'shots', ic: 'Cam', lbl: 'Shot List', cnt: pd.shots?.length },
    { id: 'cast', ic: 'Users', lbl: 'Besetzung', cnt: pd.cast?.length },
    { id: 'locations', ic: 'Map', lbl: 'Motive', cnt: pd.locations?.length },
    { id: 'equipment', ic: 'Wrench', lbl: 'Equipment', cnt: pd.equipment?.length },
    { id: 'budget', ic: 'Dollar', lbl: 'Budget', cnt: pd.budget?.length },
  ];
  return (
    <div style={{ width: 210, background: '#0E0F11', borderRight: '1px solid #1E2023', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #1E2023' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Ic n="Clap" sz={17} cl="#E8A33D" />
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 1.5, color: '#F2F1EC', lineHeight: 1 }}>CLOSE-UP</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 1.5, color: '#E8A33D', lineHeight: 1 }}>SYSTEMS</div>
          </div>
        </div>
        <button onClick={onProj} style={{ width: '100%', background: '#161719', border: '1px solid #2A2C30', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#454850'} onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2C30'}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: (proj?.color || '#E8A33D') + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: 99, background: proj?.color || '#E8A33D' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#F2F1EC', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: "'IBM Plex Mono',monospace" }}>{proj?.name || 'Projekt'}</div>
            <div style={{ fontSize: 9, color: '#5B5F66', fontFamily: "'IBM Plex Mono',monospace" }}>{projs.length} Projekt{projs.length === 1 ? '' : 'e'}</div>
          </div>
          <Ic n="CD" sz={11} cl="#5B5F66" />
        </button>
      </div>
      <div style={{ flex: 1, padding: '8px 7px', overflowY: 'auto' }}>
        {NAV.map(it => (
          <button key={it.id} onClick={() => setSec(it.id)} style={{
            width: '100%', border: 'none', borderRadius: 8, padding: '9px 10px', marginBottom: 2, cursor: 'pointer',
            background: sec === it.id ? '#1A1B1E' : 'transparent', display: 'flex', alignItems: 'center', gap: 9, transition: 'background .1s',
          }}>
            <Ic n={it.ic} sz={15} cl={sec === it.id ? '#E8A33D' : '#8A8D93'} />
            <span style={{ fontSize: 11.5, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: sec === it.id ? '#F2F1EC' : '#8A8D93', flex: 1, textAlign: 'left' }}>{it.lbl}</span>
            {it.cnt > 0 && <span style={{ fontSize: 10, background: sec === it.id ? '#2A2C30' : '#1A1B1E', color: '#7A7D83', borderRadius: 99, padding: '1px 6px' }}>{it.cnt}</span>}
            {it.live > 0 && <span style={{ fontSize: 9, background: '#E8A33D', color: '#15120A', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>LIVE</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 7px', borderTop: '1px solid #1E2023' }}>
        {[{ lbl: 'Haftnotiz', ic: 'Sticky', fn: onNote }, { lbl: 'Einstellungen', ic: 'Gear', fn: onSet }].map(b => (
          <button key={b.lbl} onClick={b.fn} style={{
            width: '100%', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', background: 'transparent',
            display: 'flex', alignItems: 'center', gap: 8, color: '#8A8D93', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, transition: 'background .1s',
          }} onMouseEnter={e => e.currentTarget.style.background = '#1A1B1E'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Ic n={b.ic} sz={13} cl="#8A8D93" />{b.lbl}
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 9.5, color: syncOnline ? '#7FBF8F' : '#5B5F66', fontFamily: "'IBM Plex Mono',monospace" }}>
          <Ic n={syncOnline ? 'Sync' : 'NoWifi'} sz={10} cl={syncOnline ? '#7FBF8F' : '#5B5F66'} />
          {syncOnline ? 'Echtzeit-Sync aktiv' : 'Lokal gespeichert'}
        </div>
        {cloudEnabled && (
          <button onClick={onRefresh} disabled={refreshing} style={{
            width: '100%', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: refreshing ? 'default' : 'pointer',
            background: 'transparent', display: 'flex', alignItems: 'center', gap: 8, color: '#8A8D93',
            fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, opacity: refreshing ? .6 : 1,
          }} onMouseEnter={e => !refreshing && (e.currentTarget.style.background = '#1A1B1E')} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Ic n="Ref" sz={12} cl="#8A8D93" st={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
            {refreshing ? 'Aktualisiere...' : 'Jetzt aktualisieren'}
          </button>
        )}
      </div>
    </div>
  );
}

function BottomNav({ sec, setSec, onNew, takes, onSet }) {
  const live = (takes || []).filter(t => t.status === 'Klappe').length;
  const tabs = [
    { id: 'board', ic: 'Grid', lbl: 'Board' },
    { id: 'scripts', ic: 'Book', lbl: 'Skript' },
    { id: 'new', ic: 'Plus', accent: true, fn: onNew },
    { id: 'takes', ic: 'Vid', lbl: 'Takes', badge: live },
    { id: 'more', ic: 'Gear', lbl: 'Mehr', fn: onSet },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90, background: 'rgba(14,15,17,.97)',
      borderTop: '1px solid #1E2023', display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom,0px)', backdropFilter: 'blur(12px)',
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={t.fn || (() => setSec(t.id))} style={{
          flex: 1, border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 4px', cursor: 'pointer',
          color: (!t.fn && sec === t.id) ? '#F2F1EC' : '#5B5F66', minHeight: 56, position: 'relative',
        }}>
          {t.accent ? (
            <div style={{ width: 42, height: 42, borderRadius: 99, background: '#E8A33D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(232,163,61,.35)' }}>
              <Ic n={t.ic} sz={20} cl="#15120A" />
            </div>
          ) : <Ic n={t.ic} sz={20} cl={sec === t.id ? '#F2F1EC' : '#5B5F66'} />}
          {!t.accent && <span style={{ fontSize: 9.5, fontFamily: "'IBM Plex Mono',monospace" }}>{t.lbl}</span>}
          {t.badge > 0 && <span style={{ position: 'absolute', top: 6, right: '50%', transform: 'translateX(8px)', background: '#E8A33D', color: '#15120A', borderRadius: 99, fontSize: 8, fontWeight: 700, padding: '1px 5px' }}>{t.badge}</span>}
        </button>
      ))}
    </nav>
  );
}

function BoardHeader({ filtered, grouped, view, setView, unitFilter, setUnitFilter, search, setSearch, showSearch, setShowSearch, onImport, onExport, onNew, onNote, mob }) {
  const totalPages = filtered.reduce((a, s) => a + s.pages, 0);
  const totalMin = filtered.reduce((a, s) => a + s.duration, 0);
  return (
    <div style={{ borderBottom: '1px solid #1E2023', flexShrink: 0 }}>
      <div style={{ padding: mob ? '9px 14px' : '9px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, color: '#E8A33D', marginRight: 'auto' }}>BOARD</div>
        <div style={{ display: 'flex', gap: 3, background: '#161719', border: '1px solid #2A2C30', borderRadius: 7, padding: 2 }}>
          {[{ id: 'board', ic: 'Grid' }, { id: 'calendar', ic: 'Cal' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{ border: 'none', borderRadius: 5, padding: '5px 9px', cursor: 'pointer', background: view === v.id ? '#2A2C30' : 'transparent', display: 'flex' }}>
              <Ic n={v.ic} sz={14} cl={view === v.id ? '#F2F1EC' : '#8A8D93'} />
            </button>
          ))}
        </div>
        {!mob && <>
          <button onClick={onImport} style={{ ...gh(mob), padding: '6px 11px', fontSize: 11 }}><Ic n="Up" sz={13} />Import</button>
          <button onClick={onExport} style={{ ...gh(mob), padding: '6px 11px', fontSize: 11 }}><Ic n="Dn" sz={13} />Export</button>
          <button onClick={onNote} style={{ ...gh(mob), padding: '6px 10px', fontSize: 11 }}><Ic n="Sticky" sz={13} />Notiz</button>
          <button onClick={onNew} style={{ ...pr(mob), padding: '6px 13px', fontSize: 11 }}><Ic n="Plus" sz={13} cl="#15120A" />Neue Szene</button>
        </>}
        {mob && <>
          <button onClick={onNew} style={{ ...pr(mob), padding: '7px 10px' }}><Ic n="Plus" sz={16} cl="#15120A" /></button>
          <button onClick={() => setShowSearch(v => !v)} style={{ ...S0, border: '1px solid #2A2C30', borderRadius: 7, padding: 7, background: showSearch ? '#2A2C30' : 'transparent' }}>
            <Ic n="Search" sz={17} cl={showSearch ? '#F2F1EC' : '#8A8D93'} />
          </button>
        </>}
      </div>
      {mob && showSearch && <div style={{ padding: '0 14px 9px' }}><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Szene, Location, Cast..." style={inp(mob)} /></div>}
      <div style={{ display: 'flex', gap: 6, padding: mob ? '0 14px 9px' : '0 18px 9px', overflowX: 'auto', alignItems: 'center', flexWrap: 'nowrap' }}>
        {!mob && (
          <div style={{ position: 'relative' }}>
            <Ic n="Search" sz={12} cl="#5B5F66" st={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche..." style={{ ...inp(mob), width: 160, paddingLeft: 26, padding: '6px 10px 6px 26px' }} />
          </div>
        )}
        {['Alle', ...Object.keys(UC)].map(u => (
          <button key={u} onClick={() => setUnitFilter(u)} style={{
            border: '1px solid ' + (unitFilter === u ? '#E8A33D' : '#2A2C30'), borderRadius: mob ? 20 : 6, padding: '4px 10px', fontSize: 10.5,
            cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, whiteSpace: 'nowrap',
            background: unitFilter === u ? '#1A1710' : 'transparent', color: unitFilter === u ? '#E8A33D' : '#8A8D93',
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
          }}>
            {u !== 'Alle' && <span style={{ width: 6, height: 6, borderRadius: 99, background: UC[u] }} />}
            {u === 'Alle' ? 'Alle' : 'Unit ' + u}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '5px ' + (mob ? 14 : 18) + 'px', borderTop: '1px solid #1E2023', fontSize: 10.5, color: '#7A7D83', fontFamily: "'IBM Plex Mono',monospace", flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: '#9A9DA3' }}>{filtered.length} Szenen</span>
        <span>{totalPages.toFixed(2)} S.</span><span>{Math.floor(totalMin / 60)}h {totalMin % 60}min</span>
        {!mob && STATS.map(st => (
          <span key={st} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: SDOT[st] }} />{(grouped[st] || []).length} {st}
          </span>
        ))}
      </div>
    </div>
  );
}
