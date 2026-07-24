// js/app.js
// App-Root: verwaltet den globalen State, entscheidet zwischen lokalem
// Speicher und Cloudflare-D1-Sync, und rendert die aktive Sektion.

// Desktop-Version: immer der Desktop-Modus mit linker Seitenleiste --
// der mobile Modus mit unterer Menueleiste ist hier bewusst deaktiviert,
// da diese Datei die eigenstaendige Desktop-App ist (Fenster hat ohnehin
// eine Mindestbreite von 980px, siehe tauri.conf.json -> minWidth).
function useBreakpoint() {
  return { mob: false, tab: false, desk: true };
}

function App() {
  const bp = useBreakpoint();
  const { mob, desk } = bp;

  const [state, setState] = React.useState(() => {
    const saved = loadLocalState();
    if (!saved) return DEFAULT_STATE;
    // Aeltere gespeicherte Staende (vor Cloud-Sync/KI-Defaults) hatten
    // config.apiKey/aiModel fest als leeren String gespeichert. Ein simples
    // {...DEFAULT, ...saved} wuerde das NICHT reparieren (leerer String ist
    // ja ein "vorhandener" Wert). Das war die eigentliche Ursache fuer
    // "Missing Authentication header": der alte, leere Key wurde immer
    // weiter verwendet, nie der neue Default. Deshalb hier gezielt nur die
    // Felder auffuellen, die frueher leer/undefiniert waren -- alle anderen,
    // bewusst vom Nutzer gesetzten Werte (z.B. syncMode:'local') bleiben
    // unangetastet.
    const savedCfg = saved.config || {};
    const mergedCfg = {
      ...DEFAULT_STATE.config,
      ...savedCfg,
      apiKey: savedCfg.apiKey || DEFAULT_STATE.config.apiKey,
      aiModel: savedCfg.aiModel || DEFAULT_STATE.config.aiModel,
      aiProvider: savedCfg.aiProvider || DEFAULT_STATE.config.aiProvider,
    };
    return { ...saved, config: mergedCfg };
  });
  React.useEffect(() => { saveLocalState(state); }, [state]);

  const cfg = state.config || DEFAULT_STATE.config;
  // syncMode:'cloud' reicht aus -- SyncClient/useLiveSync fallen bei leerer
  // workerUrl automatisch auf die aktuelle Domain zurueck, daher ist
  // Cloud-Sync direkt nach dem Deploy aktiv ohne manuelle Eingabe.
  const cloudEnabled = cfg.syncMode === 'cloud';
  const sync = useSyncClient(cfg.workerUrl);

  // Eingehende Echtzeit-Nachrichten von ANDEREN Geraeten sofort in den
  // lokalen State uebernehmen -- das ist der Kern von "echtem" Sync statt
  // Nachfragen: kein Request noetig, die Aenderung kommt von selbst an.
  const handleLiveMessage = React.useCallback((msg) => {
    setState(prev => {
      switch (msg.type) {
        case 'category': {
          const proj = prev.data[msg.projectId];
          if (!proj) return prev; // Projekt lokal (noch) unbekannt -- wird beim naechsten Full-Pull ergaenzt
          return { ...prev, data: { ...prev.data, [msg.projectId]: { ...proj, [msg.category]: msg.items || [] } } };
        }
        case 'project-created': {
          if (prev.projects.some(p => p.id === msg.project.id)) return prev;
          return {
            ...prev,
            projects: [...prev.projects, msg.project],
            data: { ...prev.data, [msg.project.id]: makeEmptyProject(msg.project.id, msg.project.name, msg.project.color, msg.project.desc) },
          };
        }
        case 'project-renamed':
          return { ...prev, projects: prev.projects.map(p => p.id === msg.projectId ? { ...p, name: msg.name } : p) };
        case 'project-deleted': {
          if (!prev.projects.some(p => p.id === msg.projectId)) return prev;
          const remaining = prev.projects.filter(p => p.id !== msg.projectId);
          const d = { ...prev.data }; delete d[msg.projectId];
          return {
            ...prev, projects: remaining, data: d,
            activeProjectId: msg.projectId === prev.activeProjectId ? (remaining[0]?.id || prev.activeProjectId) : prev.activeProjectId,
          };
        }
        default:
          return prev;
      }
    });
  }, []);

  const live = useLiveSync(cloudEnabled, cfg.workerUrl, handleLiveMessage);
  const syncOnline = live.connected;

  const activeId = state.activeProjectId;
  const projects = state.projects;
  const pd = state.data[activeId] || makeEmptyProject(activeId, 'Projekt', '#E8A33D');
  const proj = projects.find(p => p.id === activeId);

  const [refreshing, setRefreshing] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState(null);

  // Laedt den VOLLSTAENDIGEN Stand aus D1 (alle Projekte samt komplettem
  // Inhalt, nicht nur das aktive Projekt) und fuehrt ihn mit dem lokalen
  // State zusammen. Lokale Projekte, die der Server noch nicht kennt,
  // werden hochgeladen. Wird automatisch beim Verbinden aufgerufen UND
  // manuell ueber den Aktualisieren-Button (Sidebar/Einstellungen) --
  // z.B. falls die Echtzeit-Verbindung kurz weg war und man auf Nummer
  // sicher gehen will, dass wirklich der neueste Stand geladen ist.
  const refreshFromServer = React.useCallback(async () => {
    if (!cloudEnabled || !sync.enabled) return false;
    setRefreshing(true);
    try {
      const remote = await sync.getFullState();
      const remoteIds = new Set(remote.projects.map(p => p.id));
      let localSnapshot = null;

      setState(prev => {
        localSnapshot = prev;
        const mergedProjects = [...remote.projects];
        const mergedData = { ...remote.data };
        // Lokale Projekte, die der Server noch nicht kennt, behalten
        // (werden gleich per createProject/replaceCategory hochgeladen).
        for (const p of prev.projects) {
          if (!remoteIds.has(p.id)) {
            mergedProjects.push(p);
            mergedData[p.id] = prev.data[p.id];
          }
        }
        return { ...prev, projects: mergedProjects, data: mergedData };
      });

      // Lokale, dem Server unbekannte Projekte hochladen
      if (localSnapshot) {
        for (const p of localSnapshot.projects) {
          if (remoteIds.has(p.id)) continue;
          await sync.createProject(p).catch(() => {});
          const localData = localSnapshot.data[p.id];
          if (!localData) continue;
          for (const cat of ['scenes', 'takes', 'scripts', 'shots', 'notes', 'cast', 'locations', 'budget', 'equipment']) {
            const items = localData[cat] || [];
            if (items.length) await sync.replaceCategory(p.id, cat, items).catch(() => {});
          }
        }
      }
      setLastRefresh(Date.now());
      return true;
    } catch (e) {
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [cloudEnabled, sync]);

  // Automatisch beim (Wieder-)Verbinden ausfuehren
  React.useEffect(() => {
    if (!cloudEnabled || !syncOnline) return;
    refreshFromServer();
    // Nur beim Wechsel des Verbindungsstatus, nicht bei jeder lokalen Aenderung
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudEnabled, syncOnline]);


  function updateProjectData(fn) {
    setState(prev => {
      const updated = { ...prev.data, [activeId]: fn(prev.data[activeId] || pd) };
      return { ...prev, data: updated };
    });
  }

  // Kategorie-Setter: aktualisieren lokalen State sofort UND schicken die
  // Aenderung per WebSocket an die SyncRoom -- die leitet sie in Echtzeit an
  // alle anderen verbundenen Geraete weiter (und persistiert sie in D1).
  // Ist die WebSocket-Verbindung gerade weg, greift automatisch der
  // REST-Fallback (wird beim naechsten Full-Pull ohnehin abgeglichen).
  function makeCategorySetter(category) {
    return (value) => {
      updateProjectData(p => {
        const next = typeof value === 'function' ? value(p[category]) : value;
        if (cloudEnabled) {
          const msg = { type: 'category', projectId: activeId, category, items: next };
          const sentLive = live.send(msg);
          if (!sentLive) sync.replaceCategory(activeId, category, next).catch(() => {});
        }
        return { ...p, [category]: next };
      });
    };
  }
  const setScenes = makeCategorySetter('scenes');
  const setTakes = makeCategorySetter('takes');
  const setScripts = makeCategorySetter('scripts');
  const setShots = makeCategorySetter('shots');
  const setNotes = makeCategorySetter('notes');
  const setCast = makeCategorySetter('cast');
  const setLocations = makeCategorySetter('locations');
  const setBudget = makeCategorySetter('budget');
  const setEquipment = makeCategorySetter('equipment');

  // Handler fuer die KI-Werkzeuge (siehe ai-tools-panel.js):
  function applyAiFormat(scriptId, formattedText) {
    setScripts(p => p.map(s => s.id === scriptId ? { ...s, content: formattedText, pages: Math.round(formattedText.split('\n').length / 55 * 10) / 10 } : s));
  }
  function applyAiBreakdown(result) {
    const cats = new Set(['Kamera', 'Ton', 'Licht', 'Grip', 'Buehne', 'Fahrzeug', 'Sonstiges']);
    const items = (result.equipment || []).map((e, i) => ({
      id: 'eqai' + Date.now() + i, name: e.name, category: cats.has(e.category) ? e.category : 'Sonstiges',
      owner: '', notes: e.reason || 'KI-Vorschlag aus Script-Breakdown', scenes: [],
    }));
    if (items.length) setEquipment(p => [...p, ...items]);
  }
  function applyAiBudget(result) {
    const items = (result.items || []).map((b, i) => ({
      id: 'bai' + Date.now() + i, category: b.category || 'Sonstiges', item: b.item, amount: +b.amount || 0, paid: false, notes: b.notes || 'KI-Schaetzung',
    }));
    if (items.length) setBudget(p => [...p, ...items]);
  }

  // Zielbudget ist ein einzelner Projekt-Wert (keine Liste) -- wird lokal
  // gehalten, nicht ueber die Kategorie-API synchronisiert. Fuer echte
  // Cross-Device-Synchronisierung dieses Werts muesste eine eigene
  // "project-field"-Nachricht im Worker ergaenzt werden (aktuell out of
  // scope, Budgetposten selbst syncen bereits vollstaendig in Echtzeit).
  function setBudgetTarget(value) {
    updateProjectData(p => ({ ...p, budgetTarget: value }));
  }

  function setConfig(v) {
    setState(prev => ({ ...prev, config: { ...prev.config, ...v } }));
    if (cloudEnabled) sync.saveSettings({ ...cfg, ...v }).catch(() => {});
  }

  // Automatisch einen "Take 1" fuer Szenen anlegen, die auf "In Progress" wechseln
  React.useEffect(() => {
    const existing = new Set((pd.takes || []).map(t => t.sceneId + '-1'));
    const newTakes = (pd.scenes || []).filter(s => s.status === 'In Progress' && !existing.has(s.id + '-1')).map(s => ({
      id: 'tka' + s.id, sceneId: s.id, sceneNumber: s.number, sceneHeading: s.heading,
      takeNum: 1, status: 'Geplant', note: 'Auto', time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    }));
    if (newTakes.length) setTakes(p => [...p, ...newTakes]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(pd.scenes || []).map(s => s.id + s.status).join(',')]);

  // Projekt-Operationen -- ebenfalls per WebSocket in Echtzeit verteilt,
  // mit REST-Fallback falls die Verbindung gerade unterbrochen ist.
  function switchProject(id) { setState(prev => ({ ...prev, activeProjectId: id })); setSec('board'); }

  function createProject(id, name, color, desc) {
    const project = { id, name, color, desc, created: Date.now() };
    setState(prev => ({
      ...prev, activeProjectId: id,
      projects: [...prev.projects, project],
      data: { ...prev.data, [id]: makeEmptyProject(id, name, color, desc) },
    }));
    if (cloudEnabled) {
      const sentLive = live.send({ type: 'project-created', project });
      if (!sentLive) sync.createProject(project).catch(() => {});
    }
    setSec('board');
  }

  function deleteProject(id) {
    setState(prev => {
      const remaining = prev.projects.filter(p => p.id !== id);
      const d = { ...prev.data }; delete d[id];
      return { ...prev, projects: remaining, data: d, activeProjectId: id === prev.activeProjectId ? (remaining[0]?.id || 'p1') : prev.activeProjectId };
    });
    if (cloudEnabled) {
      const sentLive = live.send({ type: 'project-deleted', projectId: id });
      if (!sentLive) sync.deleteProject(id).catch(() => {});
    }
  }

  function renameProject(id, name) {
    setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, name } : p) }));
    if (cloudEnabled) {
      const sentLive = live.send({ type: 'project-renamed', projectId: id, name });
      if (!sentLive) sync.renameProject(id, name).catch(() => {});
    }
  }

  // Drag & Drop -- Statuswechsel bei Szenen/Takes, Tageswechsel im Kalender
  const dnd = useDnD((item, zone) => {
    if (zone.startsWith('sc-')) {
      setScenes(p => p.map(s => s.id === item.id ? { ...s, status: zone.replace('sc-', '') } : s));
    } else if (zone.startsWith('cal-')) {
      const d = zone.replace('cal-', '');
      if (d === 'new') {
        const mx = Math.max(0, ...(pd.scenes || []).map(s => s.day));
        setScenes(p => p.map(s => s.id === item.id ? { ...s, day: mx + 1 } : s));
      } else {
        setScenes(p => p.map(s => s.id === item.id ? { ...s, day: +d } : s));
      }
    } else if (zone.startsWith('tk-')) {
      setTakes(p => p.map(t => t.id === item.id ? { ...t, status: zone.replace('tk-', '') } : t));
    }
  });

  // UI-State
  const [sec, setSec] = React.useState('board');
  const [view, setView] = React.useState('board');
  const [unitFilter, setUnitFilter] = React.useState('Alle');
  const [search, setSearch] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [editScene, setEditScene] = React.useState(null);
  const [showNewScene, setShowNewScene] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [showProjects, setShowProjects] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [boardTab, setBoardTab] = React.useState('Planned');

  const scenes = pd.scenes || [], takes = pd.takes || [], scripts = pd.scripts || [], shots = pd.shots || [];
  const notes = pd.notes || [], cast = pd.cast || [], locations = pd.locations || [], budget = pd.budget || [];
  const equipment = pd.equipment || [];

  const filtered = React.useMemo(() => scenes.filter(s => {
    const matchesUnit = unitFilter === 'Alle' || s.unit === unitFilter;
    const q = search.toLowerCase();
    return matchesUnit && (!q || s.heading.toLowerCase().includes(q) || s.number.includes(q) || s.location.toLowerCase().includes(q) || (s.cast || []).some(c => c.toLowerCase().includes(q)));
  }), [scenes, unitFilter, search]);

  const grouped = React.useMemo(() => {
    const g = {}; STATS.forEach(s => (g[s] = [])); filtered.forEach(s => g[s.status]?.push(s)); return g;
  }, [filtered]);

  // Systemweite Verknuepfung: wenn in der Szene Cast/Location/Equipment
  // (de-)selektiert werden, wird das jeweilige Datensatz-Array `scenes`
  // (in Besetzung/Motive/Equipment) automatisch mitgepflegt -- so taucht
  // die Szene sofort auch in den anderen Listen als "verwendet in" auf,
  // ganz gleich ob man von der Szene oder von der Ressourcen-Liste aus
  // schaut. Single-Source-of-Truth fuer die Auswahl bleibt die Szene
  // selbst (castIds/locationId/equipmentIds).
  function syncResourceLinks(prevScene, nextScene) {
    const sceneId = nextScene.id;
    const prevCast = prevScene?.castIds || [];
    const nextCast = nextScene.castIds || [];
    if (prevCast.join() !== nextCast.join()) {
      setCast(p => p.map(c => {
        const has = (c.scenes || []).includes(sceneId);
        const should = nextCast.includes(c.id);
        if (has === should) return c;
        return { ...c, scenes: should ? [...(c.scenes || []), sceneId] : (c.scenes || []).filter(x => x !== sceneId) };
      }));
    }

    const prevLoc = prevScene?.locationId || '';
    const nextLoc = nextScene.locationId || '';
    if (prevLoc !== nextLoc) {
      setLocations(p => p.map(l => {
        const has = (l.scenes || []).includes(sceneId);
        const should = l.id === nextLoc;
        if (has === should) return l;
        return { ...l, scenes: should ? [...(l.scenes || []), sceneId] : (l.scenes || []).filter(x => x !== sceneId) };
      }));
    }

    const prevEquip = prevScene?.equipmentIds || [];
    const nextEquip = nextScene.equipmentIds || [];
    if (prevEquip.join() !== nextEquip.join()) {
      setEquipment(p => p.map(e => {
        const has = (e.scenes || []).includes(sceneId);
        const should = nextEquip.includes(e.id);
        if (has === should) return e;
        return { ...e, scenes: should ? [...(e.scenes || []), sceneId] : (e.scenes || []).filter(x => x !== sceneId) };
      }));
    }
  }

  function saveScene(sc) {
    const prevScene = scenes.find(s => s.id === sc.id);
    setScenes(p => p.some(s => s.id === sc.id) ? p.map(s => s.id === sc.id ? sc : s) : [...p, sc]);
    syncResourceLinks(prevScene, sc);
  }

  function deleteScene(id) {
    const prevScene = scenes.find(s => s.id === id);
    setScenes(p => p.filter(s => s.id !== id));
    // Verknuepfungen sauber aufloesen, damit keine toten Referenzen bleiben
    if (prevScene) syncResourceLinks(prevScene, { ...prevScene, castIds: [], locationId: '', equipmentIds: [] });
  }

  function addStickyNote() {
    const keys = Object.keys(NAC);
    const color = keys[Math.floor(Math.random() * keys.length)];
    setNotes(p => [...p, { id: 'n' + Date.now(), text: '', label: 'Notiz', color, x: Math.random() * 300 + 80, y: Math.random() * 200 + 80, minimized: false }]);
  }

  const effectiveView = sec === 'calendar' ? 'calendar' : view;
  const isBoardSection = sec === 'board' || sec === 'calendar';

  return (
    <div style={{ height: '100vh', background: '#0B0C0E', color: '#E7E6E2', fontFamily: "'IBM Plex Mono',monospace", display: 'flex', overflow: 'hidden' }}>
      {desk && (
        <Sidebar sec={sec} setSec={setSec} syncOnline={syncOnline} cloudEnabled={cloudEnabled}
          onRefresh={refreshFromServer} refreshing={refreshing}
          pd={{ scenes, takes, scripts, shots, cast, locations, budget, equipment }}
          proj={proj} projs={projects} onNote={addStickyNote}
          onProj={() => setShowProjects(true)} onSet={() => setShowSettings(true)} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {isBoardSection && (
          <>
            <BoardHeader
              filtered={filtered} grouped={grouped} view={effectiveView}
              setView={v => { setView(v); setSec('board'); }}
              unitFilter={unitFilter} setUnitFilter={setUnitFilter}
              search={search} setSearch={setSearch} showSearch={showSearch} setShowSearch={setShowSearch}
              onImport={() => setShowImport(true)} onExport={() => setShowExport(true)}
              onNew={() => setShowNewScene(true)} onNote={addStickyNote} mob={mob}
            />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {effectiveView === 'board'
                ? <BoardView grouped={grouped} onClick={setEditScene} takes={takes} dnd={dnd} mob={mob} tab={{ val: boardTab, set: setBoardTab }} showTakes={cfg.showTakes} locationsAll={locations} equipmentAll={equipment} />
                : <CalView scenes={filtered} takes={takes} dnd={dnd} onClick={setEditScene} mob={mob} showTakes={cfg.showTakes} locationsAll={locations} equipmentAll={equipment} />}
            </div>
          </>
        )}
        {sec === 'scripts' && (
          <ScriptsSection scripts={scripts} onChange={setScripts} onImportToBoard={ns => setScenes(p => [...p, ...ns])} mob={mob} desk={desk}
            apiKey={cfg.apiKey} aiModel={cfg.aiModel} scenesAll={scenes}
            onApplyFormat={applyAiFormat} onApplyBreakdown={applyAiBreakdown} onApplyBudget={applyAiBudget} />
        )}
        {sec === 'takes' && <Takes takes={takes} onChange={setTakes} scenes={scenes} mob={mob} dnd={dnd} />}
        {sec === 'shots' && <ShotList shots={shots} onChange={setShots} scenes={scenes} mob={mob} dnd={dnd} />}
        {sec === 'cast' && <CastSection cast={cast} onChange={setCast} scenes={scenes} mob={mob} />}
        {sec === 'locations' && <LocationsSection locations={locations} onChange={setLocations} scenes={scenes} mob={mob} />}
        {sec === 'equipment' && <EquipmentSection equipment={equipment} onChange={setEquipment} scenes={scenes} mob={mob} />}
        {sec === 'budget' && <BudgetSection budget={budget} onChange={setBudget} budgetTarget={pd.budgetTarget} onChangeTarget={setBudgetTarget} mob={mob} />}
      </div>

      {!desk && (
        <BottomNav
          sec={sec}
          setSec={s => { setSec(s); if (s === 'calendar') setView('calendar'); else if (s === 'board') setView('board'); }}
          onNew={() => { setSec('board'); setShowNewScene(true); }}
          takes={takes} onSet={() => setShowSettings(true)}
        />
      )}

      {notes.map(n => <StickyNote key={n.id} note={n} onUpdate={u => setNotes(p => p.map(x => x.id === u.id ? u : x))} onDelete={id => setNotes(p => p.filter(x => x.id !== id))} />)}

      {editScene && (
        <SceneModal scene={editScene} onClose={() => setEditScene(null)} onSave={sc => { saveScene(sc); setEditScene(null); }} onDelete={deleteScene} mob={mob}
          castAll={cast} locationsAll={locations} equipmentAll={equipment} />
      )}
      {showNewScene && (
        <SceneModal onClose={() => setShowNewScene(false)} onSave={sc => { saveScene(sc); setShowNewScene(false); }} onDelete={() => {}} mob={mob}
          castAll={cast} locationsAll={locations} equipmentAll={equipment} />
      )}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={ns => setScenes(p => [...p, ...ns])} mob={mob} />}
      {showExport && <ExportModal scenes={scenes} name={proj?.name || 'Film'} onClose={() => setShowExport(false)} mob={mob} />}
      {showProjects && (
        <ProjectModal projects={projects} data={state.data} activeId={activeId}
          onSwitch={switchProject} onCreate={createProject} onDelete={deleteProject} onRename={renameProject}
          onClose={() => setShowProjects(false)} mob={mob} />
      )}
      {showSettings && (
        <Settings cfg={cfg} onChange={setConfig} onClose={() => setShowSettings(false)} mob={mob} syncOnline={syncOnline}
          cloudEnabled={cloudEnabled} onRefresh={refreshFromServer} refreshing={refreshing} lastRefresh={lastRefresh}
          onExport={() => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
            a.download = 'closeup-backup.json'; a.click();
          }}
          onImport={d => { if (d && d.v) { setState(d); setShowSettings(false); } else alert('Ungueltige Datei.'); }}
          onReset={() => { resetLocalState(); window.location.reload(); }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
