// js/components/budget-section.js
// Budgetverwaltung: Kategorien, Posten, Betrag, Bezahlt-Status, Zielbudget
// mit Fortschrittsbalken, sowie Donut-/Balkendiagramme nach Kategorie.

const BUDGET_CATEGORIES = ['Kamera', 'Ton', 'Licht', 'Grip', 'Besetzung', 'Location', 'Kostuem', 'Postproduktion', 'Verpflegung', 'Transport', 'Versicherung', 'Sonstiges'];
const BUDGET_CAT_COLOR = {
  Kamera: '#E8A33D', Ton: '#4FA3D1', Licht: '#D1A34F', Grip: '#7FBF8F', Besetzung: '#C97FBF',
  Location: '#5BA8D1', Kostuem: '#D16B9F', Postproduktion: '#A87FBF', Verpflegung: '#8FBF7F',
  Transport: '#D16B5C', Versicherung: '#7A7D83', Sonstiges: '#8A8D93',
};
function catColor(cat) { return BUDGET_CAT_COLOR[cat] || '#8A8D93'; }

function BudgetSection({ budget, onChange, budgetTarget, onChangeTarget, mob }) {
  const [edit, setEdit] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  const [showTarget, setShowTarget] = React.useState(false);
  const [view, setView] = React.useState('list'); // list | charts

  const total = budget.reduce((a, b) => a + b.amount, 0);
  const paid = budget.filter(b => b.paid).reduce((a, b) => a + b.amount, 0);
  const open = total - paid;
  const categories = [...new Set(budget.map(b => b.category))];
  const target = budgetTarget || 0;
  const targetPct = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0;
  const overTarget = target > 0 && total > target;

  function save(b) { onChange(budget.some(x => x.id === b.id) ? budget.map(x => x.id === b.id ? b : x) : [...budget, b]); }

  const byCategory = React.useMemo(() => {
    const map = {};
    budget.forEach(b => { map[b.category] = (map[b.category] || 0) + b.amount; });
    return Object.entries(map).map(([label, value]) => ({ label, value, color: catColor(label) })).sort((a, b) => b.value - a.value);
  }, [budget]);

  const paidVsOpenByCategory = React.useMemo(() => {
    const out = [];
    categories.forEach(cat => {
      const items = budget.filter(b => b.category === cat);
      const paidSum = items.filter(b => b.paid).reduce((a, b) => a + b.amount, 0);
      const openSum = items.reduce((a, b) => a + b.amount, 0) - paidSum;
      out.push({ label: cat.slice(0, 6), value: paidSum, color: '#7FBF8F' });
    });
    return out;
  }, [budget, categories]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid #1E2023', padding: mob ? '9px 14px' : '9px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: 2, color: '#F2F1EC', marginRight: 'auto' }}>BUDGET</div>
        <div style={{ display: 'flex', gap: 3, background: '#161719', border: '1px solid #2A2C30', borderRadius: 7, padding: 2 }}>
          {[{ id: 'list', ic: 'FileT' }, { id: 'charts', ic: 'Tbl' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{ border: 'none', borderRadius: 5, padding: '5px 9px', cursor: 'pointer', background: view === v.id ? '#2A2C30' : 'transparent', display: 'flex' }}>
              <Ic n={v.ic} sz={14} cl={view === v.id ? '#F2F1EC' : '#8A8D93'} />
            </button>
          ))}
        </div>
        <button onClick={() => setShowTarget(true)} style={{ ...gh(mob), padding: '7px 11px', fontSize: 11 }}><Ic n="Dollar" sz={13} />Zielbudget</button>
        <button onClick={() => setShowNew(true)} style={{ ...pr(mob), padding: '7px 12px', fontSize: 11 }}><Ic n="Plus" sz={13} cl="#15120A" />Posten</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: mob ? '12px 14px' : '12px 18px', borderBottom: '1px solid #1E2023', flexShrink: 0 }}>
        <SumBox label="Gesamt" value={total} color="#F2F1EC" />
        <SumBox label="Bezahlt" value={paid} color="#7FBF8F" />
        <SumBox label="Offen" value={open} color="#E8A33D" />
      </div>

      {target > 0 && (
        <div style={{ padding: mob ? '10px 14px' : '10px 18px', borderBottom: '1px solid #1E2023', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: '#9A9DA3' }}>Zielbudget: {target.toLocaleString('de-DE')} EUR</span>
            <span style={{ color: overTarget ? '#D16B5C' : '#7FBF8F', fontWeight: 700 }}>{targetPct}%{overTarget ? ' - UEBERSCHRITTEN' : ''}</span>
          </div>
          <div style={{ height: 8, background: '#1A1B1E', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: Math.min(100, targetPct) + '%', background: overTarget ? '#D16B5C' : '#E8A33D', borderRadius: 99, transition: 'width .3s' }} />
          </div>
        </div>
      )}

      {view === 'charts' ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '16px 14px 90px' : '18px' }}>
          {byCategory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3F4147', fontSize: 13 }}>Kein Budget fuer Diagramme</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C9CBD0', letterSpacing: .5, marginBottom: 14 }}>VERTEILUNG NACH KATEGORIE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <DonutChart data={byCategory} />
                  <div style={{ flex: 1, minWidth: 140 }}><ChartLegend data={byCategory} /></div>
                </div>
              </div>
              <div style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C9CBD0', letterSpacing: .5, marginBottom: 14 }}>BEZAHLT PRO KATEGORIE</div>
                <BarChart data={paidVsOpenByCategory} width={mob ? 280 : 300} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '10px 12px 90px' : '12px 18px' }}>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: catColor(cat), letterSpacing: .5, marginBottom: 6, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: catColor(cat) }} />{cat}
              </div>
              {budget.filter(b => b.category === cat).map(b => (
                <div key={b.id} style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 8, padding: '10px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#F2F1EC' }}>{b.item}</div>
                    {b.notes && <div style={{ fontSize: 10.5, color: '#7A7D83', marginTop: 2 }}>{b.notes}</div>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: b.paid ? '#7FBF8F' : '#E8A33D', flexShrink: 0 }}>{b.amount.toLocaleString('de-DE')} EUR</div>
                  <button onClick={() => save({ ...b, paid: !b.paid })} style={{
                    width: 22, height: 22, borderRadius: 4, border: '1px solid ' + (b.paid ? '#7FBF8F' : '#2A2C30'),
                    background: b.paid ? '#7FBF8F' : 'transparent', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{b.paid && <Ic n="Ok" sz={12} cl="#15120A" />}</button>
                  <button onClick={() => setEdit(b)} style={S0}><Ic n="Edit" sz={12} /></button>
                  <button onClick={() => onChange(budget.filter(x => x.id !== b.id))} style={{ ...S0, color: '#D16B5C' }}><Ic n="Trash" sz={12} /></button>
                </div>
              ))}
            </div>
          ))}
          {budget.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3F4147', fontSize: 13 }}>Kein Budget</div>}
        </div>
      )}

      {(showNew || edit) && (
        <BudgetModal mob={mob} item={edit}
          onClose={() => { setShowNew(false); setEdit(null); }}
          onSave={b => { save(b); setShowNew(false); setEdit(null); }}
          onDelete={id => { onChange(budget.filter(x => x.id !== id)); setEdit(null); }} />
      )}
      {showTarget && (
        <TargetBudgetModal mob={mob} value={target} onClose={() => setShowTarget(false)}
          onSave={v => { onChangeTarget(v); setShowTarget(false); }} />
      )}
    </div>
  );
}

