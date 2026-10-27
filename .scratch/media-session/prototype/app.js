// PROTÓTIPO. Nenhum módulo ou armazenamento do Controller de produção.
const $ = id => document.getElementById(id);
const operator = new URLSearchParams(location.search).get('operator') === '1';
const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const session = navigator.mediaSession;
const audio = $('audio');
const events = [];
const pending = new Map();
const supported = {};
const checks = [
  ['card', 'Cartão com título, capa e estado corretos'],
  ['lock1', 'Play/pause após 1 minuto bloqueado · até 5 s'],
  ['lock5', 'Play/pause após 5 minutos bloqueado · até 5 s'],
  ['lock15', 'Play/pause após 15 minutos bloqueado · até 5 s'],
  ['paused15', 'Retomar após 15 minutos pausado · até 5 s'],
  ['title', 'Mudança de título/estado pelo operador · até 5 s'],
  ['progress', 'Progresso correto e parado durante pausa'],
  ['wifi', 'Perda e retorno de Wi-Fi sem comandos antigos'],
  ['switch', 'Troca de app no iPhone'],
  ['call', 'Chamada sem comando involuntário na TV simulada'],
  ['music', 'Música/podcast sem disputa automática por controles'],
  ['stop', 'Desativar remove sessão e não pausa a TV simulada'],
];
for (const [id, title] of checks) {
  const label = document.createElement('label');
  label.textContent = title;
  const select = document.createElement('select');
  select.id = `check-${id}`;
  for (const value of ['Não avaliado', 'Passou', 'Falhou']) select.add(new Option(value, value));
  label.append(select);
  $('checks').append(label);
}
$('operator').hidden = !operator;
$('phone-controls').hidden = operator;
$('observations').hidden = operator;
const standalone = matchMedia('(display-mode: standalone)').matches;
$('capabilities').textContent = `Media Session: ${session ? 'disponível' : 'ausente'} · Contexto seguro: ${isSecureContext ? 'sim' : 'não'} · Standalone: ${standalone || navigator.standalone ? 'sim' : 'não'}`;
let socket;
let ready = false;
let tv;
let receivedAt = 0;
let nextId = 0;
let active = false;
let activatedOnce = false;
let epoch = 0;
let discardCount = 0;
let serverStartedAt;
let reconnect;
let lastArt;
let lastMetadataKey;
let downloadUrl;
let closing = false;
let audioAttempt = 0;
let startingAudio = 0;

