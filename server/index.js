require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3001;

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1 AS ok');
    res.json({ success: true, db: 'connected', time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ success: false, db: 'error', error: e.message });
  }
});

// ─── SESSION MIDDLEWARE ────────────────────────────────────────────────────────

async function requireUser(req, res, next) {
  const userId = req.cookies.userId;
  if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });
  try {
    const [rows] = await pool.query('SELECT id, email, name FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(401).json({ success: false, error: 'User not found' });
    req.user = rows[0];
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'Missing fields' });
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, error: 'E-mail já cadastrado' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name || email, email, hash]
    );
    const newId = result.insertId;
    res.cookie('userId', String(newId), { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, data: { id: newId, email, name: name || email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'Missing fields' });
  try {
    const [rows] = await pool.query('SELECT id, email, name, password_hash FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    res.cookie('userId', String(user.id), { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, data: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('userId');
  res.json({ success: true });
});

// Get current user (session check)
app.get('/api/auth/me', requireUser, (req, res) => {
  res.json({ success: true, data: { id: req.user.id, email: req.user.email, name: req.user.name } });
});

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

app.get('/api/projects', requireUser, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/projects', requireUser, async (req, res) => {
  const { id, name, data } = req.body;
  if (!id || !name || !data) return res.status(400).json({ success: false, error: 'Missing fields' });
  try {
    await pool.query(
      `INSERT INTO projects (id, user_id, name, data) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), data = VALUES(data), updated_at = CURRENT_TIMESTAMP`,
      [id, req.user.id, name, data]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/projects/:id', requireUser, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.delete('/api/projects/:id', requireUser, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── CUSTOM PRESETS ───────────────────────────────────────────────────────────

app.get('/api/presets', requireUser, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM custom_presets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/presets', requireUser, async (req, res) => {
  const { name, type, width, depth, color, icon, font_size } = req.body;
  if (!name || !type || width == null || depth == null || !color || !icon)
    return res.status(400).json({ success: false, error: 'Missing fields' });
  try {
    const [result] = await pool.query(
      'INSERT INTO custom_presets (user_id, name, type, width, depth, color, icon, font_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, type, width, depth, color, icon, font_size || 16]
    );
    res.json({ success: true, data: { id: result.insertId } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.put('/api/presets/:id', requireUser, async (req, res) => {
  const { name, type, width, depth, color, icon, font_size } = req.body;
  try {
    await pool.query(
      'UPDATE custom_presets SET name=?, type=?, width=?, depth=?, color=?, icon=?, font_size=? WHERE id=? AND user_id=?',
      [name, type, width, depth, color, icon, font_size, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.delete('/api/presets/:id', requireUser, async (req, res) => {
  try {
    await pool.query('DELETE FROM custom_presets WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Serve static files from the React build
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
});