function SumBox({ label, value, color }) {
  return (
    <div style={{ background: '#161719', border: '1px solid #2A2C30', borderRadius: 8, padding: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value.toLocaleString('de-DE')} EUR</div>
      <div style={{ fontSize: 10, color: '#7A7D83', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function TargetBudgetModal({ value, onClose, onSave, mob }) {
  const [v, setV] = React.useState(value || 0);
  return (
    <Modal mob={mob} onClose={onClose}>
      <MHd title="ZIELBUDGET" sub="Gesamtbudget-Obergrenze fuer die Fortschrittsanzeige" onClose={onClose} />
      <Fld lbl="Zielbudget (EUR)"><input type="number" style={inp(mob)} value={v} onChange={e => setV(+e.target.value)} placeholder="z.B. 15000" /></Fld>
      <div style={{ fontSize: 11, color: '#7A7D83', marginBottom: 14, lineHeight: 1.6 }}>0 = keine Obergrenze anzeigen.</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ ...gh(mob), flex: 1, justifyContent: 'center' }}>Abbrechen</button>
        <button onClick={() => onSave(v)} style={{ ...pr(mob), flex: 2, justifyContent: 'center' }}>Speichern</button>
      </div>
    </Modal>
  );
}

function BudgetModal({ item, onClose, onSave, onDelete, mob }) {
  const [f, setF] = React.useState(item || { id: '', category: 'Sonstiges', item: '', amount: 0, paid: false, notes: '' });
  return (
    <Modal mob={mob} onClose={onClose}>
      <MHd title={item ? 'POSTEN BEARBEITEN' : 'NEUER POSTEN'} onClose={onClose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld lbl="Kategorie">
          <select style={inp(mob)} value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
            {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Fld>
        <Fld lbl="Betrag (EUR)"><input type="number" style={inp(mob)} value={f.amount} onChange={e => setF({ ...f, amount: +e.target.value })} /></Fld>
      </div>
      <Fld lbl="Posten"><input style={inp(mob)} value={f.item} onChange={e => setF({ ...f, item: e.target.value })} placeholder="z.B. RED Dragon 6K" /></Fld>
      <Fld lbl="Notizen"><input style={inp(mob)} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></Fld>
      <Tog val={f.paid} onChange={v => setF({ ...f, paid: v })} lbl="Bezahlt" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8 }}>
        {item ? <button onClick={() => { onDelete(item.id); onClose(); }} style={{ ...gh(mob), color: '#D16B5C', borderColor: '#3a2622' }}>Loeschen</button> : <span />}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={gh(mob)}>Abbrechen</button>
          <button onClick={() => { if (!f.item.trim()) { alert('Posten eingeben.'); return; } onSave({ ...f, id: item ? item.id : 'b' + Date.now() }); }} style={pr(mob)}>{item ? 'Speichern' : 'Anlegen'}</button>
        </div>
      </div>
    </Modal>
  );
}
