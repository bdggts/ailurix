// ═══════════════════════════════════════════════════════════
// AILURIX ARENA — MULTIPLAYER CLIENT (Socket.io)
// ═══════════════════════════════════════════════════════════

(function(){
'use strict';

// ── CONFIG ──────────────────────────────────────────────────
var SERVER_URL = 'https://ailurix-arena-server.onrender.com';

// ── STATE ───────────────────────────────────────────────────
var MP = {
  socket: null,
  connected: false,
  roomCode: null,
  playerNum: 0,       // 1 = host, 2 = guest
  opponentName: null,
  myChar: null,
  opponentChar: null,
  active: false
};
window.MP = MP;

// ── UI HELPERS ───────────────────────────────────────────────
function setConnectStatus(msg, color) {
  var cs = document.getElementById('mp-connect-status');
  if (cs) { cs.textContent = msg; cs.style.color = color || '#fff'; }
}
function showMPError(msg) {
  var el = document.getElementById('mp-status');
  if (el) { el.textContent = '\u26a0\ufe0f ' + msg; el.style.color = '#f00'; }
  setConnectStatus('\u26a0\ufe0f ' + msg, '#f55');
  var btn = document.getElementById('mp-create-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'CREATE ROOM'; }
  var jBtn = document.getElementById('mp-join-btn');
  if (jBtn) { jBtn.disabled = false; jBtn.textContent = 'JOIN ROOM'; }
  console.warn('[MP] Error:', msg);
}
function showMPStatus(msg, color) {
  var el = document.getElementById('mp-status');
  if (el) { el.textContent = msg; el.style.color = color || '#22c55e'; }
  setConnectStatus(msg, color || '#22c55e');
}

// ── CONNECT TO SERVER ────────────────────────────────────────
function connect(cb) {
  if (MP.connected && MP.socket) { cb && cb(); return; }
  setConnectStatus('Connecting to server...', '#f59e0b');
  if (typeof io === 'function') {
    _initSocket(cb);
  } else {
    var s = document.createElement('script');
    s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
    s.onload = function() { _initSocket(cb); };
    s.onerror = function() { showMPError('Cannot load socket library.'); };
    document.head.appendChild(s);
  }
}

function _initSocket(cb) {
  try {
    if (MP.socket) { MP.socket.disconnect(); }
    MP.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });
    MP.socket.on('connect', function() {
      MP.connected = true;
      setConnectStatus('Connected!', '#22c55e');
      console.log('[MP] Socket connected:', MP.socket.id);
      cb && cb();
    });
    MP.socket.on('connect_error', function(err) {
      showMPError('Connection failed: ' + (err.message || 'check network'));
    });
    MP.socket.on('disconnect', function() {
      MP.connected = false;
      MP.active = false;
      if (MP.roomCode) showMPError('Disconnected from server');
    });
    setupListeners();
  } catch(e) {
    showMPError('Error: ' + e.message);
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
    showMPStatus('Connected! Waiting for host...', '#22c55e');
    // Update join button
    var jBtn = document.getElementById('mp-join-btn');
    if (jBtn) { jBtn.textContent = 'JOINED \u2705'; jBtn.style.background = '#22c55e33'; }
  });

  // Opponent joined (host gets this)
  s.on('room:opponent_joined', function(d) {
    MP.opponentName = d.opponentName;
    showMPStatus('\u2705 ' + d.opponentName + ' joined!', '#22c55e');
  });

  // Both players select characters
  s.on('room:select_chars', function() {
    showMPCharSelect();
  });

  // Opponent picked a character
  s.on('room:opponent_char', function(d) {
    MP.opponentChar = d.charId;
    console.log('[MP] Opponent selected:', d.charId);
    // Update waiting message in char select
    var waitMsg = document.getElementById('mp-char-wait-msg');
    if (waitMsg) { waitMsg.textContent = 'Opponent ready! Waiting for you...'; }
  });

  // Fight starts!
  s.on('room:fight_start', function(d) {
    MP.myChar = MP.playerNum === 1 ? d.p1Char : d.p2Char;
    MP.opponentChar = MP.playerNum === 1 ? d.p2Char : d.p1Char;
    MP.active = true;
    // Use game.js's built-in MP fight starter (already handles chars + fight screen)
    if (typeof window.startMPFightGame === 'function') {
      window.startMPFightGame(d);
    } else {
      startMPFight(MP.myChar, MP.opponentChar);
    }
  });

  // Opponent fight input
  s.on('fight:input', function(d) {
    if (!MP.active) return;
    if (typeof window.applyOpponentInput === 'function') {
      window.applyOpponentInput(d);
    }
  });

  // HP update
  s.on('fight:hp_update', function(d) {
    if (!MP.active) return;
    if (typeof window.applyMPHP === 'function') window.applyMPHP(d);
  });

  // Fight result
  s.on('fight:result', function(d) {
    MP.active = false;
    if (typeof window.showMPResultScreen === 'function') {
      window.showMPResultScreen(d.winner === MP.playerNum);
    }
  });

  // Opponent left
  s.on('room:opponent_left', function(d) {
    MP.active = false;
    showMPError(d.msg || 'Opponent disconnected!');
    // Go back to splash after 2s
    setTimeout(function() {
      if (typeof showScreen === 'function') showScreen('splash');
    }, 2000);
  });

  // Server error
  s.on('room:error', function(d) {
    showMPError(d.msg || 'Unknown error');
  });
}

