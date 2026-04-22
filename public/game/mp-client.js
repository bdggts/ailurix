// ═══════════════════════════════════════════════════════════
// AILURIX ARENA — MULTIPLAYER CLIENT (Socket.io)
// ═══════════════════════════════════════════════════════════

(function(){
'use strict';

// ── CONFIG ──────────────────────────────────────────────────
// Production server on custom domain
var SERVER_URL = 'https://api.ailurix.com';

// ── STATE ───────────────────────────────────────────────────
var MP = {
  socket: null,
  connected: false,
  roomCode: null,
  playerNum: 0,       // 1 = host, 2 = guest
  opponentName: null,
  myChar: null,
  opponentChar: null,
  active: false       // true when in a multiplayer fight
};

window.MP = MP;

// ── CONNECT TO SERVER ────────────────────────────────────────
function connect(cb) {
  if (MP.connected) { cb && cb(); return; }
  // socket.io is pre-loaded as local script (socket.io.min.js)
  if (typeof io === 'function') {
    _initSocket(cb);
    return;
  }
  // Fallback: load from CDN if somehow not loaded
  var script = document.createElement('script');
  script.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
  script.onload = function() { _initSocket(cb); };
  script.onerror = function() { showMPError('Cannot load Socket.io library.'); };
  document.head.appendChild(script);
}

function _initSocket(cb) {
  try {
    MP.socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    MP.socket.on('connect', function() {
      MP.connected = true;
      console.log('[MP] Connected:', MP.socket.id);
      cb && cb();
    });
    MP.socket.on('connect_error', function(err) {
      showMPError('Server error: ' + (err.message || 'check network'));
    });
    MP.socket.on('disconnect', function() {
      MP.connected = false;
      MP.active = false;
      if (MP.roomCode) showMPError('Disconnected from server');
    });
    setupListeners();
  } catch(e) {
    showMPError('Failed to connect: ' + e.message);
  }
}



// ── SERVER EVENT LISTENERS ───────────────────────────────────
function setupListeners() {
  var s = MP.socket;

  // Room created (host)
  s.on('room:created', function(d) {
    MP.roomCode = d.code;
    MP.playerNum = 1;
    showWaitingScreen(d.code);
  });

  // Room joined (guest)
  s.on('room:joined', function(d) {
    MP.roomCode = d.code;
    MP.playerNum = 2;
    MP.opponentName = d.opponentName;
    showMPStatus('Connected! Choose your fighter...');
  });

  // Opponent joined (host gets this)
  s.on('room:opponent_joined', function(d) {
    MP.opponentName = d.opponentName;
    showMPStatus('Opponent joined! Both choose your fighter...');
  });

  // Both players must select characters
  s.on('room:select_chars', function() {
    showMPCharSelect();
  });

  // Opponent picked a character
  s.on('room:opponent_char', function(d) {
    MP.opponentChar = d.charId;
    showMPStatus('Opponent ready! Waiting for you...');
  });

  // Fight starts
  s.on('room:fight_start', function(d) {
    MP.myChar = MP.playerNum === 1 ? d.p1Char : d.p2Char;
    MP.opponentChar = MP.playerNum === 1 ? d.p2Char : d.p1Char;
    MP.active = true;
    startMPFight(d);
  });

  // Opponent fight input
  s.on('fight:input', function(d) {
    if (!MP.active) return;
    handleOpponentInput(d);
  });

  // HP update
  s.on('fight:hp_update', function(d) {
    if (!MP.active) return;
    updateMPHP(d);
  });

  // Fight result
  s.on('fight:result', function(d) {
    MP.active = false;
    var won = d.winner === MP.playerNum;
    showMPResult(won);
  });

  // Opponent left
  s.on('room:opponent_left', function(d) {
    MP.active = false;
    showMPError(d.msg);
  });

  // Errors
  s.on('room:error', function(d) {
    showMPError(d.msg);
  });
}

// ── SEND INPUT TO SERVER ─────────────────────────────────────
function sendInput(action, extraData) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:input', Object.assign({ action: action, ts: Date.now() }, extraData || {}));
}

function sendHP(target, hp) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:hp', { target: target, hp: hp });
}

window.MPSendInput = sendInput;
window.MPSendHP = sendHP;

// ── UI HELPERS ───────────────────────────────────────────────
function showMPError(msg) {
  var el = document.getElementById('mp-status');
  if (el) { el.textContent = '⚠️ ' + msg; el.style.color = '#f00'; }
  console.warn('[MP] Error:', msg);
}

function showMPStatus(msg) {
  var el = document.getElementById('mp-status');
  if (el) { el.textContent = msg; el.style.color = '#0f0'; }
}

function showWaitingScreen(code) {
  // Show the room code in the correct element
  var el = document.getElementById('mp-room-display');
  if (el) { el.textContent = code; }
  // Show the room wrap
  var wrap = document.getElementById('mp-room-display-wrap');
  if (wrap) wrap.style.display = 'block';
  // Update status
  var st = document.getElementById('mp-status');
  if (st) { st.textContent = '⏳ Waiting for opponent...'; st.style.color = '#22c55e'; }
  // Update button
  var btn = document.getElementById('mp-create-btn');
  if (btn) { btn.textContent = 'ROOM CREATED ✅'; btn.style.background = '#22c55e33'; }
  console.log('[MP] Room created with code:', code);
}

function showMPCharSelect() {
  // Trigger character select screen in multiplayer mode
  if (typeof window.initSelect === 'function') {
    window._mpMode = true;
    window.G && (window.G.screen = 'select');
    window.showScreen && window.showScreen('select');
    window.initSelect && window.initSelect();
  }
}

function startMPFight(d) {
  // Set up fight with selected chars
  if (typeof window.startMPFightGame === 'function') {
    window.startMPFightGame(d);
  }
}

function handleOpponentInput(d) {
  if (typeof window.applyOpponentInput === 'function') {
    window.applyOpponentInput(d);
  }
}

function updateMPHP(d) {
  if (typeof window.applyMPHP === 'function') {
    window.applyMPHP(d);
  }
}

function showMPResult(won) {
  if (typeof window.showMPResultScreen === 'function') {
    window.showMPResultScreen(won);
  }
}

// ── PUBLIC API ───────────────────────────────────────────────
window.MPClient = {
  // Create a room (host)
  createRoom: function(playerName) {
    connect(function() {
      MP.socket.emit('room:create', { name: playerName || 'Player 1' });
    });
  },

  // Join a room (guest)
  joinRoom: function(code, playerName) {
    connect(function() {
      MP.socket.emit('room:join', { code: code, name: playerName || 'Player 2' });
    });
  },

  // Send character selection
  selectChar: function(charId) {
    MP.myChar = charId;
    if (MP.socket) MP.socket.emit('room:char_select', { charId: charId });
  },

  // Rematch
  rematch: function() {
    if (MP.socket && MP.roomCode) MP.socket.emit('room:rematch');
  },

  // Check if multiplayer mode active
  isActive: function() { return MP.active; },
  getPlayerNum: function() { return MP.playerNum; },
  getState: function() { return MP; }
};

})();
