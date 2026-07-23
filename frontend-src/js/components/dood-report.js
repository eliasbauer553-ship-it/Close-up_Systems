// js/components/dood-report.js
// "Day-Out-of-Days" (DOOD) Report -- ein Klassiker aus professioneller
// Drehplan-Software (z.B. onTime Studio, Movie Magic Scheduling): zeigt pro
// Cast-Mitglied und Drehtag, ob gearbeitet wird (W), Reisetag ist (T),
// oder Bereitschaft (H = Hold). Hilft, Gagen/Reisekosten realistisch zu
// planen und Cast-Verfuegbarkeiten auf einen Blick zu pruefen.

function computeDOOD(cast, scenes) {
  const days = [...new Set(scenes.map(s => s.day))].sort((a, b) => a - b);
  const rows = cast.map(c => {
    const workDays = new Set(
      scenes.filter(s => (s.castIds || []).includes(c.id) || (s.cast || []).includes(c.name)).map(s => s.day)
    );
    const sorted = [...workDays].sort((a, b) => a - b);
    const first = sorted[0], last = sorted[sorted.length - 1];
    // Zwischen erstem und letztem Arbeitstag: HOLD (H), an Arbeitstagen: WORK (W)
    const cells = days.map(d => {
      if (workDays.has(d)) return 'W';
      if (first != null && d > first && d < last) return 'H';
      return '';
    });
    return { person: c, cells, workCount: workDays.size, span: (first != null) ? (last - first + 1) : 0 };
  });
  return { days, rows };
}

function DoodReport({ cast, scenes, onClose, mob }) {
  const { days, rows } = React.useMemo(() => computeDOOD(cast, scenes), [cast, scenes]);

  function printReport() {
    const rowsHtml = rows.map(r =>
      '<tr><td class="name">' + r.person.name + '</td>' +
      r.cells.map(c => '<td class="' + (c === 'W' ? 'w' : c === 'H' ? 'h' : '') + '">' + c + '</td>').join('') +
      '<td class="cnt">' + r.workCount + '</td><td class="cnt">' + r.span + '</td></tr>'
    ).join('');
    const headHtml = days.map(d => '<th>T' + d + '</th>').join('');
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Day-Out-of-Days</title><style>' +
      'body{font-family:\'Courier New\',monospace;font-size:11px;margin:24px;color:#111}' +
      'h1{font-size:15px;letter-spacing:1px;margin-bottom:14px}' +
      'table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 6px;text-align:center;font-size:10px}' +
      'th{background:#111;color:#fff}td.name{text-align:left;font-weight:bold;min-width:110px}' +
      'td.w{background:#E8A33D;font-weight:bold}td.h{background:#eee;color:#999}td.cnt{font-weight:bold}' +
      '</style></head><body><h1>DAY-OUT-OF-DAYS REPORT</h1>' +
      '<table><thead><tr><th>Cast</th>' + headHtml + '<th>Drehtage</th><th>Spanne</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>' +
      '<p style="margin-top:14px;font-size:9px;color:#666">W = Drehtag (Work) &bull; H = Bereitschaft zwischen erstem und letztem Drehtag (Hold) &bull; Spanne = Tage von erstem bis letztem Einsatz</p>' +
      '</body></html>';
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html); w.document.close();
    setTimeout(() => w.print(), 400);
  }

  return (
    <Modal mob={mob} onClose={onClose} wide>
      <MHd title="DAY-OUT-OF-DAYS" sub="Wer arbeitet an welchem Drehtag -- Gagen-/Reiseplanung auf einen Blick" onClose={onClose} />
      {rows.length === 0 || days.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#7A7D83', fontSize: 12.5 }}>
          Noch keine Besetzung mit verknuepften Szenen vorhanden. Szenen bearbeiten und Besetzung
          verknuepfen (Feld "Besetzung (aus Liste verknuepfen)" im Szenen-Editor).
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginBottom: 14 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', minWidth: 120 }}>Besetzung</th>
                {days.map(d => <th key={d} style={thStyle}>T{d}</th>)}
                <th style={thStyle}>Tage</th>
                <th style={thStyle}>Spanne</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.person.id}>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700, color: '#F2F1EC' }}>{r.person.name}</td>
                  {r.cells.map((c, i) => (
                    <td key={i} style={{
                      ...tdStyle,
                      background: c === 'W' ? '#E8A33D' : c === 'H' ? '#1A1B1E' : 'transparent',
                      color: c === 'W' ? '#15120A' : c === 'H' ? '#5B5F66' : '#3F4147',
                      fontWeight: c === 'W' ? 700 : 400,
                    }}>{c || '-'}</td>
                  ))}
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#7FBF8F' }}>{r.workCount}</td>
                  <td style={{ ...tdStyle, color: '#7A7D83' }}>{r.span}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ fontSize: 10.5, color: '#5B5F66', marginBottom: 14, lineHeight: 1.6 }}>
        <span style={{ color: '#E8A33D', fontWeight: 700 }}>W</span> = Drehtag &bull;{' '}
        <span style={{ color: '#7A7D83' }}>H</span> = Bereitschaft zwischen erstem und letztem Einsatztag
      </div>
      <button onClick={printReport} style={{ ...pr(mob), width: '100%', justifyContent: 'center', padding: '11px' }}>
        <Ic n="Print" sz={14} cl="#15120A" />Als PDF drucken
      </button>
    </Modal>
  );
}

const thStyle = { border: '1px solid #2A2C30', padding: '6px 8px', background: '#0E0F11', color: '#C9CBD0', fontWeight: 700, fontSize: 10 };
const tdStyle = { border: '1px solid #2A2C30', padding: '6px 8px', textAlign: 'center' };
