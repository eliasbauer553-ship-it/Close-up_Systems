// js/components/ai-analysis.js
// KI-Drehbuchanalyse ueber OpenRouter (Free-Tier-Modelle moeglich). Der
// API-Key wird ausschliesslich lokal im Browser gespeichert und direkt an
// openrouter.ai gesendet -- nie ueber den eigenen Worker geleitet.

const DEFAULT_AI_MODEL = 'deepseek/deepseek-chat-v3-0324:free';

async function runScriptAnalysis(scriptText, apiKey, model) {
  const key = (apiKey || '').trim();
  if (!key) throw new Error('Kein API-Key hinterlegt (Einstellungen -> KI).');

  const prompt =
    'Analysiere dieses Drehbuch. Antworte NUR mit JSON, ohne Markdown-Codeblock, ohne Praeambel:\n' +
    '{"title":"","genre":"","logline":"","themes":[],' +
    '"characters":[{"name":"","role":"","arc":"","color":"#E8A33D"}],' +
    '"scenes":[{"number":"","heading":"","mood":"","tension":5,"keyMoment":false,"note":""}],' +
    '"productionNotes":[],"shootingDays":5}\n\n' + scriptText.slice(0, 5000);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
      // Von OpenRouter empfohlene, optionale Header zur Identifikation:
      'HTTP-Referer': (typeof window !== 'undefined' ? window.location.origin : ''),
      'X-Title': 'Close-up Systems',
    },
    body: JSON.stringify({
      model: model || DEFAULT_AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const serverMsg = errBody.error?.message || errBody.message || '';
    if (res.status === 401) {
      throw new Error('Authentifizierung fehlgeschlagen (401). Der API-Key ist leer, ungueltig oder abgelaufen -- in Einstellungen -> KI pruefen/ersetzen.' + (serverMsg ? ' (' + serverMsg + ')' : ''));
    }
    if (res.status === 402) throw new Error('OpenRouter meldet aufgebrauchtes Guthaben/Kontingent (402). Anderes Modell waehlen oder Key aufladen.');
    if (res.status === 429) throw new Error('Zu viele Anfragen (429) -- kurz warten und erneut versuchen.');
    throw new Error(serverMsg || ('Fehler ' + res.status));
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  // Manche Modelle wickeln die Antwort in ```json ... ``` -- entfernen.
  const cleaned = text.replace(/```json|```/g, '').trim();
  try { return JSON.parse(cleaned); }
  catch (e) {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Ungueltige Antwort von der KI');
  }
}

function AIAnalysisModal({ script, apiKey, aiModel, onClose, mob }) {
  const [state, setState] = React.useState('idle');
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');
  const [tab, setTab] = React.useState('ov');

  async function run() {
    if (!apiKey) { setError('API-Key in Einstellungen eintragen.'); setState('err'); return; }
    setState('load'); setError('');
    try { setResult(await runScriptAnalysis(script.content, apiKey, aiModel)); setState('done'); }
    catch (e) { setError(e.message); setState('err'); }
  }

  return (
    <Modal onClose={onClose} mob={mob} wide>
      <MHd title="KI-SKRIPT-ANALYSE" sub={script.name + ' - Claude AI'} onClose={onClose} />

      {state === 'idle' && (
        <div style={{ textAlign: 'center', padding: '28px 10px' }}>
          <div style={{ width: 60, height: 60, borderRadius: 99, background: '#1A1B1E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Ic n="AI" sz={26} cl="#E8A33D" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#F2F1EC', marginBottom: 8 }}>Drehbuch mit KI analysieren</div>
          <div style={{ fontSize: 12, color: '#7A7D83', marginBottom: 16, lineHeight: 1.6 }}>
            Charaktere, Szenen, Emotionen und Produktionshinweise werden automatisch erkannt.
          </div>
          {!apiKey && (
            <div style={{ background: '#1A0A00', border: '1px solid #E8A33D44', borderRadius: 8, padding: '10px 14px', fontSize: 11.5, color: '#E8A33D', marginBottom: 14 }}>
              API-Key fehlt -- in Einstellungen &rarr; KI eintragen.
            </div>
          )}
          <button onClick={run} style={{ ...pr(mob), margin: '0 auto', padding: '11px 24px', opacity: apiKey ? 1 : .5 }}>
            <Ic n="AI" sz={14} cl="#15120A" />Analyse starten
          </button>
        </div>
      )}

      {state === 'load' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #2A2C30', borderTop: '3px solid #E8A33D', borderRadius: 99, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 13, color: '#E8A33D' }}>Claude analysiert das Drehbuch...</div>
        </div>
      )}

      {state === 'err' && (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: 13, color: '#D16B5C', marginBottom: 14 }}>{error}</div>
          <button onClick={() => setState('idle')} style={gh(mob)}>Zurueck</button>
        </div>
      )}

      {state === 'done' && result && (
        <div>
          <Tabs tabs={[
            { id: 'ov', lbl: 'Uebersicht' }, { id: 'ch', lbl: 'Charaktere' },
            { id: 'sc', lbl: 'Szenen' }, { id: 'pr', lbl: 'Produktion' },
          ]} active={tab} onChange={setTab} />
          <div style={{ marginTop: 14 }}>
            {tab === 'ov' && (
              <div>
                <div style={{ background: '#0E0F11', border: '1px solid #2A2C30', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#F2F1EC', marginBottom: 3 }}>{result.title || script.name}</div>
                  <div style={{ fontSize: 11, color: '#E8A33D', marginBottom: 8 }}>{result.genre}</div>
                  <div style={{ fontSize: 13, color: '#9A9DA3', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>&ldquo;{result.logline}&rdquo;</div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {(result.themes || []).map(t => (
                      <span key={t} style={{ fontSize: 10.5, padding: '3px 9px', borderRadius: 99, background: '#1A1B1E', color: '#C9CBD0', border: '1px solid #2A2C30' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <StatBox val={result.shootingDays || '?'} lbl="Drehtage (KI)" col="#E8A33D" />
                  <StatBox val={(result.characters || []).length} lbl="Charaktere" col="#4FA3D1" />
                  <StatBox val={(result.scenes || []).length} lbl="Szenen" col="#7FBF8F" />
                </div>
              </div>
            )}
            {tab === 'ch' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {(result.characters || []).map(c => (
                  <div key={c.name} style={{ background: '#0E0F11', borderLeft: '3px solid ' + (c.color || '#E8A33D'), border: '1px solid #2A2C30', borderRadius: 8, padding: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#F2F1EC' }}>{c.name}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: (c.color || '#E8A33D') + '22', color: c.color || '#E8A33D' }}>{c.role}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#9A9DA3', fontStyle: 'italic' }}>{c.arc}</div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'sc' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(result.scenes || []).map(s => (
                  <div key={s.number} style={{ background: '#0E0F11', border: '1px solid #2A2C30', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#E8A33D', fontWeight: 700 }}>SZ {s.number}</span>
                      {s.keyMoment && <span style={{ fontSize: 9, background: '#E8A33D', color: '#15120A', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>KEY</span>}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#C9CBD0', marginBottom: 4 }}>{s.heading}</div>
                    <div style={{ fontSize: 11, color: '#7A7D83', fontStyle: 'italic' }}>{s.mood} - {s.note}</div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'pr' && (
              <div>
                {(result.productionNotes || []).map((note, i) => (
                  <div key={i} style={{ background: '#0E0F11', border: '1px solid #2A2C30', borderRadius: 8, padding: '10px 13px', marginBottom: 8, display: 'flex', gap: 10 }}>
                    <span style={{ color: '#E8A33D', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: 12.5, color: '#C9CBD0', lineHeight: 1.5 }}>{note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function StatBox({ val, lbl, col }) {
  return (
    <div style={{ background: '#0E0F11', border: '1px solid #2A2C30', borderRadius: 8, padding: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: col }}>{val}</div>
      <div style={{ fontSize: 10, color: '#7A7D83' }}>{lbl}</div>
    </div>
  );
}