function log(event, details = {}) {
  events.push({ at: new Date().toISOString(), elapsedMs: Math.round(performance.now()), event, visibility: document.visibilityState, ...details });
  if (events.length > 1500) { events.shift(); discardCount++; }
  $('events').textContent = events.slice(-16).map(e => JSON.stringify(e)).join('\n');
}
function say(message) { $('message').textContent = message; }
function error(event, reason) { log(event, { error: String(reason?.message || reason) }); }
function audioState() {
  $('audio-state').textContent = `Áudio auxiliar: ${audio.paused ? 'pausado' : 'tocando'} · muted=${audio.muted} · volume=${audio.volume} · posição=${audio.currentTime.toFixed(1)} s`;
}
for (const event of ['play', 'playing', 'pause', 'ended', 'error', 'waiting', 'stalled', 'suspend', 'emptied']) {
  audio.addEventListener(event, () => {
    log(`audio-${event}`, { paused: audio.paused, time: audio.currentTime, errorCode: audio.error?.code });
    audioState();
    // Eventos locais do áudio não enviam comandos à TV simulada.
  });
}
function failPending(reason) {
  for (const { reject, timeout } of pending.values()) { clearTimeout(timeout); reject(new Error(reason)); }
  pending.clear();
}
function request(message) {
  if (!ready || socket?.readyState !== WebSocket.OPEN) return Promise.reject(new Error('Simulador desconectado'));
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); log('request-timeout', { id, type: message.type }); reject(new Error('Sem confirmação após 5 segundos')); }, 5000);
    pending.set(id, { resolve, reject, timeout, sentAt: performance.now() });
    socket.send(JSON.stringify({ ...message, id }));
    log('request-sent', { id, ...message });
  });
}
function connect() {
  if (closing) return;
  socket = new WebSocket(`ws://${location.host}/lab`);
  log('connecting');
  socket.addEventListener('open', () => socket.send(JSON.stringify({ type: 'hello', runId, role: operator ? 'operator' : 'phone' })));
  socket.addEventListener('message', event => {
    let message;
    try { message = JSON.parse(event.data); } catch (e) { error('invalid-message', e); return; }
    if (message.type === 'hello') {
      serverStartedAt = message.serverStartedAt;
      ready = true;
      $('connection').textContent = 'Conectado ao simulador';
      log('connected', { serverStartedAt });
    }
    if (message.state) receiveState(message.state, message.type);
    if (message.id) {
      const waiting = pending.get(message.id);
      log(`server-${message.type}`, { id: message.id, serverAt: message.serverAt, roundTripMs: waiting ? Math.round(performance.now() - waiting.sentAt) : null, reason: message.reason, scheduleId: message.scheduleId, dueAt: message.dueAt });
      if (waiting) {
        clearTimeout(waiting.timeout);
        pending.delete(message.id);
        if (message.type === 'failed') waiting.reject(new Error(message.reason));
        else waiting.resolve(message);
      }
    }
    render();
  });
  socket.addEventListener('close', event => {
    ready = false;
    $('connection').textContent = 'Simulador desconectado · tentando reconectar';
    log('disconnected', { code: event.code });
    failPending('Conexão encerrada; o comando não será repetido');
    if (active) deactivate('conexão perdida');
    render();
    if (!closing) reconnect = setTimeout(connect, 1500);
  });
  socket.addEventListener('error', () => log('socket-error'));
}
function receiveState(state, source) {
  if (tv && state.revision < tv.revision && source !== 'hello') { log('old-state-ignored'); return; }
  const previous = tv;
  tv = state;
  receivedAt = Date.now();
  log('snapshot-received', { source, revision: state.revision, target: state.target, playing: state.playing, available: state.available, position: state.position, title: state.track.title, observedAt: state.observedAt });
  if (active && !state.available) deactivate('sessão simulada encerrada');
  if (active) {
    updateSession();
    if (state.playing && previous && (!previous.playing || previous.target !== state.target) && $('mode').value !== 'metadata' && $('policy').value === 'follow' && audio.paused && !startingAudio) {
      // Uma mudança real da TV pode pedir retomada. Não repetir a tentativa a cada heartbeat.
      void startAudio();
    }
  }
}
function render() {
  if (tv) {
    $('title').textContent = tv.available ? tv.track.title : 'Sessão simulada encerrada';
    $('tv-state').textContent = `${tv.available ? (tv.playing ? 'Tocando' : 'Pausada') : 'Sem sessão'} · ${Math.floor(tv.position)} / ${tv.duration} s · revisão ${tv.revision}`;
    if (lastArt !== tv.track.artwork) { $('art').src = tv.track.artwork; lastArt = tv.track.artwork; }
  }
  $('activate').disabled = !ready || !tv?.available || !session || active;
  $('deactivate').disabled = !active;
  $('session-state').textContent = active ? `Media Session ativa · estado declarado: ${session.playbackState} · ${$('mode').selectedOptions[0].textContent}` : 'Media Session desativada.';
  for (const button of document.querySelectorAll('[data-action], #operate, #cancel')) button.disabled = !ready || (!operator && !active);
}
function bindHandlers() {
  const handlers = {
    play: () => mediaAction('play'), pause: () => mediaAction('pause'),
    nexttrack: () => mediaAction('next'), previoustrack: () => mediaAction('previous'),
    seekto: details => mediaAction('seek', details.seekTime),
    seekbackward: details => mediaAction('seek', Math.max(0, tv.position - (details.seekOffset ?? 10))),
    seekforward: details => mediaAction('seek', Math.min(tv.duration, tv.position + (details.seekOffset ?? 10))),
  };
  for (const [action, handler] of Object.entries(handlers)) {
    try { session.setActionHandler(action, handler); supported[action] = true; }
    catch (e) { supported[action] = false; error(`action-unsupported-${action}`, e); }
  }
  $('action-support').textContent = `Registro de handlers: ${Object.entries(supported).map(([a, ok]) => `${a}=${ok ? 'aceito' : 'recusado'}`).join(', ')}. Aceito não garante botão no sistema.`;
}
function publishMetadata() {
  const key = `${tv.target}|${tv.track.title}`;
  if (lastMetadataKey === key) return;
  session.metadata = new MediaMetadata({ title: tv.track.title, artist: tv.track.artist, album: 'FMTV · Protótipo sem TV real', artwork: [{ src: new URL(tv.track.artwork, location.href).href, sizes: '512x512', type: 'image/png' }] });
  lastMetadataKey = key;
}
function updateSession(syncAudio = true) {
  if (!active || !tv?.available) return;
  try {
    publishMetadata();
    session.playbackState = tv.playing ? 'playing' : 'paused';
    if (typeof session.setPositionState === 'function') session.setPositionState({ duration: tv.duration, position: Math.min(tv.position, tv.duration), playbackRate: 1 });
  } catch (e) { error('session-update-failed', e); }
  if (syncAudio && !startingAudio && $('mode').value !== 'metadata' && $('policy').value === 'follow' && !tv.playing && !audio.paused) audio.pause();
  // Não retomar áudio automaticamente por heartbeat ou interrupção: observar a falha é parte do teste.
  render();
}
function startAudio(syncAudio = true) {
  const ownEpoch = epoch;
  const attempt = ++audioAttempt;
  startingAudio = attempt;
  log('audio-play-requested');
  const play = audio.play(); // Chamado ainda no toque/handler, antes de esperar rede.
  return play.then(() => {
    if (startingAudio === attempt) startingAudio = 0;
    if (!active || ownEpoch !== epoch) return;
    bindHandlers();
    lastMetadataKey = undefined;
    updateSession(syncAudio);
  }).catch(e => {
    if (startingAudio === attempt) startingAudio = 0;
    if (!active || ownEpoch !== epoch) { log('audio-play-cancelled'); return; }
    error('audio-play-rejected', e);
    say(`Áudio não iniciou: ${e.message}. Exporte o resultado.`);
  });
}
function activate() {
  if (!ready || !tv?.available || !session || active) return;
  epoch++;
  active = true;
  activatedOnce = true;
  $('mode').disabled = $('policy').disabled = true;
  log('activated', { mode: $('mode').value, policy: $('policy').value });
  bindHandlers();
  lastMetadataKey = undefined;
  if ($('mode').value !== 'metadata') {
    audio.src = $('mode').value === 'tone' ? '/tone.wav' : '/silence.wav';
    audio.loop = $('mode').value === 'silence';
    audio.muted = false;
    audio.volume = 1;
    void startAudio();
  }
  updateSession();
  say('Ensaio ativo. Exporte antes de comparar outro modo em Novo ensaio.');
}
function deactivate(reason = 'toque em Desativar') {
  active = false;
  epoch++;
  startingAudio = 0;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  if (session) {
    for (const action of Object.keys(supported)) { try { session.setActionHandler(action, null); } catch {} }
    try { session.metadata = null; session.playbackState = 'none'; session.setPositionState?.(); } catch (e) { error('session-clear-failed', e); }
  }
  lastMetadataKey = undefined;
  log('deactivated', { reason });
  say(`Ensaio desativado: ${reason}. A TV simulada não recebeu comando de pausa.`);
  render();
}
function mediaAction(action, position) {
  log('media-action', { action, position });
  if (!active) return;
  if (action === 'play' && $('mode').value !== 'metadata' && audio.paused) void startAudio(false);
  void command(action, 'media-session', position);
}
async function command(action, source, position, delay = 0) {
  try {
    const answer = await request({ type: 'command', action, source, target: tv?.target, ...(position === undefined ? {} : { position }), delay });
    say(answer.type === 'scheduled' ? `Agendado para ${answer.dueAt}. Pode bloquear o iPhone.` : `${action}: confirmado pela TV simulada em ${answer.serverAt}.`);
  } catch (e) { error('command-failed', e); say(`Comando não confirmado: ${e.message}`); }
}
$('activate').onclick = activate;
$('deactivate').onclick = () => deactivate();
for (const button of document.querySelectorAll('[data-action]')) button.onclick = () => {
  if (button.dataset.action === 'play' && $('mode').value !== 'metadata' && audio.paused) void startAudio(false);
  void command(button.dataset.action, 'page');
};
$('operate').onclick = () => command($('operator-action').value, 'operator', $('operator-action').value === 'seek' ? Number($('seek').value) : undefined, Number($('delay').value));
$('cancel').onclick = async () => {
  try { await request({ type: 'cancel-scheduled' }); say('Agendamentos cancelados.'); } catch (e) { say(e.message); }
};
$('new-run').onclick = () => { if (confirm('Exportou o relatório? Novo ensaio apaga os eventos desta página.')) location.reload(); };
$('export').onclick = async () => {
  $('export').disabled = true;
  let serverJournal;
  try { serverJournal = await request({ type: 'journal' }); } catch (e) { serverJournal = { error: e.message }; }
  const physical = Object.fromEntries(checks.map(([id, title]) => [id, { scenario: title, result: $(`check-${id}`).value }]));
  const report = {
    prototype: 'fmtv-media-session-lab-v1', exportedAt: new Date().toISOString(), runId,
    limitation: 'TV simulada; nenhum comando ou efeito foi observado numa TV real.',
    device: { model: $('model').value, ios: $('ios').value, opening: $('opening').value, userAgent: navigator.userAgent, url: location.href, isSecureContext, standaloneDisplay: standalone, standaloneNavigator: navigator.standalone ?? null },
    config: { role: operator ? 'operator' : 'phone', mode: $('mode').value, policy: $('policy').value, activatedOnce, active, mediaSessionAvailable: Boolean(session), handlers: { ...supported } },
    physical, notes: $('notes').value, currentState: tv, audio: { paused: audio.paused, muted: audio.muted, volume: audio.volume, position: audio.currentTime },
    clientEventsDiscarded: discardCount, events: [...events], serverJournal,
  };
  const confirmations = events.filter(e => e.event === 'server-ack');
  const media = events.filter(e => e.event === 'media-action');
  $('report').value = [
    'FMTV · Teste de Media Session v1 · TV SIMULADA',
    `Ensaio: ${runId}`, `iPhone: ${report.device.model || 'não informado'} · iOS: ${report.device.ios || 'não informado'}`,
    `Abertura: ${report.device.opening} · standalone: ${standalone || Boolean(navigator.standalone)}`,
    `Modo: ${report.config.mode} · pausa auxiliar: ${report.config.policy} · ativou: ${activatedOnce}`,
    `Media Session: ${report.config.mediaSessionAvailable} · contexto seguro: ${isSecureContext}`,
    ...Object.values(physical).map(p => `${p.scenario}: ${p.result}`),
    `Callbacks de mídia: ${media.length} · comandos confirmados no servidor: ${confirmations.length}`,
    `Descartes: cliente=${discardCount}, servidor=${serverJournal.discarded ?? 'indisponível'}`,
    `Servidor: ${serverJournal.error || serverJournal.startedAt}`,
    `Observações: ${report.notes || 'nenhuma'}`,
    'O JSON completo inclui horários e eventos; contagens não comprovam controles na tela bloqueada nem ação na TV real.',
  ].join('\n');
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
  $('download').href = downloadUrl;
  $('download').download = `fmtv-media-session-${runId}.json`;
  $('download').hidden = false;
  $('export').disabled = false;
  say('Relatório gerado. Copie o resumo e baixe o JSON para preservar os horários.');
};
document.addEventListener('visibilitychange', () => log('visibility-change'));
addEventListener('online', () => log('online'));
addEventListener('offline', () => log('offline'));
addEventListener('pageshow', e => log('page-show', { persisted: e.persisted }));
addEventListener('pagehide', e => {
  log('page-hide', { persisted: e.persisted });
  if (!e.persisted) { closing = true; clearTimeout(reconnect); if (active) deactivate('página encerrada'); socket?.close(); }
});
setInterval(() => {
  if (active && Date.now() - receivedAt > 15000) deactivate('15 segundos sem retrato; timer executou');
  audioState();
}, 1000);
log('boot', { runId, operator, mediaSession: Boolean(session), isSecureContext, standalone, standaloneNavigator: navigator.standalone ?? null });
render();
connect();
