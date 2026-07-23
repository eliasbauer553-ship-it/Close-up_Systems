// js/components/primitives.js
// Wiederverwendbare Grundbausteine fuer alle Formulare und Modals.

function Fld({ lbl, children, mt = 0 }) {
  return (
    <label style={{ display: 'block', marginBottom: 11, marginTop: mt }}>
      <div style={{ fontSize: 10, letterSpacing: .8, color: '#8A8D93', marginBottom: 5, textTransform: 'uppercase' }}>{lbl}</div>
      {children}
    </label>
  );
}

function Modal({ onClose, children, mob, wide }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(7,8,9,.84)', display: 'flex',
      alignItems: mob ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 600, padding: mob ? 0 : 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: mob ? '100%' : wide ? '720px' : '520px',
        background: '#161719', border: mob ? 'none' : '1px solid #2A2C30',
        borderRadius: mob ? '18px 18px 0 0' : '12px', padding: mob ? '20px 18px' : '22px',
        color: '#E7E6E2', maxHeight: mob ? '92vh' : '90vh', overflowY: 'auto',
        boxShadow: '0 -8px 50px rgba(0,0,0,.7)',
        paddingBottom: mob ? 'calc(24px + env(safe-area-inset-bottom,0px))' : '22px',
      }}>
        {mob && <div style={{ width: 36, height: 4, background: '#3A3C40', borderRadius: 99, margin: '0 auto 18px' }} />}
        {children}
      </div>
    </div>
  );
}

function MHd({ title, sub, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: .3, color: '#F2F1EC' }}>{title}</div>
        {sub && <div style={{ fontSize: 10.5, color: '#7A7D83', marginTop: 3 }}>{sub}</div>}
      </div>
      {onClose && <button onClick={onClose} style={S0}><Ic n="X" sz={18} /></button>}
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #1E2023', overflowX: 'auto', flexShrink: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          border: 'none', background: 'transparent', padding: '10px 12px', cursor: 'pointer',
          fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 600,
          color: active === t.id ? '#F2F1EC' : '#5B5F66',
          borderBottom: active === t.id ? '2px solid ' + (t.col || '#E8A33D') : '2px solid transparent',
          display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {t.dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: t.dot }} />}
          {t.ic && <Ic n={t.ic} sz={11} />}
          {t.lbl}
          {t.cnt != null && <span style={{ opacity: .6, fontSize: 9 }}>({t.cnt})</span>}
        </button>
      ))}
    </div>
  );
}

function Tog({ val, onChange, lbl }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 0' }}>
      <span style={{ fontSize: 12.5, color: '#C9CBD0' }}>{lbl}</span>
      <div onClick={() => onChange(!val)} style={{
        width: 40, height: 22, borderRadius: 99, background: val ? '#E8A33D' : '#2A2C30',
        position: 'relative', transition: 'background .2s', cursor: 'pointer', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: val ? 19 : 3, width: 16, height: 16,
          borderRadius: 99, background: '#fff', transition: 'left .2s',
        }} />
      </div>
    </label>
  );
}

function ColPick({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
      {PCOL.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: 26, height: 26, borderRadius: 99, background: c,
          border: '2px solid ' + (value === c ? '#fff' : 'transparent'), cursor: 'pointer',
        }} />
      ))}
    </div>
  );
}
