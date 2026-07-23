// js/data/demo-data.js
// Beispielprojekt "Franz Weiss", das beim ersten Start angelegt wird,
// damit die App nicht leer aussieht.

const DEMO_SCRIPT_TEXT =
  'FRANZ WEISS\nEin Drama - 45 Minuten\n\n' +
  '1 INT. WOHNUNG - KUECHE - TAG\n\nFranz Weiss (48) sitzt am Kuechentisch.\n\n' +
  '                    ANNA (O.S.)\n            Franz!\n\n' +
  '                    FRANZ\n                    (ohne aufzublicken)\n            Ich hab nachgedacht.\n\n' +
  '2 INT. WOHNUNG - FLUR - TAG\n\nFranz zieht seinen Mantel an.\n\n' +
  '3 EXT. BERLINER STRASSE - TAG\n\nHerbst. Franz geht.\n\n' +
  '4 INT. BUERO SCHULTE - TAG\n\nSCHULTE (58) hinter Glastisch.\n\n' +
  '                    SCHULTE\n            Das reicht nicht.\n\n' +
  '                    FRANZ\n            Dann sind wir fertig.\n\n' +
  '5 EXT. PARKPLATZ - TAG\n\nFranz sitzt im Auto. Er weint. Still.\n\nSCHNITT AUF:\n\n' +
  '6 INT. CAFE KAISER - TAG\n\nLENA (38) am Ecktisch.\n\n' +
  '                    LENA\n            Du siehst schlimm aus.\n\n' +
  '7 EXT. BRUECKE - ABEND\n\nFranz schaut auf das Wasser. Dann geht er.\n\n' +
  '8 INT. WOHNUNG - KUECHE - NACHT\n\nFranz schreibt in ein leeres Heft.\n\nABBLENDE.\n\nENDE';

// Hinweis zu castIds/locationId/equipmentIds: Diese Felder verknuepfen eine
// Szene mit echten Datensaetzen aus Besetzung/Motive/Equipment (per ID) --
// zusaetzlich zu den bestehenden Freitextfeldern `cast`/`location`, die aus
// Kompatibilitaetsgruenden erhalten bleiben. Siehe scene-board.js (SceneModal).
const DEMO_SCENES = [
  { id: 's1', number: '1', heading: 'INT. WOHNUNG - KUECHE - TAG', pages: 2, duration: 16, cast: ['Franz Weiss', 'Anna'], location: 'Wohnung / Kueche', unit: 'A', status: 'Planned', day: 1, tags: ['dialog'], castIds: ['c1', 'c2'], locationId: 'l1', equipmentIds: ['eq2'] },
  { id: 's2', number: '2', heading: 'INT. WOHNUNG - FLUR - TAG', pages: 0.5, duration: 4, cast: ['Franz Weiss'], location: 'Wohnung / Flur', unit: 'A', status: 'Planned', day: 1, tags: [], castIds: ['c1'], locationId: 'l1', equipmentIds: [] },
  { id: 's3', number: '3', heading: 'EXT. BERLINER STRASSE - TAG', pages: 1, duration: 8, cast: ['Franz Weiss'], location: 'Berliner Strasse', unit: 'A', status: 'Planned', day: 1, tags: ['aussen'], castIds: ['c1'], locationId: 'l2', equipmentIds: ['eq1'] },
  { id: 's4', number: '4', heading: 'INT. BUERO SCHULTE - TAG', pages: 2, duration: 16, cast: ['Franz Weiss', 'Schulte'], location: 'Buero Schulte', unit: 'A', status: 'In Progress', day: 2, tags: ['dialog', 'key'], castIds: ['c1', 'c4'], locationId: 'l3', equipmentIds: ['eq1', 'eq3'] },
  { id: 's5', number: '5', heading: 'EXT. PARKPLATZ - TAG', pages: 1, duration: 8, cast: ['Franz Weiss'], location: 'Parkplatz', unit: 'A', status: 'In Progress', day: 2, tags: ['emotional'], castIds: ['c1'], locationId: '', equipmentIds: ['eq1'] },
  { id: 's6', number: '6', heading: 'INT. CAFE KAISER - TAG', pages: 3, duration: 22, cast: ['Franz Weiss', 'Lena'], location: 'Cafe Kaiser', unit: 'B', status: 'Planned', day: 3, tags: ['dialog', 'key'], castIds: ['c1', 'c3'], locationId: 'l4', equipmentIds: ['eq2', 'eq4'] },
  { id: 's7', number: '7', heading: 'EXT. BRUECKE - ABEND', pages: 1.5, duration: 11, cast: ['Franz Weiss'], location: 'Spree-Bruecke', unit: 'B', status: 'Planned', day: 3, tags: ['aussen'], castIds: ['c1'], locationId: '', equipmentIds: ['eq1', 'eq4'] },
  { id: 's8', number: '8', heading: 'INT. WOHNUNG - KUECHE - NACHT', pages: 1.5, duration: 11, cast: ['Franz Weiss'], location: 'Wohnung / Kueche', unit: 'A', status: 'Completed', day: 4, tags: ['abschluss'], castIds: ['c1'], locationId: 'l1', equipmentIds: ['eq2', 'eq3'] },
];

