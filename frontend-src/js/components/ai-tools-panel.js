// js/components/ai-tools-panel.js
// Uebersicht + Ausfuehrung der zusaetzlichen KI-Werkzeuge (siehe
// ai-tools-registry.js). Fuer Formatierer/Breakdown/Budgetschaetzung gibt es
// eine "Uebernehmen"-Aktion, die das Ergebnis direkt in die App einspeist.

function AIToolsPanel({ script, scenes, apiKey, aiModel, onClose, mob, onApplyFormat, onApplyBreakdown, onApplyBudget }) {
  const [active, setActive] = React.useState(null);
  const [state, setState] = React.useState('idle'); // idle | load | done | err
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');
  const [dayInput, setDayInput] = React.useState('1');
  const [langInput, setLangInput] = React.useState('Englische');
  const [applied, setApplied] = React.useState(false);

  function pick(tool) {
    setActive(tool); setState('idle'); setResult(null); setError(''); setApplied(false);
  }

  async function run() {
    if (!active) return;
    setState('load'); setError('');
    try {
      const prompt = active.buildPrompt({ script, scenes, dayInput, langInput });
      const expectJson = active.resultType === 'json-breakdown' || active.resultType === 'json-budget';
      const res = await runAiTool(prompt, apiKey, aiModel, expectJson);
      setResult(res); setState('done');
    } catch (e) { setError(e.message); setState('err'); }
  }

  function applyResult() {
    if (!active || !result) return;
    if (active.resultType === 'text' && active.id === 'formatter') onApplyFormat(result);
    if (active.resultType === 'json-breakdown') onApplyBreakdown(result);
    if (active.resultType === 'json-budget') onApplyBudget(result);
    setApplied(true);
  }

  return (
    <Modal onClose={onClose} mob={mob} wide>
      <MHd title="KI-WERKZEUGE" sub={active ? active.label : (script ? script.name : 'Weitere KI-Funktionen')} onClose={onClose} />

      {!active && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {AI_TOOLS.filter(t => !t.needsScript || script).map(t => (
            <button key={t.id} onClick={() => pick(t)} style={{
              display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', border: '1px solid #2A2C30',
              background: '#161719', borderRadius: 9, padding: '11px 13px', cursor: 'pointer', color: '#E7E6E2',
            }} onMouseEnter={e => e.currentTarget.style.borderColor = '#454850'} onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2C30'}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: '#1A1B1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic n={t.icon} sz={15} cl="#E8A33D" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#F2F1EC' }}>{t.label}</div>
                <div style={{ fontSize: 10.5, color: '#7A7D83', marginTop: 2, lineHeight: 1.4 }}>{t.description}</div>
              </div>
              <Ic n="CR" sz={14} cl="#5B5F66" />
            </button>
          ))}
        </div>
      )}

      {active && (
        <div>
          <button onClick={() => setActive(null)} style={{ ...gh(mob), padding: '6px 11px', marginBottom: 14, fontSize: 11 }}>
            <Ic n="CL" sz={12} />Alle Werkzeuge
          </button>

          {active.needsDayInput && (
            <Fld lbl="Drehtag"><input type="number" min={1} style={inp(mob)} value={dayInput} onChange={e => setDayInput(e.target.value)} /></Fld>
          )}
          {active.needsLangInput && (
            <Fld lbl="Zielsprache"><input style={inp(mob)} value={langInput} onChange={e => setLangInput(e.target.value)} placeholder="Englische, Franzoesische, ..." /></Fld>
          )}

          {state === 'idle' && (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <div style={{ fontSize: 12.5, color: '#9A9DA3', marginBottom: 16, lineHeight: 1.6 }}>{active.description}</div>
              <button onClick={run} style={{ ...pr(mob), margin: '0 auto', padding: '11px 22px' }}><Ic n="AI" sz={14} cl="#15120A" />Ausfuehren</button>
            </div>
          )}
          {state === 'load' && (
            <div style={{ textAlign: 'center', padding: '36px 20px' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #2A2C30', borderTop: '3px solid #E8A33D', borderRadius: 99, margin: '0 auto 14px', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 12.5, color: '#E8A33D' }}>KI arbeitet...</div>
            </div>
          )}
          {state === 'err' && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: 12.5, color: '#D16B5C', marginBottom: 14 }}>{error}</div>
              <button onClick={() => setState('idle')} style={gh(mob)}>Zurueck</button>
            </div>
          )}
          {state === 'done' && (
            <div>
              <ToolResult tool={active} result={result} />
              {(active.applyLabel) && (
                <button onClick={applyResult} disabled={applied} style={{ ...pr(mob), width: '100%', justifyContent: 'center', padding: '11px', marginTop: 14, opacity: applied ? .5 : 1 }}>
                  <Ic n="Ok" sz={14} cl="#15120A" />{applied ? 'Uebernommen' : active.applyLabel}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function ToolResult({ tool, result }) {
  if (tool.resultType === 'text') {
    return (
      <div style={{ background: '#0E0F11', border: '1px solid #2A2C30', borderRadius: 9, padding: 14, maxHeight: 360, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: 12.5, color: '#C9CBD0', lineHeight: 1.6 }}>
        {result}
      </div>
    );
  }
  if (tool.resultType === 'json-breakdown') {
    return (
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {['equipment', 'props', 'costumes'].map(key => (result[key]?.length > 0) && (
          <div key={key} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A8D93', letterSpacing: .5, marginBottom: 6, textTransform: 'uppercase' }}>{key}</div>
            {result[key].map((item, i) => (
              <div key={i} style={{ background: '#0E0F11', border: '1px solid #2A2C30', borderRadius: 8, padding: '8px 12px', marginBottom: 5, fontSize: 12, color: '#C9CBD0' }}>
                <strong style={{ color: '#F2F1EC' }}>{item.name}</strong>
                {item.category && <span style={{ color: '#E8A33D', marginLeft: 6, fontSize: 10.5 }}>{item.category}</span>}
                {(item.reason || item.scene || item.character) && <div style={{ fontSize: 10.5, color: '#7A7D83', marginTop: 3 }}>{item.reason || item.scene || item.character}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (tool.resultType === 'json-budget') {
    return (
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {(result.items || []).map((it, i) => (
          <div key={i} style={{ background: '#0E0F11', border: '1px solid #2A2C30', borderRadius: 8, padding: '9px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F2F1EC' }}>{it.item}</div>
              <div style={{ fontSize: 10.5, color: '#7A7D83', marginTop: 2 }}>{it.category} {it.notes ? '- ' + it.notes : ''}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8A33D', flexShrink: 0 }}>{(it.amount || 0).toLocaleString('de-DE')} EUR</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
