// js/data/ai-tools-registry.js
// Registry weiterer KI-Werkzeuge (zusaetzlich zur bestehenden Vollanalyse in
// ai-analysis.js). Jedes Tool definiert, wie aus Skript/Szenen/Budget ein
// Prompt gebaut wird und ob das Ergebnis strukturiertes JSON (fuer
// "Uebernehmen"-Aktionen) oder freier Text ist.
//
// Alle Tools laufen ueber dieselbe OpenRouter-Verbindung wie die
// Vollanalyse (gleicher Key, gleiches Modell aus den Einstellungen).

async function runAiTool(promptText, apiKey, model, expectJson) {
  const key = (apiKey || '').trim();
  if (!key) throw new Error('Kein API-Key hinterlegt (Einstellungen -> KI).');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
      'HTTP-Referer': (typeof window !== 'undefined' ? window.location.origin : ''),
      'X-Title': 'Close-up Systems',
    },
    body: JSON.stringify({ model: model || DEFAULT_AI_MODEL, messages: [{ role: 'user', content: promptText }] }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const serverMsg = errBody.error?.message || errBody.message || '';
    if (res.status === 401) throw new Error('Authentifizierung fehlgeschlagen (401) -- API-Key in Einstellungen -> KI pruefen.' + (serverMsg ? ' (' + serverMsg + ')' : ''));
    throw new Error(serverMsg || ('Fehler ' + res.status));
  }
  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content || '').trim();
  if (!expectJson) return text;
  const cleaned = text.replace(/```json|```/g, '').trim();
  try { return JSON.parse(cleaned); }
  catch (e) {
    const m = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Ungueltige JSON-Antwort von der KI');
  }
}

// Kleine Helfer zum Zusammenfassen von Kontext fuer die Prompts
function scenesSummaryText(scenes) {
  return (scenes || []).slice(0, 60).map(s => s.number + '. ' + s.heading + ' (' + s.pages + 'S, Cast: ' + (s.cast || []).join(', ') + ')').join('\n');
}