// ── CHARACTER SELECT (MP MODE) ────────────────────────────────
function showMPCharSelect() {
  console.log('[MP] Opening character select for player', MP.playerNum);

  // Switch to character select screen using game's own function
  if (typeof showScreen === 'function') {
    showScreen('select');
  } else {
    document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
    var sel = document.getElementById('select');
    if (sel) sel.classList.add('active');
  }

  // Initialize the character select grid
  if (typeof initSelect === 'function') {
    initSelect();
  }

  // Add "MP mode" waiting message below select button
  var selectBtn = document.getElementById('select-btn');
  if (selectBtn) {
    // Remove old wait msg if any
    var old = document.getElementById('mp-char-wait-msg');
    if (old) old.parentNode.removeChild(old);

    var waitDiv = document.createElement('div');
    waitDiv.id = 'mp-char-wait-msg';
    waitDiv.style.cssText = 'font-size:9px;color:#f59e0b;text-align:center;margin-top:8px;font-family:inherit;';
    waitDiv.textContent = 'SELECT YOUR FIGHTER \u2193';
    selectBtn.parentNode.insertBefore(waitDiv, selectBtn.nextSibling);

    // Override select button for MP mode
    selectBtn.onclick = function() {
      if (typeof G === 'undefined' || !G.player) {
        // G.player not set yet - user hasn't selected
        alert('Please tap a character first!');
        return;
      }
      var charId = G.player.id;
      console.log('[MP] Sending char select:', charId);
      // Send to server
      if (MP.socket) MP.socket.emit('room:char_select', { charId: charId });
      // Update button
      selectBtn.disabled = true;
      selectBtn.textContent = 'WAITING FOR OPPONENT...';
      selectBtn.style.background = 'rgba(245,158,11,.3)';
      if (waitDiv) waitDiv.textContent = 'Waiting for opponent to pick...';
    };
  }
}

// ── START MP FIGHT ────────────────────────────────────────────
function startMPFight(myCharId, oppCharId) {
  console.log('[MP] Starting fight:', myCharId, 'vs', oppCharId);

  // Find character objects from PLAYABLE array
  var myChar = null, oppChar = null;
  if (typeof PLAYABLE !== 'undefined') {
    for (var i = 0; i < PLAYABLE.length; i++) {
      if (PLAYABLE[i].id === myCharId)  myChar  = PLAYABLE[i];
      if (PLAYABLE[i].id === oppCharId) oppChar = PLAYABLE[i];
    }
  }

  if (!myChar || !oppChar) {
    console.error('[MP] Character not found!', myCharId, oppCharId);
    // Try by name fallback
    if (typeof PLAYABLE !== 'undefined') {
      myChar  = myChar  || PLAYABLE[0];
      oppChar = oppChar || PLAYABLE[1];
    }
  }

  // Set game state for MP fight
  if (typeof G !== 'undefined') {
    G.player     = myChar;
    G.mpOpponent = oppChar;
    G.mpMode     = true;
    console.log('[MP] G.player =', G.player.name, '| G.mpOpponent =', G.mpOpponent.name);
    // Remove MP char wait msg
    var old = document.getElementById('mp-char-wait-msg');
    if (old) old.parentNode.removeChild(old);
    // Reset select button
    var selectBtn = document.getElementById('select-btn');
    if (selectBtn) { selectBtn.disabled = false; selectBtn.textContent = 'SELECT'; selectBtn.style.background = ''; }
    // Go to VS screen → fight
    if (typeof showScreen === 'function') showScreen('vs');
    if (typeof initVS === 'function')     initVS();
  } else {
    console.error('[MP] G (game state) not available!');
  }
}

// ── SHOW WAITING SCREEN (HOST) ────────────────────────────────
function showWaitingScreen(code) {
  var el = document.getElementById('mp-room-display');
  if (el) { el.textContent = code; }
  var wrap = document.getElementById('mp-room-display-wrap');
  if (wrap) wrap.style.display = 'block';
  var st = document.getElementById('mp-status');
  if (st) { st.textContent = '\u23f3 Waiting for opponent...'; st.style.color = '#22c55e'; }
  var btn = document.getElementById('mp-create-btn');
  if (btn) { btn.textContent = 'ROOM CREATED \u2705'; btn.style.background = '#22c55e33'; }
  setConnectStatus('\ud83c\udfd7\ufe0f Room ready! Share code: ' + code, '#22c55e');
}

// ── PUBLIC API ───────────────────────────────────────────────
window.MPClient = {
  createRoom: function(playerName) {
    connect(function() {
      MP.socket.emit('room:create', { name: playerName || 'Player 1' });
    });
  },
  joinRoom: function(code, playerName) {
    connect(function() {
      MP.socket.emit('room:join', { code: code, name: playerName || 'Player 2' });
    });
  },
  selectChar: function(charId) {
    MP.myChar = charId;
    if (MP.socket) MP.socket.emit('room:char_select', { charId: charId });
  },
  rematch: function() {
    if (MP.socket && MP.roomCode) {
      G.mpMode = false;
      G.mpOpponent = null;
      MP.active = false;
      MP.socket.emit('room:rematch');
    }
  },
  isActive: function() { return MP.active; },
  getPlayerNum: function() { return MP.playerNum; },
  getState: function() { return MP; }
};

// ── SEND INPUT TO SERVER ─────────────────────────────────────
window.MPSendInput = function(action, extra) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:input', Object.assign({ action: action, ts: Date.now() }, extra || {}));
};
window.MPSendHP = function(target, hp) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:hp', { target: target, hp: hp });
};

})();
