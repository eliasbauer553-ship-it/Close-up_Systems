// js/core/pdf.js
// Laedt PDF.js dynamisch (nur wenn tatsaechlich ein PDF verarbeitet wird)
// und stellt eine einfache Text-Extraktionsfunktion bereit.

function usePdfJs() {
  const [ready, setReady] = React.useState(!!window.pdfjsLib);
  React.useEffect(() => {
    if (window.pdfjsLib) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setReady(true);
    };
    document.head.appendChild(s);
  }, []);
  return ready;
}

async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map(i => i.str).join(' ') + '\n';
  }
  return text;
}
