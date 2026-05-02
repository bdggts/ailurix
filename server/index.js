const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// ── CONFIG ──────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = '616154647185-amlj2rhsirctp7pbfe5aufrnkge05l62.apps.googleusercontent.com';
const JWT_SECRET = 'ailurix_arena_jwt_secret_2026_x7k9';
const MONGO_URI = 'mongodb+srv://ailurix_admin:Laks%401234@cluster0.mfcpkaw.mongodb.net/ailurix?retryWrites=true&w=majority&appName=Cluster0';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ── MONGODB CONNECTION ──────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

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

// Generate unique referral code
function genReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── HEALTH CHECK ────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', server: 'Ailurix Arena v1.2' }));

// ── AUTH: GOOGLE OAUTH REDIRECT (for Android WebView) ───────
app.get('/auth/google/start', (req, res) => {
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const redirectUri = 'https://ailurix-arena-server.onrender.com/auth/callback';
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' +
    'client_id=' + encodeURIComponent(GOOGLE_CLIENT_ID) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&response_type=id_token' +
    '&scope=openid%20email%20profile' +
    '&nonce=' + nonce +
    '&prompt=select_account';
  res.redirect(url);
});

// Callback page — reads id_token from URL fragment and calls our API
app.get('/auth/callback', (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box;}
body{background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;}
.msg{font-size:18px;color:#f59e0b;}.sub{font-size:12px;color:#666;margin-top:10px;max-width:90vw;word-break:break-all;}
.err{color:#ef4444;font-size:14px;margin-top:10px;display:none;}
</style></head><body>
<div>
<div class="msg" id="msg">⏳ Logging in...</div>
<div class="sub" id="sub">Please wait</div>
<div class="err" id="err"></div>
</div>
<script>
(function(){
  var hash = window.location.hash.substring(1);
  var params = {};
  hash.split('&').forEach(function(p){ var kv=p.split('='); params[kv[0]]=decodeURIComponent(kv[1]||''); });
  var idToken = params['id_token'];
  if(!idToken){
    document.getElementById('msg').textContent='❌ Login Failed';
    document.getElementById('sub').textContent='No token received from Google';
    setTimeout(function(){ window.location.href='ailurix://auth?error=no_token'; },3000);
    return;
  }
  document.getElementById('sub').textContent='Verifying with server...';
  fetch(window.location.origin + '/auth/google',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({credential:idToken})
  })
  .then(function(r){
    var ct = r.headers.get('content-type') || '';
    if(ct.indexOf('application/json') === -1){
      return r.text().then(function(txt){
        throw new Error('Server returned non-JSON (status '+r.status+'): '+txt.substring(0,200));
      });
    }
    return r.json();
  })
  .then(function(data){
    if(data.success){
      document.getElementById('msg').textContent='✅ Welcome, '+data.user.name+'!';
      document.getElementById('sub').textContent='Returning to game...';
      var userB64 = btoa(unescape(encodeURIComponent(JSON.stringify(data.user))));
      setTimeout(function(){
        window.location.href='ailurix://auth?token='+encodeURIComponent(data.token)+'&user='+encodeURIComponent(userB64)+'&isNew='+(data.isNew?'1':'0');
      },1000);
    } else {
      document.getElementById('msg').textContent='❌ Login Failed';
      document.getElementById('sub').textContent=data.error||'Unknown error';
      setTimeout(function(){ window.location.href='ailurix://auth?error=failed'; },4000);
    }
  })
  .catch(function(e){
    document.getElementById('msg').textContent='❌ Server Error';
    document.getElementById('sub').textContent=e.message;
    setTimeout(function(){ window.location.href='ailurix://auth?error=server'; },5000);
  });
})();
</script></body></html>`);
});

// ── AUTH: GOOGLE LOGIN (POST — token verify) ────────────────
app.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'No credential provided' });

    // Verify Google token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('Token verify error:', verifyErr.message);
      return res.status(401).json({ error: 'Token verification failed: ' + verifyErr.message });
    }

    const { email, name, picture, sub: googleId } = payload;
    let user, isNew = false;

    // Try MongoDB — but work even if DB is down
    try {
      user = await User.findOne({ email });
      isNew = !user;
      
      if (!user) {
        user = new User({
          email,
          name: name || 'Fighter',
          picture: picture || '',
          googleId,
          loginMethod: 'google',
          referralCode: genReferralCode()
        });
        await user.save();
        console.log('🆕 New user:', email);
      } else {
        user.lastLogin = new Date();
        user.picture = picture || user.picture;
        await user.save();
      }
    } catch (dbErr) {
      console.error('DB error (using fallback):', dbErr.message);
      // Fallback: create user object without DB
      user = {
        _id: googleId,
        email,
        name: name || 'Fighter',
        picture: picture || '',
        walletAddress: '',
        arxBalance: 0,
        referralCode: 'ARX' + googleId.slice(-6).toUpperCase(),
        totalFights: 0,
        totalWins: 0,
        loginMethod: 'google'
      };
      isNew = true;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id || googleId, email: user.email || email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      isNew,
      token,
      user: {
        id: user._id || googleId,
        name: user.name || name,
        email: user.email || email,
        picture: user.picture || picture,
        walletAddress: user.walletAddress || '',
        arxBalance: user.arxBalance || 0,
        referralCode: user.referralCode || '',
        totalFights: user.totalFights || 0,
        totalWins: user.totalWins || 0,
        loginMethod: user.loginMethod || 'google'
      }
    });
  } catch (err) {
    console.error('Auth error:', err.message, err.stack);
    res.status(401).json({ error: 'Auth failed: ' + err.message });
  }
});

// ── AUTH: WALLET LOGIN (import/phantom) ─────────────────────
app.post('/auth/wallet', async (req, res) => {
  try {
    const { walletAddress, loginMethod } = req.body;
    if (!walletAddress) return res.status(400).json({ error: 'No wallet address' });

    let user = await User.findOne({ walletAddress });
    const isNew = !user;

    if (!user) {
      user = new User({
        email: walletAddress + '@wallet',
        walletAddress,
        loginMethod: loginMethod || 'wallet',
        referralCode: genReferralCode()
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, walletAddress },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      isNew,
      token,
      user: {
        id: user._id,
        name: user.name,
        walletAddress: user.walletAddress,
        arxBalance: user.arxBalance,
        referralCode: user.referralCode,
        totalFights: user.totalFights,
        totalWins: user.totalWins,
        loginMethod: user.loginMethod
      }
    });
  } catch (err) {
    console.error('Wallet auth error:', err.message);
    res.status(500).json({ error: 'Wallet login failed' });
  }
});

// ── API: UPDATE WALLET ADDRESS ──────────────────────────────
app.post('/api/user/wallet', async (req, res) => {
  try {
    const { token, walletAddress } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.walletAddress = walletAddress;
    await user.save();
    res.json({ success: true, walletAddress });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ── API: GET USER PROFILE ───────────────────────────────────
app.get('/api/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      walletAddress: user.walletAddress,
      arxBalance: user.arxBalance,
      referralCode: user.referralCode,
      totalReferrals: user.totalReferrals,
      totalFights: user.totalFights,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      earningSessions: user.earningSessions,
      loginMethod: user.loginMethod
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
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

  // ── VOICE CHAT (WebRTC Signaling) ──────────────────────────
  socket.on('voice:offer', (data) => {
    const code = socket.roomCode;
    if (!code) return;
    socket.to(code).emit('voice:offer', data);
  });
  socket.on('voice:answer', (data) => {
    const code = socket.roomCode;
    if (!code) return;
    socket.to(code).emit('voice:answer', data);
  });
  socket.on('voice:ice', (data) => {
    const code = socket.roomCode;
    if (!code) return;
    socket.to(code).emit('voice:ice', data);
  });
  socket.on('voice:mic_status', (data) => {
    const code = socket.roomCode;
    if (!code) return;
    socket.to(code).emit('voice:mic_status', data);
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