const DEMO_TAKES = [
  { id: 'tk1', sceneId: 's4', sceneNumber: '4', sceneHeading: 'INT. BUERO SCHULTE - TAG', takeNum: 1, status: 'NG', note: 'Kamera-Problem', time: '09:20' },
  { id: 'tk2', sceneId: 's4', sceneNumber: '4', sceneHeading: 'INT. BUERO SCHULTE - TAG', takeNum: 2, status: 'Klappe', note: 'Perfekt', time: '09:44' },
  { id: 'tk3', sceneId: 's8', sceneNumber: '8', sceneHeading: 'INT. WOHNUNG - KUECHE - NACHT', takeNum: 1, status: 'Fertig', note: 'Bester Take', time: '18:30' },
];

const DEMO_SHOTS = [
  { id: 'sh1', sceneId: 's1', sceneNumber: '1', shotType: 'WS', angle: 'normal', movement: 'statisch', lens: '35mm', note: 'Kueche gesamt', status: 'Planned' },
  { id: 'sh2', sceneId: 's1', sceneNumber: '1', shotType: 'CU', angle: 'low', movement: 'statisch', lens: '85mm', note: 'Haende am Kaffee', status: 'Planned' },
  { id: 'sh3', sceneId: 's4', sceneNumber: '4', shotType: '2-Shot', angle: 'normal', movement: 'statisch', lens: '50mm', note: 'Franz & Schulte', status: 'In Progress' },
];

const DEMO_SCRIPT = {
  id: 'sc1', name: 'Franz Weiss - FINAL', type: 'text', content: DEMO_SCRIPT_TEXT,
  scenes: 8, pages: 7.5, uploadedAt: Date.now() - 86400000,
};

