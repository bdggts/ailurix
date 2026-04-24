// ═══════════════════════════════════════════════════════════
// AILURIX ARENA — MULTIPLAYER CLIENT (Socket.io)
// ═══════════════════════════════════════════════════════════

(function(){
'use strict';

var SERVER_URL = 'https://ailurix-arena-server.onrender.com';

var MP = {
  socket: null,
  connected: false,
  roomCode: null,
  playerNum: 0,
  opponentName: null,
  myChar: null,
  opponentChar: null,
  active: false
};
window.MP = MP;

// ── UI ──────────────────────────────────────────────────────
function showHostStatus(msg, color) {
  var el = document.getElementById('mp-status');
  if (el) { el.textContent = msg; el.style.color = color || '#22c55e'; }
}
function showGuestStatus(msg, color) {
  var el = document.getElementById('mp-join-status');
  if (el) { el.textContent = msg; el.style.color = color || '#22c55e'; }
}
function showConnectStatus(msg, color) {
  var el = document.getElementById('mp-connect-status');
  if (el) { el.textContent = msg; el.style.color = color || '#fff'; }
}
function showMPError(msg) {
  showGuestStatus('\u26a0 ' + msg, '#f55');
  showHostStatus('\u26a0 ' + msg, '#f55');
  showConnectStatus('\u26a0 ' + msg, '#f55');
  var b1 = document.getElementById('mp-create-btn');
  if (b1) { b1.disabled = false; b1.textContent = 'CREATE ROOM'; }
  var b2 = document.getElementById('mp-join-btn');
  if (b2) { b2.disabled = false; b2.textContent = 'JOIN ROOM'; }
  console.warn('[MP]', msg);
}

// ── CONNECT ──────────────────────────────────────────────────
function connect(cb) {
  if (MP.connected && MP.socket) { cb && cb(); return; }
  showConnectStatus('Connecting...', '#f59e0b');
  if (typeof io === 'function') { _initSocket(cb); return; }
  var s = document.createElement('script');
  s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
  s.onload = function() { _initSocket(cb); };
  s.onerror = function() { showMPError('Cannot load socket lib'); };
  document.head.appendChild(s);
}

function _initSocket(cb) {
  try {
    if (MP.socket) MP.socket.disconnect();
    MP.socket = io(SERVER_URL, { transports: ['websocket','polling'], timeout: 10000 });
    MP.socket.on('connect', function() {
      MP.connected = true;
      showConnectStatus('Connected!', '#22c55e');
      cb && cb();
    });
    MP.socket.on('connect_error', function(e) { showMPError('Failed: ' + (e.message||'check network')); });
    MP.socket.on('disconnect', function() {
      MP.connected = false; MP.active = false;
      if (MP.roomCode) showMPError('Disconnected');
    });
    setupListeners();
  } catch(e) { showMPError('Error: ' + e.message); }
}

// ── SERVER EVENTS ────────────────────────────────────────────
function setupListeners() {
  var s = MP.socket;

  s.on('room:created', function(d) {
    MP.roomCode = d.code; MP.playerNum = 1;
    _showRoomCreated(d.code);
  });

  s.on('room:joined', function(d) {
    MP.roomCode = d.code; MP.playerNum = 2; MP.opponentName = d.opponentName;
    showGuestStatus('\u2705 Joined! Waiting...', '#22c55e');
    var jb = document.getElementById('mp-join-btn');
    if (jb) { jb.textContent = 'JOINED \u2705'; jb.style.background = '#22c55e33'; }
  });

  s.on('room:opponent_joined', function(d) {
    MP.opponentName = d.opponentName;
    showHostStatus('\u2705 ' + d.opponentName + ' joined!', '#22c55e');
  });

  s.on('room:select_chars', function() { showMPCharSelect(); });

  s.on('room:opponent_char', function(d) {
    MP.opponentChar = d.charId;
    console.log('[MP] Opponent selected:', d.charId);
    // Show opponent in lobby if we're on lobby screen
    var oppSlot = MP.playerNum === 1 ? 'p2' : 'p1';
    _showOpponentInLobby(oppSlot);
  });

  s.on('room:fight_start', function(d) {
    MP.myChar       = MP.playerNum === 1 ? d.p1Char : d.p2Char;
    MP.opponentChar = MP.playerNum === 1 ? d.p2Char : d.p1Char;
    console.log('[MP] Fight start! My:', MP.myChar, 'Opp:', MP.opponentChar);

    // Show opponent if not already shown
    var oppSlot = MP.playerNum === 1 ? 'p2' : 'p1';
    _showOpponentInLobby(oppSlot);

    // Make sure we're on lobby screen
    if (window.showScreen) window.showScreen('mp-lobby');

    // 3-2-1 COUNTDOWN then fight
    var cdEl = document.getElementById('mp-lobby-countdown');
    var statusEl = document.getElementById('mp-lobby-status');
    if (statusEl) statusEl.textContent = 'GET READY!';
    var count = 3;
    if (cdEl) cdEl.textContent = count;
    var cdInterval = setInterval(function() {
      count--;
      if (count > 0) {
        if (cdEl) { cdEl.textContent = count; cdEl.style.animation = 'none'; cdEl.offsetHeight; cdEl.style.animation = 'countPop 0.5s ease-out'; }
      } else if (count === 0) {
        if (cdEl) { cdEl.textContent = 'FIGHT!'; cdEl.style.color = '#ef4444'; cdEl.style.animation = 'none'; cdEl.offsetHeight; cdEl.style.animation = 'countPop 0.5s ease-out'; }
        if (statusEl) statusEl.textContent = '';
      } else {
        clearInterval(cdInterval);
        if (cdEl) cdEl.textContent = '';
        // START THE FIGHT
        MP.active = true;
        if (typeof window.startMPFightGame === 'function') window.startMPFightGame(d);
      }
    }, 1000);
  });

  s.on('fight:input', function(d) {
    if (!MP.active) return;
    if (typeof window.applyOpponentInput === 'function') window.applyOpponentInput(d);
  });

  s.on('fight:hp_update', function(d) {
    if (!MP.active) return;
    if (typeof window.applyMPHP === 'function') window.applyMPHP(d);
  });

  s.on('fight:result', function(d) {
    MP.active = false;
    if (typeof window.showMPResultScreen === 'function') window.showMPResultScreen(d.winner === MP.playerNum);
  });

  s.on('room:opponent_left', function(d) {
    MP.active = false;
    showMPError(d.msg || 'Opponent left!');
    setTimeout(function() {
      if (window.showScreen) window.showScreen('splash');
    }, 2000);
  });

  s.on('room:error', function(d) { showMPError(d.msg || 'Error'); });
}

function _showRoomCreated(code) {
  var wrap = document.getElementById('mp-room-display-wrap');
  if (wrap) wrap.style.display = 'block';
  var codeEl = document.getElementById('mp-room-display');
  if (codeEl) codeEl.textContent = code;
  showHostStatus('\u23f3 Waiting for opponent...', '#22c55e');
  showConnectStatus('\ud83c\udfd7 Room: ' + code, '#22c55e');
  var btn = document.getElementById('mp-create-btn');
  if (btn) { btn.textContent = 'ROOM CREATED \u2705'; btn.style.background = '#22c55e33'; }
}

// ── CHARACTER SELECT (MP) ────────────────────────────────────
function showMPCharSelect() {
  console.log('[MP] Opening char select, player', MP.playerNum);
  // Just open the normal char select screen — button onclick handles MP
  window._navBusy = false;
  if (window._playNow) {
    window._playNow();
  } else {
    if (window.showScreen) window.showScreen('select');
    if (window.initSelect) window.initSelect();
  }
}

// Called by game.js select button when MP.roomCode is set
window._mpGoLobby = function(myChar) {
  console.log('[MP] Going to lobby with char:', myChar.id);
  MP.myChar = myChar.id;

  // Emit char selection to server
  if (MP.socket) MP.socket.emit('room:char_select', { charId: myChar.id });

  // Show lobby screen
  if (window.showScreen) window.showScreen('mp-lobby');

  // Draw MY character on my slot
  var mySlot = MP.playerNum === 1 ? 'p1' : 'p2';
  var oppSlot = MP.playerNum === 1 ? 'p2' : 'p1';

  // My side — show character
  var myCv = document.getElementById('mp-lobby-' + mySlot + '-cv');
  var myName = document.getElementById('mp-lobby-' + mySlot + '-name');
  var mySlotEl = document.getElementById('mp-lobby-' + mySlot);
  if (myCv && window.drawCharPreview) {
    myCv.width = 80; myCv.height = 100;
    window.drawCharPreview(myCv, myChar, 80, undefined, 'idle');
  }
  if (myName) { myName.textContent = myChar.name; myName.style.color = myChar.color; }
  if (mySlotEl) { mySlotEl.classList.remove('waiting'); mySlotEl.classList.add('ready'); }

  // Opponent side — waiting or already selected
  var oppCv = document.getElementById('mp-lobby-' + oppSlot + '-cv');
  var oppName = document.getElementById('mp-lobby-' + oppSlot + '-name');
  var oppSlotEl = document.getElementById('mp-lobby-' + oppSlot);

  if (MP.opponentChar) {
    // Opponent already selected
    _showOpponentInLobby(oppSlot);
  } else {
    // Waiting for opponent
    if (oppCv) { var ctx = oppCv.getContext('2d'); ctx.clearRect(0, 0, 80, 100); }
    if (oppName) { oppName.textContent = '???'; oppName.style.color = '#f59e0b'; }
    if (oppSlotEl) { oppSlotEl.classList.add('waiting'); oppSlotEl.classList.remove('ready'); }
  }

  // Status
  var status = document.getElementById('mp-lobby-status');
  if (status) status.textContent = MP.opponentChar ? 'Both fighters ready!' : 'Waiting for opponent...';
};

function _showOpponentInLobby(oppSlot) {
  var CHARS = window.CHARS || window.PLAYABLE || [];
  var oppChar = CHARS.find(function(c) { return c.id === MP.opponentChar; });
  if (!oppChar && window.PLAYABLE) oppChar = window.PLAYABLE[0];
  if (!oppChar) return;

  var oppCv = document.getElementById('mp-lobby-' + oppSlot + '-cv');
  var oppName = document.getElementById('mp-lobby-' + oppSlot + '-name');
  var oppSlotEl = document.getElementById('mp-lobby-' + oppSlot);

  if (oppCv && window.drawCharPreview) {
    oppCv.width = 80; oppCv.height = 100;
    window.drawCharPreview(oppCv, oppChar, 80, undefined, 'idle');
  }
  if (oppName) { oppName.textContent = oppChar.name; oppName.style.color = oppChar.color; }
  if (oppSlotEl) { oppSlotEl.classList.remove('waiting'); oppSlotEl.classList.add('ready'); }

  var status = document.getElementById('mp-lobby-status');
  if (status) status.textContent = 'Both fighters ready!';
}


// ── PUBLIC API ───────────────────────────────────────────────
window.MPClient = {
  createRoom: function(name) {
    connect(function() { MP.socket.emit('room:create', { name: name || 'Player 1' }); });
  },
  joinRoom: function(code, name) {
    connect(function() { MP.socket.emit('room:join', { code: code, name: name || 'Player 2' }); });
  },
  rematch: function() {
    if (!MP.socket || !MP.roomCode) return;
    var G = window.G;
    if (G) { G.mpMode = false; G.mpOpponent = null; }
    MP.active = false;
    MP.socket.emit('room:rematch');
  },
  isActive:     function() { return MP.active; },
  getPlayerNum: function() { return MP.playerNum; },
  getState:     function() { return MP; }
};

// ── INPUT SYNC ───────────────────────────────────────────────
window.MPSendInput = function(action, extra) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:input', Object.assign({ action: action, ts: Date.now() }, extra || {}));
};
window.MPSendHP = function(target, hp) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:hp', { target: target, hp: hp });
};

})();
