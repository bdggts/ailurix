const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 120000,    // 2 min — Android WebView pauses JS
  pingInterval: 30000     // 30 sec
});

app.use(cors());
app.use(express.json());

// ── ROOM STORE ──────────────────────────────────────────────
// rooms[code] = { code, host, guest, state, p1Char, p2Char, hp1, hp2 }
const rooms = {};

// Generate 6-char alphanumeric room code
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return rooms[code] ? genCode() : code; // ensure unique
}

// ── HEALTH CHECK ────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', server: 'Ailurix Arena v1.1' }));
app.get('/rooms', (req, res) => res.json({ count: Object.keys(rooms).length }));

// Room status (for polling fallback)
app.get('/room/:code', (req, res) => {
  const room = rooms[(req.params.code || '').toUpperCase()];
  if (!room) return res.json({ exists: false });
  res.json({ exists: true, state: room.state, p1Char: room.p1Char, p2Char: room.p2Char });
});

// HTTP fallback for char_select (in case WebSocket fails)
app.post('/room/:code/char', (req, res) => {
  const code = (req.params.code || '').toUpperCase();
  const room = rooms[code];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const { charId, playerNum } = req.body;
  if (playerNum === 1) room.p1Char = charId;
  else room.p2Char = charId;
  console.log(`[HTTP] P${playerNum} selected ${charId} in ${code}`);
  // Broadcast via socket
  io.to(code).emit('room:opponent_char', { charId, player: playerNum });
  // Check if both selected
  if (room.p1Char && room.p2Char && room.state !== 'fighting') {
    room.state = 'fighting';
    room.hp1 = 100; room.hp2 = 100;
    console.log(`[FIGHT] ${code}: ${room.p1Char} vs ${room.p2Char} (via HTTP)`);
    io.to(code).emit('room:fight_start', { p1Char: room.p1Char, p2Char: room.p2Char });
  }
  res.json({ ok: true, p1Char: room.p1Char, p2Char: room.p2Char });
});

