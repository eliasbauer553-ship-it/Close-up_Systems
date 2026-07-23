// js/components/sticky-note.js
// Frei verschiebbare Haftnotiz (Maus + Touch), persistiert Text/Farbe/Position.

function StickyNote({ note, onUpdate, onDelete }) {
  const [pos, setPos] = React.useState({ x: note.x, y: note.y });
  const [mini, setMini] = React.useState(note.minimized || false);
  const dragging = React.useRef(false);
  const offset = React.useRef({ x: 0, y: 0 });
  const accent = NAC[note.color] || NAC.y;
  const bg = NBG[note.color] || NBG.y;

  function startDrag(e) {
    dragging.current = true;
    const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    offset.current = { x: cx - pos.x, y: cy - pos.y };
    e.preventDefault();
  }

  React.useEffect(() => {
    function move(e) {
      if (!dragging.current) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 220, cx - offset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, cy - offset.current.y)),
      });
    }
    function up() {
      if (!dragging.current) return;
      dragging.current = false;
      onUpdate({ ...note, x: pos.x, y: pos.y });
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
    };
  }, [pos, note, onUpdate]);

  return (
    <div style={{
      position: 'fixed', left: pos.x, top: pos.y, zIndex: 400,
      width: mini ? 160 : 215, fontFamily: "'IBM Plex Mono',monospace", userSelect: 'none',
    }}>
      <div style={{ background: bg, border: '1px solid ' + accent + '44', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,.5)' }}>
        <div onMouseDown={startDrag} onTouchStart={startDrag} style={{
          background: accent + '1A', borderBottom: '1px solid ' + accent + '30', padding: '6px 8px',
          cursor: 'grab', display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Ic n="Pin" sz={10} cl={accent} />
          <span style={{ fontSize: 10, color: accent, fontWeight: 600, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {note.label || 'Notiz'}
          </span>
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            {Object.keys(NAC).map(c => (
              <div key={c} onClick={() => onUpdate({ ...note, color: c })} style={{
                width: 8, height: 8, borderRadius: 99, background: NAC[c],
                border: note.color === c ? '1px solid #fff' : '1px solid transparent', cursor: 'pointer',
              }} />
            ))}
            <button onClick={() => { setMini(v => !v); onUpdate({ ...note, minimized: !mini }); }} style={{ ...S0, padding: 2, color: accent }}>
              <Ic n={mini ? 'CD' : 'CU'} sz={10} />
            </button>
            <button onClick={() => onDelete(note.id)} style={{ ...S0, padding: 2, color: '#D16B5C' }}>
              <Ic n="X" sz={10} />
            </button>
          </div>
        </div>
        {!mini && (
          <div style={{ padding: '8px 10px' }}>
            <input
              value={note.label || ''}
              onChange={e => onUpdate({ ...note, label: e.target.value })}
              placeholder="Titel..."
              style={{
                background: 'transparent', border: 'none', outline: 'none', width: '100%',
                fontSize: 10, color: accent, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 4,
              }}
            />
            <textarea
              value={note.text || ''}
              onChange={e => onUpdate({ ...note, text: e.target.value })}
              placeholder="Hier schreiben..."
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'vertical',
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#C9CBD0', lineHeight: 1.5,
                minHeight: 50, cursor: 'text',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