const DEMO_CAST = [
  { id: 'c1', name: 'Franz Weiss', role: 'Hauptrolle', age: '48', notes: 'Protagonist', scenes: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'], contact: '' },
  { id: 'c2', name: 'Anna', role: 'Nebenrolle', age: '45', notes: 'Ehefrau', scenes: ['s1', 's2'], contact: '' },
  { id: 'c3', name: 'Lena', role: 'Nebenrolle', age: '38', notes: 'Freundin', scenes: ['s6'], contact: '' },
  { id: 'c4', name: 'Schulte', role: 'Nebenrolle', age: '58', notes: 'Antagonist', scenes: ['s4'], contact: '' },
];

const DEMO_LOCATIONS = [
  { id: 'l1', name: 'Wohnung / Kueche', address: 'Musterstr. 1, Berlin', type: 'INT', notes: 'Altbau, 3. OG', scenes: ['s1', 's2', 's8'] },
  { id: 'l2', name: 'Berliner Strasse', address: 'Unter den Linden', type: 'EXT', notes: 'Herbst', scenes: ['s3'] },
  { id: 'l3', name: 'Buero Schulte', address: 'Potsdamer Platz 1', type: 'INT', notes: 'Modernes Buero', scenes: ['s4'] },
  { id: 'l4', name: 'Cafe Kaiser', address: 'Kurfuerstendamm 10', type: 'INT', notes: 'Wiener Kaffeehaus', scenes: ['s6'] },
];

// Equipment: name, Kategorie (Kamera/Ton/Licht/Grip/Sonstiges), Besitzer
// (wem gehoert es -- z.B. "Eigenbestand", "Verleih Firma X", "Privat: Name"),
// und `scenes`: Rueckverknuepfung zu den Szenen, in denen es gebraucht wird
// (bidirektional zu scene.equipmentIds gepflegt, siehe app.js).
const DEMO_EQUIPMENT = [
  { id: 'eq1', name: 'RED Dragon 6K', category: 'Kamera', owner: 'Verleih Cine-Rent', notes: 'Inkl. 2 Akkus, CFast-Karten', scenes: ['s3', 's4', 's5', 's7'] },
  { id: 'eq2', name: 'Zeiss CP.3 Objektiv-Set', category: 'Kamera', owner: 'Verleih Cine-Rent', notes: '25/50/85mm', scenes: ['s1', 's6', 's8'] },
  { id: 'eq3', name: 'Sennheiser MKH416 + Boom', category: 'Ton', owner: 'Eigenbestand', notes: 'Tonangel 3m', scenes: ['s4', 's8'] },
  { id: 'eq4', name: 'Aputure 300D Lichtset', category: 'Licht', owner: 'Eigenbestand', notes: '2x Leuchte + Softbox', scenes: ['s6', 's7'] },
];

const DEMO_BUDGET = [
  { id: 'b1', category: 'Kamera', item: 'RED Dragon 6K', amount: 1200, paid: false, notes: 'Tagesmiete' },
  { id: 'b2', category: 'Ton', item: 'Sound Mixer', amount: 450, paid: true, notes: '' },
  { id: 'b3', category: 'Besetzung', item: 'Hauptdarsteller', amount: 2000, paid: false, notes: '' },
  { id: 'b4', category: 'Location', item: 'Cafe Kaiser', amount: 300, paid: true, notes: 'Halbtagesmiete' },
];

function makeDemoProject(id, name, color) {
  return {
    id, name, color: color || '#E8A33D', desc: '', created: Date.now(),
    scenes: DEMO_SCENES.map(s => ({ ...s })),
    takes: DEMO_TAKES.map(t => ({ ...t })),
    scripts: [{ ...DEMO_SCRIPT }],
    shots: DEMO_SHOTS.map(s => ({ ...s })),
    notes: [],
    cast: DEMO_CAST.map(c => ({ ...c })),
    locations: DEMO_LOCATIONS.map(l => ({ ...l })),
    budget: DEMO_BUDGET.map(b => ({ ...b })),
    equipment: DEMO_EQUIPMENT.map(e => ({ ...e })),
    budgetTarget: 12000,
  };
}

function makeEmptyProject(id, name, color, desc) {
  return {
    id, name, color: color || '#E8A33D', desc: desc || '', created: Date.now(),
    scenes: [], takes: [], scripts: [], shots: [], notes: [], cast: [], locations: [], budget: [], equipment: [],
    budgetTarget: 0,
  };
}

// Cloud-Sync und KI sind von Anfang an aktiv -- kein Abstecher in die
// Einstellungen noetig, damit die App direkt nach dem Deploy vollstaendig
// funktioniert:
//  - syncMode:'cloud' mit leerer workerUrl => sync-client.js verwendet
//    automatisch die aktuelle Domain als API-Basis (der Worker liefert ja
//    Frontend UND API aus demselben Origin aus).
//  - aiProvider:'openrouter' mit vorausgefuelltem Free-Tier-Key, damit die
//    KI-Analyse direkt funktioniert. Der Key ist NUR im Browser gespeichert
//    (localStorage) und wird direkt an openrouter.ai gesendet.
//    Hinweis: In den Einstellungen jederzeit gegen einen eigenen Key
//    austauschbar, falls dieser abläuft oder ausgetauscht werden soll.
const DEFAULT_STATE = {
  v: 10,
  activeProjectId: 'p1',
  projects: [{ id: 'p1', name: 'Franz Weiss', color: '#E8A33D', desc: 'Drama - 45 Min.', created: Date.now() }],
  data: { p1: makeDemoProject('p1', 'Franz Weiss', '#E8A33D') },
  config: {
    apiKey: 'bbce7dce270cee0ddc165a22633addc25548d94d9468eb328f5a5d4a3c6a03fc',
    aiProvider: 'openrouter',
    aiModel: 'deepseek/deepseek-chat-v3-0324:free',
    accent: '#E8A33D', showTakes: true, compact: false,
    syncMode: 'cloud', workerUrl: '',
  },
};