// ── SOCKET.IO ───────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('[+] Connected:', socket.id);

  // ── CREATE ROOM ──────────────────────────────────────────
  socket.on('room:create', (data) => {
    const code = genCode();
    rooms[code] = {
      code,
      host: socket.id,
      guest: null,
      state: 'waiting',  // waiting | selecting | fighting | done
      p1Char: null,
      p2Char: null,
      hp1: 100,
      hp2: 100,
      hostName: data.name || 'Player 1'
    };
    socket.join(code);
    socket.roomCode = code;
    socket.playerNum = 1;
    console.log(`[ROOM] Created ${code} by ${socket.id}`);
    socket.emit('room:created', { code, player: 1 });
  });

  // ── JOIN ROOM ────────────────────────────────────────────
  socket.on('room:join', (data) => {
    const code = (data.code || '').toUpperCase().trim();
    const room = rooms[code];

    if (!room) return socket.emit('room:error', { msg: 'Room not found! Check your code.' });
    if (room.guest) return socket.emit('room:error', { msg: 'Room is full! Try another code.' });
    if (room.state !== 'waiting') return socket.emit('room:error', { msg: 'Match already started!' });

    room.guest = socket.id;
    room.guestName = data.name || 'Player 2';
    room.state = 'selecting';
    socket.join(code);
    socket.roomCode = code;
    socket.playerNum = 2;

    console.log(`[ROOM] ${socket.id} joined ${code}`);

    // Notify both players
    socket.emit('room:joined', { code, player: 2, opponentName: room.hostName });
    io.to(room.host).emit('room:opponent_joined', { opponentName: room.guestName });

    // Tell both to start character selection
    io.to(code).emit('room:select_chars');
  });

  // ── REJOIN ROOM (after socket reconnect) ──────────────────
  socket.on('room:rejoin', (data) => {
    const code = (data.code || '').toUpperCase().trim();
    const room = rooms[code];
    if (!room) {
      console.log(`[REJOIN] Room ${code} not found`);
      socket.emit('room:error', { msg: 'Room expired. Create a new one.' });
      return;
    }
    socket.join(code);
    socket.roomCode = code;
    socket.playerNum = data.playerNum || 0;
    // Re-associate socket ID with room
    if (data.playerNum === 1) room.host = socket.id;
    else if (data.playerNum === 2) room.guest = socket.id;
    console.log(`[REJOIN] ${socket.id} rejoined ${code} as P${data.playerNum}`);
    socket.emit('room:rejoin_ok', { code });
  });

  // ── CHARACTER SELECTED ───────────────────────────────────
  socket.on('room:char_select', (data) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;

    if (socket.playerNum === 1) room.p1Char = data.charId;
    else room.p2Char = data.charId;

    // Tell opponent which char was picked
    socket.to(code).emit('room:opponent_char', { charId: data.charId, player: socket.playerNum });

    // Both selected? Start fight!
    if (room.p1Char && room.p2Char) {
      room.state = 'fighting';
      room.hp1 = 100;
      room.hp2 = 100;
      console.log(`[FIGHT] ${code}: ${room.p1Char} vs ${room.p2Char}`);
      io.to(code).emit('room:fight_start', {
        p1Char: room.p1Char,
        p2Char: room.p2Char
      });
    }
  });

  // ── FIGHT INPUT SYNC ─────────────────────────────────────
  // Relay inputs to opponent only (not back to sender)
  socket.on('fight:input', (data) => {
    const code = socket.roomCode;
    if (!code) return;
    socket.to(code).emit('fight:input', { ...data, player: socket.playerNum });
  });

  // ── POSITION SYNC ────────────────────────────────────────
  // Relay player position to opponent (low-latency movement sync)
  socket.on('fight:position', (data) => {
    const code = socket.roomCode;
    if (!code) return;
    socket.to(code).emit('fight:position', data);
  });

  // ── PLAYER ACTION (attack relay) ─────────────────────────
  // Client sends room:player_action → relay to opponent as room:opponent_action
  socket.on('room:player_action', (data) => {
    const code = socket.roomCode;
    if (!code) return;
    console.log(`[ACTION] ${code} P${socket.playerNum}: ${data.action}`);
    socket.to(code).emit('room:opponent_action', {
      action: data.action,
      player: socket.playerNum
    });
  });

  // ── HP SYNC (server-authoritative) ───────────────────────
  socket.on('fight:hp', (data) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'fighting') return;

    // Update HP on server
    if (data.target === 1) room.hp1 = Math.max(0, data.hp);
    else room.hp2 = Math.max(0, data.hp);

    // Broadcast to both players
    io.to(code).emit('fight:hp_update', { hp1: room.hp1, hp2: room.hp2 });

    // Check win condition
    if (room.hp1 <= 0 || room.hp2 <= 0) {
      room.state = 'done';
      const winner = room.hp1 <= 0 ? 2 : 1;
      io.to(code).emit('fight:result', { winner });
      console.log(`[RESULT] ${code}: Player ${winner} wins!`);
      // Clean up room after 30s
      setTimeout(() => { delete rooms[code]; }, 30000);
    }
  });

  // ── FIGHT STATE SYNC (position, animation) ───────────────
  socket.on('fight:state', (data) => {
    const code = socket.roomCode;
    if (!code) return;
    socket.to(code).emit('fight:state', { ...data, player: socket.playerNum });
  });

  // ── REMATCH REQUEST ──────────────────────────────────────
  socket.on('room:rematch', () => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;
    room.state = 'selecting';
    room.p1Char = null;
    room.p2Char = null;
    room.hp1 = 100;
    room.hp2 = 100;
    io.to(code).emit('room:select_chars');
  });

  // ── DISCONNECT ───────────────────────────────────────────
  socket.on('disconnect', () => {
    const code = socket.roomCode;
    if (!code || !rooms[code]) return;
    console.log(`[-] Disconnected: ${socket.id} from room ${code}`);
    // DON'T delete room immediately — allow reconnection within 60s
    rooms[code]._disconnectTimer = setTimeout(() => {
      if (rooms[code]) {
        console.log(`[CLEANUP] Room ${code} expired after disconnect`);
        io.to(code).emit('room:opponent_left', { msg: 'Opponent disconnected!' });
        delete rooms[code];
      }
    }, 60000); // 60 second grace period
  });
});

// ── START ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🎮 Ailurix Arena Server running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}\n`);

  // ── KEEP-ALIVE PING (prevents Render.com free tier sleep) ──
  // Pings self every 14 minutes so server NEVER sleeps
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  setInterval(() => {
    const http = SELF_URL.startsWith('https') ? require('https') : require('http');
    http.get(SELF_URL, (res) => {
      console.log(`[PING] Keep-alive: ${res.statusCode} — ${new Date().toISOString()}`);
    }).on('error', (e) => {
      console.warn('[PING] Keep-alive failed:', e.message);
    });
  }, 14 * 60 * 1000); // every 14 minutes

  console.log(`♾️  Keep-alive ping active (every 14 min)`);
});