const AI_TOOLS = [
  {
    id: 'formatter',
    label: 'Drehbuch-Formatierer',
    icon: 'FileT',
    needsScript: true,
    resultType: 'text',
    applyLabel: 'Formatiertes Skript uebernehmen',
    description: 'Formatiert rohen/unsauberen Text ins korrekte Drehbuchformat (Szenenueberschriften, Charaktere, Dialog, Regieanweisungen).',
    buildPrompt: ({ script }) =>
      'Formatiere den folgenden Text als sauberes, professionelles Drehbuch im deutschen/internationalen Standardformat ' +
      '(Szenenueberschriften wie "1 INT. ORT - TAG", Charakternamen in Grossbuchstaben zentriert vor Dialog, ' +
      'Regieanweisungen in Klammern, normale Aktionsbeschreibung). Gib NUR den formatierten Text zurueck, ' +
      'keine Erklaerung, keine Codebloecke.\n\n' + script.content.slice(0, 6000),
  },
  {
    id: 'breakdown',
    label: 'Automatisches Script-Breakdown',
    icon: 'Wrench',
    needsScript: true,
    resultType: 'json-breakdown',
    applyLabel: 'Vorschlaege uebernehmen',
    description: 'Erkennt benoetigtes Equipment, Requisiten, Fahrzeuge und Kostueme im Skript und schlaegt neue Eintraege vor.',
    buildPrompt: ({ script }) =>
      'Analysiere dieses Drehbuch auf benoetigte Ressourcen. Antworte NUR mit JSON:\n' +
      '{"equipment":[{"name":"","category":"Kamera|Ton|Licht|Grip|Buehne|Fahrzeug|Sonstiges","reason":""}],' +
      '"props":[{"name":"","scene":""}],"costumes":[{"name":"","character":""}]}\n\n' + script.content.slice(0, 6000),
  },
  {
    id: 'budget-estimate',
    label: 'KI-Budgetschaetzung',
    icon: 'Dollar',
    needsScenes: true,
    resultType: 'json-budget',
    applyLabel: 'Posten uebernehmen',
    description: 'Schlaegt Budgetposten mit Betraegen vor, basierend auf Szenenanzahl, Seiten, Locations und Cast-Groesse.',
    buildPrompt: ({ scenes }) =>
      'Hier ist die Szenenliste einer Filmproduktion:\n' + scenesSummaryText(scenes) +
      '\n\nSchaetze realistische Budgetposten (in EUR, deutsche Independent-/Low-Budget-Produktion). Antworte NUR mit JSON:\n' +
      '{"items":[{"category":"Kamera|Ton|Licht|Besetzung|Location|Postproduktion|Sonstiges","item":"","amount":0,"notes":""}]}',
  },
  {
    id: 'schedule-optimizer',
    label: 'Drehplan-Optimierung',
    icon: 'Cal',
    needsScenes: true,
    resultType: 'text',
    description: 'Schlaegt eine guenstigere Reihenfolge/Gruppierung der Drehtage vor, um Location- und Cast-Wechsel zu minimieren.',
    buildPrompt: ({ scenes }) =>
      'Hier ist die aktuelle Szenenliste mit Drehtagen:\n' + scenesSummaryText(scenes) +
      '\n\nSchlage eine effizientere Gruppierung/Reihenfolge vor, um Location- und Besetzungswechsel zu minimieren. ' +
      'Antworte in kurzen, konkreten Stichpunkten auf Deutsch.',
  },
  {
    id: 'scene-summaries',
    label: 'Szenen-Zusammenfassungen',
    icon: 'Layers',
    needsScript: true,
    resultType: 'text',
    description: 'Erstellt eine kurze Ein-Satz-Zusammenfassung fuer jede Szene (nuetzlich fuer Stripboard/One-Liner).',
    buildPrompt: ({ script }) =>
      'Erstelle fuer jede Szene in diesem Drehbuch eine Ein-Satz-Zusammenfassung im Format "Sz. <Nummer>: <Zusammenfassung>". ' +
      'Antworte auf Deutsch, eine Zeile pro Szene.\n\n' + script.content.slice(0, 6000),
  },
  {
    id: 'dialogue-polish',
    label: 'Dialog-Politur',
    icon: 'Edit',
    needsScript: true,
    resultType: 'text',
    description: 'Schlaegt natuerlichere, praegnantere Formulierungen fuer die Dialoge vor.',
    buildPrompt: ({ script }) =>
      'Lies die Dialoge in diesem Drehbuch. Schlage fuer die 8-10 auffaelligsten Zeilen natuerlichere oder ' +
      'praegnantere Alternativformulierungen vor. Format: "Original: ... -> Vorschlag: ...". Auf Deutsch.\n\n' + script.content.slice(0, 6000),
  },
  {
    id: 'consistency-check',
    label: 'Konsistenz-Check',
    icon: 'Ok',
    needsScript: true,
    resultType: 'text',
    description: 'Findet uneinheitliche Charakternamen, Zeitfehler und Kontinuitaetsprobleme.',
    buildPrompt: ({ script }) =>
      'Pruefe dieses Drehbuch auf Konsistenzprobleme: uneinheitliche Schreibweisen von Charakternamen, ' +
      'Widersprueche bei Tageszeit/Datum, offensichtliche Kontinuitaetsfehler. Liste konkrete Fundstellen auf Deutsch.\n\n' + script.content.slice(0, 6000),
  },
  {
    id: 'logline-generator',
    label: 'Logline & Pitch',
    icon: 'AI',
    needsScript: true,
    resultType: 'text',
    description: 'Generiert mehrere Logline- und Kurzpitch-Varianten fuer Foerderantraege/Vorstellungen.',
    buildPrompt: ({ script }) =>
      'Erstelle 3 verschiedene Logline-Varianten (je max. 2 Saetze) und einen 3-Satz-Pitch fuer dieses Drehbuch, auf Deutsch.\n\n' + script.content.slice(0, 4000),
  },
  {
    id: 'title-suggestions',
    label: 'Titel-Vorschlaege',
    icon: 'Book',
    needsScript: true,
    resultType: 'text',
    description: 'Schlaegt alternative, wirkungsvolle Filmtitel basierend auf Inhalt und Ton vor.',
    buildPrompt: ({ script }) =>
      'Schlage 8 alternative Filmtitel fuer dieses Drehbuch vor (kurz, wirkungsvoll, zum Ton passend). Auf Deutsch, als Liste.\n\n' + script.content.slice(0, 4000),
  },
  {
    id: 'tone-genre',
    label: 'Genre- & Ton-Analyse',
    icon: 'Film',
    needsScript: true,
    resultType: 'text',
    description: 'Ordnet Genre und Tonalitaet ein und nennt vergleichbare Filme/Referenzen.',
    buildPrompt: ({ script }) =>
      'Analysiere Genre und Tonalitaet dieses Drehbuchs. Nenne 3-5 vergleichbare Filme/Referenzen und erklaere kurz warum. Auf Deutsch.\n\n' + script.content.slice(0, 5000),
  },
  {
    id: 'content-rating',
    label: 'Altersfreigabe-Einschaetzung',
    icon: 'Info',
    needsScript: true,
    resultType: 'text',
    description: 'Schaetzt eine plausible Altersfreigabe (FSK-Orientierung) und nennt relevante Inhaltshinweise.',
    buildPrompt: ({ script }) =>
      'Schaetze anhand des Inhalts eine plausible FSK-Alterseinstufung (0/6/12/16/18) fuer dieses Drehbuch ein und ' +
      'begruende dies kurz anhand von Gewalt, Sprache, Angst-/Bedrohungsgehalt. Auf Deutsch. WICHTIG: nur eine ' +
      'unverbindliche Einschaetzung, keine offizielle Bewertung.\n\n' + script.content.slice(0, 5000),
  },
  {
    id: 'callsheet-notes',
    label: 'Call-Sheet-Hinweise',
    icon: 'Clap',
    needsScenes: true,
    needsDayInput: true,
    resultType: 'text',
    description: 'Erstellt Sicherheits-/Wetter-/Sonderhinweise fuer einen bestimmten Drehtag basierend auf dessen Szenen.',
    buildPrompt: ({ scenes, dayInput }) => {
      const dayScenes = (scenes || []).filter(s => String(s.day) === String(dayInput));
      const list = dayScenes.map(s => s.number + '. ' + s.heading + ' (' + s.location + ')').join('\n') || '(keine Szenen an diesem Tag gefunden)';
      return 'Hier sind die Szenen von Drehtag ' + dayInput + ':\n' + list +
        '\n\nErstelle kurze, konkrete Hinweise fuers Call Sheet (Sicherheit, moegliche Wetterabhaengigkeit bei ' +
        'Aussendrehs, Besonderheiten). Auf Deutsch, Stichpunkte.';
    },
  },
  {
    id: 'translate-pitch',
    label: 'Uebersetzung (Logline/Pitch)',
    icon: 'Ref',
    needsScript: true,
    needsLangInput: true,
    resultType: 'text',
    description: 'Uebersetzt eine Kurzfassung (Logline + Pitch) in eine andere Sprache, z.B. fuer internationale Einreichungen.',
    buildPrompt: ({ script, langInput }) =>
      'Erstelle eine Logline (1-2 Saetze) und einen kurzen Pitch (3-4 Saetze) fuer dieses Drehbuch UND uebersetze ' +
      'beides ins ' + (langInput || 'Englische') + '. Gib zuerst die deutsche, dann die uebersetzte Fassung aus.\n\n' + script.content.slice(0, 4000),
  },
];
