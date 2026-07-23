// js/core/tokens.js
// Design-Tokens: Farben, Status-Konstanten, wiederverwendbare Style-Objekte.

const UC = { A: '#E8A33D', B: '#4FA3D1', C: '#7FBF8F', D: '#C97FBF' }; // Unit-Farben

const STATS = ['Planned', 'In Progress', 'Completed', 'Blocked'];
const SDOT = { 'Planned': '#5B5F66', 'In Progress': '#E8A33D', 'Completed': '#7FBF8F', 'Blocked': '#D16B5C' };

const TSTAT = ['Geplant', 'Klappe', 'Fertig', 'NG'];
const TDOT = { 'Geplant': '#5B5F66', 'Klappe': '#E8A33D', 'Fertig': '#7FBF8F', 'NG': '#D16B5C' };

const SHOT_T = ['EWS', 'WS', 'MS', 'CU', 'ECU', 'OTS', '2-Shot', 'POV', 'Insert', 'Aerial'];
const PCOL = ['#E8A33D', '#4FA3D1', '#7FBF8F', '#C97FBF', '#D16B5C', '#5BA8D1'];

// Sticky-Note Farbschemata
const NBG = { y: '#221D00', p: '#220A14', g: '#08180A', b: '#080F1E', l: '#140820' };
const NAC = { y: '#E8A33D', p: '#D16B9F', g: '#7FBF8F', b: '#4FA3D1', l: '#A87FBF' };

// Basis-Style-Objekt fuer Icon-Buttons ohne Rahmen
const S0 = {
  background: 'transparent', border: 'none', color: '#8A8D93', cursor: 'pointer',
  padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center',
};

// Input-Feld
const inp = (m, ex) => ({
  width: '100%', background: '#0F1011', border: '1px solid #2A2C30', borderRadius: 8,
  padding: m ? '12px' : '9px 10px', color: '#E7E6E2',
  fontFamily: "'IBM Plex Mono',monospace", fontSize: m ? 15 : 13,
  outline: 'none', boxSizing: 'border-box', ...ex,
});

// Ghost-Button (Rahmen, transparenter Hintergrund)
const gh = (m) => ({
  background: 'transparent', border: '1px solid #2A2C30', color: '#C9CBD0', borderRadius: 8,
  padding: m ? '11px 14px' : '7px 13px', fontFamily: "'IBM Plex Mono',monospace",
  fontSize: m ? 13 : 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
});

// Primary-Button (Akzentfarbe gefuellt)
const pr = (m) => ({
  background: '#E8A33D', border: 'none', color: '#15120A', borderRadius: 8,
  padding: m ? '12px 18px' : '7px 14px', fontFamily: "'IBM Plex Mono',monospace",
  fontSize: m ? 13 : 11.5, fontWeight: 700, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6,
});
