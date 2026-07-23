// js/core/dnd.js
// Drag & Drop-Engine auf Basis der Pointer Events API.
// Funktioniert identisch fuer Maus, Touch und Stylus (ein Code-Pfad).
// Ein Bewegungs-Schwellwert (8px) verhindert, dass normale Klicks
// (z.B. auf Edit-/Loeschen-Buttons) als Drag interpretiert werden.

function useDnD(onDrop) {
  const item = React.useRef(null);
  const ghost = React.useRef(null);
  const off = React.useRef({ x: 0, y: 0 });
  const pending = React.useRef(null); // wartet auf Schwellwert-Ueberschreitung
  const [over, setOver] = React.useState(null);
  const THRESHOLD = 8;

  function spawnGhost(el, cx, cy) {
    const r = el.getBoundingClientRect();
    off.current = { x: cx - r.left, y: cy - r.top };
    const g = el.cloneNode(true);
    g.removeAttribute('data-dz');
    g.className = (g.className || '') + ' dg';
    g.style.left = (cx - off.current.x) + 'px';
    g.style.top = (cy - off.current.y) + 'px';
    g.style.width = Math.min(r.width, 275) + 'px';
    document.body.appendChild(g);
    ghost.current = g;
  }

  function cleanup() {
    if (ghost.current) {
      try { document.body.removeChild(ghost.current); } catch (e) {}
      ghost.current = null;
    }
    item.current = null;
    pending.current = null;
    setOver(null);
  }

  React.useEffect(() => {
    function onMove(e) {
      const cx = e.clientX, cy = e.clientY;
      // Noch kein aktiver Drag: pruefe Schwellwert
      if (pending.current && !item.current) {
        const dx = cx - pending.current.sx, dy = cy - pending.current.sy;
        if (Math.sqrt(dx * dx + dy * dy) > THRESHOLD) {
          item.current = pending.current.it;
          spawnGhost(pending.current.el, cx, cy);
          pending.current = null;
        }
        return;
      }
      if (!ghost.current) return;
      ghost.current.style.left = (cx - off.current.x) + 'px';
      ghost.current.style.top = (cy - off.current.y) + 'px';
      // Drop-Zone unter dem Cursor finden (Ghost kurz ausblenden)
      ghost.current.style.display = 'none';
      const el = document.elementFromPoint(cx, cy);
      ghost.current.style.display = '';
      const z = el && el.closest('[data-dz]');
      setOver(z ? z.dataset.dz : null);
    }
    function onUp(e) {
      if (item.current) {
        if (ghost.current) ghost.current.style.display = 'none';
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (ghost.current) ghost.current.style.display = '';
        const z = el && el.closest('[data-dz]');
        if (z) onDrop(item.current, z.dataset.dz);
      }
      cleanup();
    }
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', cleanup);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', cleanup);
    };
  }, [onDrop]);

  return {
    // An draggable Elemente spreaden: {...dnd.drag(item)}
    drag(it, srcEl) {
      return {
        onPointerDown(e) {
          if (e.button !== 0 && e.button !== undefined) return;
          pending.current = { it, el: srcEl || e.currentTarget, sx: e.clientX, sy: e.clientY };
        },
        style: { cursor: 'grab', userSelect: 'none', touchAction: 'none' },
      };
    },
    // An Drop-Zonen spreaden: {...dnd.zone("spalte-id")}
    zone(z) {
      return { 'data-dz': z, className: over === z ? 'dz-ov' : '' };
    },
    isOver: (z) => over === z,
  };
}
