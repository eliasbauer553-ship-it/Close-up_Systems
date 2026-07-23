// js/core/charts.js
// Minimalistische, abhaengigkeitsfreie SVG-Diagramme (Donut + Balken).
// Bewusst kein Chart-Framework -- die App laeuft ohne Build-Schritt direkt
// im Browser, ein npm-Paket wuerde das verkomplizieren. Fuer die hier
// benoetigten Uebersichten (Budget nach Kategorie) reicht simples SVG.

function DonutChart({ data, size = 160, thickness = 22 }) {
  // data: [{label, value, color}]
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  if (total <= 0) {
    return (
      <svg width={size} height={size} viewBox={'0 0 ' + size + ' ' + size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E2023" strokeWidth={thickness} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#5B5F66" fontSize="11" fontFamily="'IBM Plex Mono',monospace">Kein Budget</text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={'0 0 ' + size + ' ' + size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E2023" strokeWidth={thickness} />
      {data.map((d, i) => {
        const frac = d.value / total;
        const dash = frac * circumference;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={thickness}
            strokeDasharray={dash + ' ' + (circumference - dash)} strokeDashoffset={-offset}
            strokeLinecap={data.length > 1 ? 'butt' : 'round'} />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

function BarChart({ data, width = 320, height = 140, maxValue }) {
  // data: [{label, value, color}]
  const mx = maxValue || Math.max(1, ...data.map(d => d.value));
  const barGap = 10;
  const barW = data.length ? (width - barGap * (data.length - 1)) / data.length : width;
  return (
    <svg width={width} height={height + 24} viewBox={'0 0 ' + width + ' ' + (height + 24)}>
      {data.map((d, i) => {
        const h = mx > 0 ? (d.value / mx) * height : 0;
        const x = i * (barW + barGap);
        const y = height - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={3} fill={d.color} />
            <text x={x + barW / 2} y={height + 15} textAnchor="middle" fontSize="9" fill="#7A7D83" fontFamily="'IBM Plex Mono',monospace">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ChartLegend({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
          <span style={{ color: '#C9CBD0', flex: 1 }}>{d.label}</span>
          <span style={{ color: '#7A7D83', fontWeight: 600 }}>{d.value.toLocaleString('de-DE')} EUR</span>
        </div>
      ))}
    </div>
  );
}
