// js/core/parser.js
// Drehbuch-Parser: erkennt Szenenueberschriften (INT/EXT ... TAG/NACHT) und
// zerlegt Text in formatierte Bloecke (Szene, Charakter, Dialog, Aktion...)
// fuer den Skript-Viewer.

const HR = /^\s*(\d+[A-Za-z]?)?\.?\s*(INT|EXT|INT\/EXT|I\/E)\.?\s*[.\-]?\s*(.+?)\s*[-]\s*(TAG|NACHT|DAY|NIGHT|MORGEN|ABEND|DAWN|DUSK)\s*$/i;
const CR = /^\s*([A-Z][A-Z\s.\-']{1,28})\s*(\(.*\))?\s*$/;
const NON_CHAR = new Set(['CUT TO', 'FADE IN', 'FADE OUT', 'SCHNITT', 'ENDE', 'TITEL', 'CONTINUED', 'ABBLENDE']);

// Erkennt Szenen im Rohtext und liefert ein Array von Szenen-Objekten
// mit geschaetzter Seitenzahl/Dauer und automatisch erkanntem Cast.
function parseScenesFromText(txt) {
  const lines = txt.split(/\r?\n/);
  const scenes = [];
  let cur = null, n = 0, lineBuf = 0;

  function flush() {
    if (!cur) return;
    cur.pages = Math.max(0.125, Math.round((lineBuf / 55) * 8) / 8);
    cur.duration = Math.max(1, Math.round(cur.pages * 9));
    cur.cast = [...cur._castSet];
    delete cur._castSet;
    scenes.push(cur);
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const hm = line.match(HR);
    if (hm) {
      flush();
      n++;
      const [, num, ie, loc, time] = hm;
      const normTime = /TAG|DAY/i.test(time) ? 'DAY' : /NACHT|NIGHT/i.test(time) ? 'NIGHT' : time.toUpperCase();
      cur = {
        id: 'p' + Date.now() + n,
        number: num ? num.replace('.', '') : String(n),
        heading: ie.toUpperCase() + '. ' + loc.trim().toUpperCase() + ' - ' + normTime,
        location: loc.trim(),
        _castSet: new Set(),
        unit: 'A', status: 'Planned', day: n,
        tags: normTime === 'NIGHT' ? ['nacht'] : [],
      };
      lineBuf = 0;
      continue;
    }
    if (cur) {
      lineBuf++;
      const cm = line.match(CR);
      if (cm) {
        const name = cm[1].trim();
        if (name.length >= 2 && !NON_CHAR.has(name) && !/^\d+$/.test(name)) {
          cur._castSet.add(name);
        }
      }
    }
  }
  flush();
  return scenes;
}

// Zerlegt Rohtext in typisierte Bloecke fuer die formatierte Anzeige
// im Skript-Viewer (Szenenueberschrift, Charaktername, Dialog, Regieanweisung
// in Klammern, Aktionsbeschreibung, Uebergang).
function parseScriptBlocks(txt) {
  const lines = txt.split(/\r?\n/);
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i], line = raw.trim();
    if (!line) continue;
    const indent = (raw.match(/^(\s*)/) || ['', ''])[1].length;

    if (line.match(HR)) { blocks.push({ type: 'scene', text: line, id: 'b' + i }); continue; }
    if (indent >= 20 && line.match(CR) && !NON_CHAR.has(line)) { blocks.push({ type: 'char', text: line }); continue; }
    if (indent >= 14) {
      blocks.push({ type: line.match(/^\(.*\)$/) ? 'paren' : 'dial', text: line });
      continue;
    }
    if (/^(SCHNITT|CUT TO|FADE|ABBLENDE)/i.test(line)) { blocks.push({ type: 'trans', text: line }); continue; }
    blocks.push({ type: 'action', text: line });
  }
  return blocks;
}

function htmlToPlainText(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style').forEach(e => e.remove());
    return doc.body.innerText || '';
  } catch (e) {
    return html;
  }
}
