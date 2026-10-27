// PROTÓTIPO: TV inteiramente simulada. Não importa o Controller nem acessa a TV.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';

const port = Number(process.env.MEDIA_SESSION_PORT || 8768);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Porta inválida');
const lan = Object.values(networkInterfaces()).flat().filter(a => a?.family === 'IPv4' && !a.internal).map(a => a.address);
const hosts = new Set(['localhost', '127.0.0.1', ...lan].map(host => `${host}:${port}`));
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/manifest.webmanifest', ['manifest.webmanifest', 'application/manifest+json']],
  ...['icon.png', 'art-1.png', 'art-2.png', 'art-3.png'].map(name => [`/${name}`, [name, 'image/png']]),
  ...['silence.wav', 'tone.wav'].map(name => [`/${name}`, [name, 'audio/wav']]),
]);
const tracks = [
  { title: 'Marés de outubro', artist: 'TV simulada · Ensaio 1', artwork: '/art-1.png' },
  { title: 'Luzes da cidade', artist: 'TV simulada · Ensaio 2', artwork: '/art-2.png' },
  { title: 'Caminhos do vento', artist: 'TV simulada · Ensaio 3', artwork: '/art-3.png' },
];
let state = { available: true, playing: true, track: 0, position: 10, duration: 2700, at: Date.now(), revision: 1, target: randomUUID() };
let sequence = 0;
let discarded = 0;
const journal = [];
const timers = new Map();
const startedAt = new Date().toISOString();
function record(event, details = {}) {
  const entry = { seq: ++sequence, serverAt: new Date().toISOString(), event, ...details };
  journal.push(entry);
  if (journal.length > 2000) { journal.shift(); discarded++; }
  return entry;
}
function snapshot() {
  const position = Math.min(state.duration, state.position + (state.playing && state.available ? (Date.now() - state.at) / 1000 : 0));
  return { ...state, position, track: tracks[state.track], observedAt: new Date().toISOString() };
}
function send(peer, data) {
  if (peer.readyState !== WebSocket.OPEN) return;
  if (peer.bufferedAmount > 65536) return peer.close(1013, 'Conexão lenta');
  peer.send(JSON.stringify(data));
}
function broadcast(cause) {
  const current = snapshot();
  const entry = record('snapshot', { cause, state: current });
  for (const peer of wss.clients) if (peer.runId) send(peer, { type: 'state', state: current, seq: entry.seq });
}
function apply(action, position) {
  state.position = snapshot().position;
  state.at = Date.now();
  if (action === 'play') state.playing = true;
  if (action === 'pause') state.playing = false;
  if (action === 'end') { state.available = false; state.playing = false; state.target = randomUUID(); }
  if (action === 'start') { state.available = true; state.playing = true; state.position = 0; state.target = randomUUID(); }
  if (action === 'next' || action === 'previous') {
    state.track = (state.track + (action === 'next' ? 1 : 2)) % tracks.length;
    state.position = 0;
    state.target = randomUUID();
  }
  if (action === 'seek') state.position = position;
  state.revision++;
}
const server = createServer(async (req, res) => {
  if (!hosts.has(req.headers.host)) { res.writeHead(403); return res.end(); }
  const path = new URL(req.url, `http://${req.headers.host}`).pathname;
  const file = files.get(path);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; media-src 'self'; connect-src 'self' ws://${req.headers.host}; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`);
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  if (!file) { res.writeHead(404); return res.end('Não encontrado'); }
  try {
    const bytes = await readFile(new URL(file[0], import.meta.url));
    res.setHeader('Content-Type', file[1]);
    res.setHeader('Accept-Ranges', 'bytes');
    // Safari pode consultar bytes=0-1 antes de iniciar o WAV.
    if (req.headers.range) {
      const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      const start = range ? Number(range[1]) : -1;
      const end = range?.[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
      if (!Number.isSafeInteger(start) || start < 0 || start >= bytes.length || !Number.isSafeInteger(end) || end < start) {
        res.writeHead(416, { 'Content-Range': `bytes */${bytes.length}` }); return res.end();
      }
      res.writeHead(206, { 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${bytes.length}` });
      res.end(req.method === 'HEAD' ? undefined : bytes.subarray(start, end + 1));
    } else {
      res.writeHead(200, { 'Content-Length': bytes.length });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    }
  } catch { res.writeHead(500); res.end('Arquivo de teste indisponível'); }
});
const wss = new WebSocketServer({ noServer: true, maxPayload: 8192 });
server.on('upgrade', (req, socket, head) => {
  if (!hosts.has(req.headers.host) || req.url !== '/lab' || req.headers.origin !== `http://${req.headers.host}`) {
    socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    return;
  }
  wss.handleUpgrade(req, socket, head, peer => wss.emit('connection', peer));
});
wss.on('connection', peer => {
  const helloTimeout = setTimeout(() => peer.close(1008, 'Sem identificação de ensaio'), 5000);
  peer.on('error', () => {});
  peer.on('close', () => { clearTimeout(helloTimeout); if (peer.runId) record('disconnected', { runId: peer.runId, role: peer.role }); });
  peer.on('message', (bytes, binary) => {
    let msg;
    try { if (binary) throw new Error(); msg = JSON.parse(bytes.toString()); } catch { return peer.close(1008, 'JSON inválido'); }
    if (!msg || typeof msg !== 'object' || Array.isArray(msg)) return peer.close(1008, 'Mensagem inválida');
    if (msg.type === 'hello' && !peer.runId && typeof msg.runId === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(msg.runId) && ['phone', 'operator'].includes(msg.role)) {
      clearTimeout(helloTimeout);
      peer.runId = msg.runId;
      peer.role = msg.role;
      record('connected', { runId: peer.runId, role: peer.role });
      send(peer, { type: 'hello', serverStartedAt: startedAt, state: snapshot() });
      return;
    }
    if (!peer.runId) return peer.close(1008, 'Identifique o ensaio');
    if (!Number.isSafeInteger(msg.id) || msg.id < 1) return;
    if (msg.type === 'journal') {
      return send(peer, { type: 'journal', id: msg.id, startedAt, discarded, entries: journal.filter(e => !e.runId || e.runId === peer.runId || e.role === 'operator') });
    }
    if (msg.type === 'cancel-scheduled' && peer.role === 'operator') {
      for (const timer of timers.values()) clearTimeout(timer);
      const count = timers.size;
      timers.clear();
      record('schedule-cancelled', { runId: peer.runId, role: peer.role, count });
      return send(peer, { type: 'ack', id: msg.id, serverAt: new Date().toISOString(), state: snapshot() });
    }
    const actions = peer.role === 'operator' ? ['play', 'pause', 'next', 'previous', 'seek', 'end', 'start'] : ['play', 'pause', 'next', 'previous', 'seek'];
    const delay = msg.delay ?? 0;
    const validSource = peer.role === 'operator' ? msg.source === 'operator' : ['page', 'media-session'].includes(msg.source);
    let reason;
    if (msg.type !== 'command' || !actions.includes(msg.action) || !validSource) reason = 'invalid-command';
    else if (!Number.isInteger(delay) || delay < 0 || delay > 900 || (peer.role !== 'operator' && delay !== 0)) reason = 'invalid-delay';
    else if (msg.action === 'seek' && (!Number.isFinite(msg.position) || msg.position < 0 || msg.position > state.duration)) reason = 'invalid-position';
    else if (peer.role !== 'operator' && (!state.available || msg.target !== state.target)) reason = 'stale-target';
    else if (!state.available && msg.action !== 'start') reason = 'no-session';
    else if (delay && timers.size >= 20) reason = 'schedule-full';
    if (reason) {
      record('rejected', { runId: peer.runId, role: peer.role, commandId: msg.id, reason });
      return send(peer, { type: 'failed', id: msg.id, reason, serverAt: new Date().toISOString() });
    }
    record('command-received', { runId: peer.runId, role: peer.role, commandId: msg.id, source: msg.source, action: msg.action, delay, target: msg.target });
    if (delay) {
      const scheduleId = randomUUID();
      const timer = setTimeout(() => {
        timers.delete(scheduleId);
        if (!state.available && msg.action !== 'start') return record('schedule-skipped', { scheduleId, reason: 'no-session' });
        apply(msg.action, msg.position);
        record('scheduled-command-applied', { runId: peer.runId, role: peer.role, scheduleId, action: msg.action });
        broadcast('scheduled-command');
      }, delay * 1000);
      timers.set(scheduleId, timer);
      return send(peer, { type: 'scheduled', id: msg.id, scheduleId, dueAt: new Date(Date.now() + delay * 1000).toISOString() });
    }
    apply(msg.action, msg.position);
    const entry = record('command-applied', { runId: peer.runId, role: peer.role, commandId: msg.id, source: msg.source, action: msg.action, state: snapshot() });
    send(peer, { type: 'ack', id: msg.id, serverAt: entry.serverAt, state: entry.state });
    broadcast('command');
  });
});
setInterval(() => broadcast('heartbeat'), 5000);
server.listen(port, '0.0.0.0', () => {
  console.log(`Protótipo Media Session · http://localhost:${port}/`);
  for (const address of lan) console.log(`iPhone: http://${address}:${port}/  | Operador: http://${address}:${port}/?operator=1`);
  console.log('TV simulada. Estado/relatórios somente em memória. Ctrl+C encerra.');
});
