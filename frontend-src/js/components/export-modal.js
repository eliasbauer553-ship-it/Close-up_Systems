// js/components/export-modal.js
// Export in fuenf Formaten: PDF-Drehplan (Druckdialog), Excel, CSV, iCal, Google Kalender.

function toIcalDate(d) { return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; }

function ExportModal({ scenes, name, onClose, mob }) {
  const [projName, setProjName] = React.useState(name || 'Mein Film');
  const [fmt, setFmt] = React.useState('pdf');

  const formats = [
    { id: 'pdf', ic: 'Print', lbl: 'PDF Drehplan', sub: 'Pro Drehtag, druckoptimiert' },
    { id: 'excel', ic: 'Tbl', lbl: 'Excel (.xlsx)', sub: 'Filterbar, alle Felder' },
    { id: 'csv', ic: 'FileT', lbl: 'CSV', sub: 'Universelles Format' },
    { id: 'ical', ic: 'ICal', lbl: 'iCal Export', sub: 'Kalender-App / iPhone' },
    { id: 'gcal', ic: 'GCal', lbl: 'Google Kalender', sub: 'Im Browser oeffnen' },
  ];

  function groupByDay() {
    const byDay = {};
    scenes.forEach(s => { (byDay[s.day] || (byDay[s.day] = [])).push(s); });
    return byDay;
  }

  function doExport() {
    if (fmt === 'csv') {
      const header = ['#', 'Ueberschrift', 'Location', 'Seiten', 'Dauer', 'Cast', 'Unit', 'Status', 'Drehtag'];
      const rows = scenes.map(s => [s.number, s.heading, s.location, s.pages, s.duration, s.cast.join('; '), s.unit, s.status, s.day]);
      const csv = [header, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' }));
      a.download = 'drehplan.csv'; a.click();
    } else if (fmt === 'excel') {
      const rows = scenes.map(s => ({
        'Szene #': s.number, 'Ueberschrift': s.heading, 'Location': s.location, 'Seiten': s.pages,
        'Dauer': s.duration, 'Cast': s.cast.join('; '), 'Unit': s.unit, 'Status': s.status, 'Drehtag': s.day,
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Drehplan');
      XLSX.writeFile(workbook, 'drehplan.xlsx');
    } else if (fmt === 'ical') {
      const byDay = groupByDay();
      const base = new Date(); base.setHours(8, 0, 0, 0);
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Close-up Systems//DE', 'X-WR-CALNAME:' + projName + ' Drehplan', 'CALSCALE:GREGORIAN'];
      Object.entries(byDay).sort(([a], [b]) => +a - +b).forEach(([day, ds]) => {
        const d = new Date(base); d.setDate(d.getDate() + (+day - 1));
        const mn = ds.reduce((a, s) => a + s.duration, 0);
        const end = new Date(d.getTime() + (mn + 60) * 60000);
        lines.push('BEGIN:VEVENT', 'DTSTART:' + toIcalDate(d), 'DTEND:' + toIcalDate(end),
          'SUMMARY:' + projName + ' - Drehtag ' + day, 'DESCRIPTION:Szenen: ' + ds.map(s => s.number).join(', '),
          'UID:cu' + day + Date.now() + '@cu', 'END:VEVENT');
      });
      lines.push('END:VCALENDAR');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8;' }));
      a.download = projName.toLowerCase().replace(/\s+/g, '-') + '-drehplan.ics'; a.click();
    } else if (fmt === 'gcal') {
      const byDay = groupByDay();
      const days = Object.keys(byDay).sort((a, b) => +a - +b);
      if (!days.length) return;
      const base = new Date(); base.setDate(base.getDate() + 7); base.setHours(8, 0, 0, 0);
      const ds = byDay[days[0]];
      const mn = ds.reduce((a, s) => a + s.duration, 0);
      const end = new Date(base.getTime() + (mn + 60) * 60000);
      const params = new URLSearchParams({
        action: 'TEMPLATE', text: projName + ' - Drehtag ' + days[0],
        dates: toIcalDate(base) + '/' + toIcalDate(end), details: 'Szenen: ' + ds.map(s => s.number).join(', '),
      });
      window.open('https://calendar.google.com/calendar/render?' + params, '_blank');
    } else {
      const byDay = groupByDay();
      const days = Object.keys(byDay).sort((a, b) => +a - +b);
      const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + projName + '</title><style>' +
        'body{font-family:\'Courier New\',monospace;font-size:11px;margin:28px;color:#111;line-height:1.4}' +
        'h1{font-size:16px;letter-spacing:2px;margin-bottom:3px}.sub{font-size:9px;color:#666;margin-bottom:20px}' +
        '.dh{font-size:12px;font-weight:bold;border-bottom:2px solid #111;padding-bottom:3px;margin-top:18px;margin-bottom:5px;text-transform:uppercase}' +
        '.dm{font-size:9px;color:#555;margin-bottom:5px}table{width:100%;border-collapse:collapse}' +
        'th{background:#111;color:#fff;padding:4px 7px;text-align:left;font-size:9px}' +
        'td{padding:4px 7px;border-bottom:1px solid #ddd;font-size:10px;vertical-align:top}tr:nth-child(even) td{background:#f8f8f8}' +
        '</style></head><body><h1>DREHPLAN - ' + projName.toUpperCase() + '</h1>' +
        '<div class="sub">' + new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' - ' + scenes.length + ' Szenen</div>' +
        days.map(d => {
          const ds = byDay[d];
          const pg = ds.reduce((a, s) => a + s.pages, 0).toFixed(2);
          const mn = ds.reduce((a, s) => a + s.duration, 0);
          return '<div class="dh">DREHTAG ' + d + '</div><div class="dm">' + ds.length + ' Sz - ' + pg + 'S - ' + Math.floor(mn / 60) + 'h' + (mn % 60) + 'm</div>' +
            '<table><thead><tr><th>#</th><th>SZENE</th><th>ORT</th><th>CAST</th><th>S.</th><th>MIN</th><th>UNIT</th><th>STATUS</th></tr></thead><tbody>' +
            ds.map(s => '<tr><td>' + s.number + '</td><td>' + s.heading + '</td><td>' + s.location + '</td><td>' + s.cast.join(', ') + '</td><td>' + s.pages + '</td><td>' + s.duration + '</td><td>' + s.unit + '</td><td>' + s.status + '</td></tr>').join('') +
            '</tbody></table>';
        }).join('') + '</body></html>';
      const w = window.open('', '_blank', 'width=900,height=700');
      w.document.write(html); w.document.close();
      setTimeout(() => w.print(), 500);
    }
    onClose();
  }

  return (
    <Modal mob={mob} onClose={onClose}>
      <MHd title="EXPORTIEREN" onClose={onClose} />
      <Fld lbl="Produktionsname"><input style={inp(mob)} value={projName} onChange={e => setProjName(e.target.value)} /></Fld>
      <div style={{ margin: '12px 0 8px', fontSize: 10, color: '#8A8D93', letterSpacing: .8, textTransform: 'uppercase' }}>Format</div>
      {formats.map(f => (
        <div key={f.id} onClick={() => setFmt(f.id)} style={{
          border: '1px solid ' + (fmt === f.id ? '#E8A33D' : '#2A2C30'), background: fmt === f.id ? '#1A1710' : 'transparent',
          borderRadius: 9, padding: '11px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, marginBottom: 7,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: fmt === f.id ? '#2A2010' : '#1A1B1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic n={f.ic} sz={14} cl={fmt === f.id ? '#E8A33D' : '#8A8D93'} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: fmt === f.id ? '#F2F1EC' : '#C9CBD0' }}>{f.lbl}</div>
            <div style={{ fontSize: 10.5, color: '#7A7D83', marginTop: 2 }}>{f.sub}</div>
          </div>
          {fmt === f.id && <Ic n="Ok" sz={14} cl="#E8A33D" st={{ marginLeft: 'auto' }} />}
        </div>
      ))}
      <button onClick={doExport} style={{ ...pr(mob), width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}>
        <Ic n="FileDn" sz={14} cl="#15120A" />Exportieren
      </button>
    </Modal>
  );
}
