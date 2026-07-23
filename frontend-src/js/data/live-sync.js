// js/data/live-sync.js
// Echtzeit-Synchronisierung ueber eine dauerhafte WebSocket-Verbindung zur
// Cloudflare-Worker-"SyncRoom" (Durable Object). Aenderungen werden dem
// Server per send() geschickt und erscheinen binnen Millisekunden bei allen
// anderen verbundenen Geraeten -- kein Nachfragen/Polling noetig.
//
// Verbindungsabbrueche werden automatisch mit steigendem Backoff neu
// verbunden; ein Ping alle 25s haelt die Verbindung durch
// Proxys/Load-Balancer hindurch am Leben.

function useLiveSync(enabled, baseUrl, onMessage) {
  const wsRef = React.useRef(null);
  const [connected, setConnected] = React.useState(false);
  const reconnectTimer = React.useRef(null);
  const pingTimer = React.useRef(null);
  const attemptRef = React.useRef(0);
  const onMessageRef = React.useRef(onMessage);
  onMessageRef.current = onMessage;

  React.useEffect(() => {
    if (!enabled) { setConnected(false); return; }
    let cancelled = false;

    function resolveWsUrl() {
      const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
      if (!origin || !/^https?:/.test(origin)) return null;
      return origin.replace(/^http/, 'ws').replace(/\/$/, '') + '/api/live';
    }

    function scheduleReconnect() {
      const delay = Math.min(15000, 1000 * Math.pow(1.6, attemptRef.current++));
      reconnectTimer.current = setTimeout(connect, delay);
    }

    function connect() {
      if (cancelled) return;
      const url = resolveWsUrl();
      if (!url) { setConnected(false); return; }

      let ws;
      try { ws = new WebSocket(url); } catch (e) { scheduleReconnect(); return; }
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        attemptRef.current = 0;
        setConnected(true);
        clearInterval(pingTimer.current);
        pingTimer.current = setInterval(() => {
          try { ws.send(JSON.stringify({ type: 'ping' })); } catch (e) {}
        }, 25000);
      };
      ws.onclose = () => {
        clearInterval(pingTimer.current);
        if (cancelled) return;
        setConnected(false);
        scheduleReconnect();
      };
      ws.onerror = () => { try { ws.close(); } catch (e) {} };
      ws.onmessage = (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch (e) { return; }
        if (msg.type === 'pong') return;
        onMessageRef.current(msg);
      };
    }

    connect();
    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer.current);
      clearInterval(pingTimer.current);
      try { wsRef.current?.close(); } catch (e) {}
    };
  }, [enabled, baseUrl]);

  // Sendet eine Nachricht, wenn die Verbindung aktuell steht.
  // Gibt false zurueck, wenn (noch) nicht verbunden -- der Aufrufer
  // sollte dann auf den REST-Fallback (SyncClient) ausweichen.
  const send = React.useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try { wsRef.current.send(JSON.stringify(msg)); return true; }
      catch (e) { return false; }
    }
    return false;
  }, []);

  return { connected, send };
}
