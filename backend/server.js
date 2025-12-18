// server.js (修改版)

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
  
// --- 圖片上傳設定 ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

// --- 資料庫連線 ---
const db = new sqlite3.Database('./skill_exchange.db', (err) => {
  if (err) console.error('資料庫連接失敗:', err.message);
  else console.log('已成功連接 SQLite 資料庫');
});

// --- 資料庫初始化 ---
db.serialize(() => {
  // 1. 使用者表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    password TEXT,
    name TEXT,
    bio TEXT,
    avatar_url TEXT,
    login_token TEXT
  )`);

  // 2. 技能庫
  db.run(`CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT
  )`, () => {
    db.get(`SELECT COUNT(*) as count FROM skills`, (err, row) => {
      if (row && row.count === 0) {
        const stmt = db.prepare(`INSERT INTO skills (name, category) VALUES (?, ?)`);
        const fullSkillList = [
          { name: 'Python', category: '程式設計' }, { name: 'JavaScript', category: '程式設計' },
          { name: 'React', category: '程式設計' }, { name: 'C/C++', category: '程式設計' },
          { name: '英文口說', category: '語言' }, { name: '日文', category: '語言' },
          { name: '微積分', category: '學科' }, { name: '木吉他', category: '音樂' },
          { name: '健身', category: '運動' }, { name: '烹飪', category: '生活' }
        ];
        fullSkillList.forEach(s => stmt.run(s.name, s.category));
        stmt.finalize();
      }
    });
  });

  // 3. 使用者-技能關聯表 (我擁有的)
  db.run(`CREATE TABLE IF NOT EXISTS user_skills (
    user_id TEXT,
    skill_id INTEGER,
    level INTEGER,
    PRIMARY KEY (user_id, skill_id) 
  )`);

  // 4. 使用者-學習目標關聯表 (我想學的) - 對應 Profile.jsx 的 learning-goals
  db.run(`CREATE TABLE IF NOT EXISTS user_interests (
    user_id TEXT,
    skill_id INTEGER,
    level INTEGER,
    PRIMARY KEY (user_id, skill_id) 
  )`);
});

// --- 身份驗證路由 ---
app.post('/api/register', (req, res) => {
  const { id, password } = req.body;
  db.run(`INSERT INTO users (id, password) VALUES (?, ?)`, [id, password], (err) => {
    if (err) return res.status(400).json({ error: '註冊失敗' });
    res.json({ message: '註冊成功' });
  });
});

app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  db.get(`SELECT * FROM users WHERE id = ? AND password = ?`, [id, password], (err, user) => {
    if (!user) return res.status(401).json({ error: '帳號或密碼錯誤' });
    const token = crypto.randomUUID();
    db.run(`UPDATE users SET login_token = ? WHERE id = ?`, [token, id], () => {
      res.json({ message: '登入成功', user: { ...user, login_token: token } });
    });
  });
});

app.get('/api/me', (req, res) => {
  const token = req.headers.authorization;
  db.get(`SELECT id, name, bio, avatar_url FROM users WHERE login_token = ?`, [token], (err, user) => {
    if (!user) return res.status(401).json({ error: '驗證失敗' });
    res.json({ user });
  });
});

// --- 個人資料更新 ---
app.post('/api/users/:id', upload.single('avatarFile'), (req, res) => {
  const userId = req.params.id;
  const { name, bio } = req.body;
  let avatar_url = null;
  if (req.file) {
    avatar_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  if (avatar_url) {
    db.run(`UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?`, [name, bio, avatar_url, userId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '更新成功', avatar_url });
    });
  } else {
    db.run(`UPDATE users SET name = ?, bio = ? WHERE id = ?`, [name, bio, userId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '更新成功' });
    });
  }
});

// --- 技能系統 (Skills) ---
app.get('/api/skills/:userId', (req, res) => {
  const sql = `
    SELECT s.id, s.name, s.category, us.level
    FROM skills s
    LEFT JOIN user_skills us ON s.id = us.skill_id AND us.user_id = ?`;
  db.all(sql, [req.params.userId], (err, rows) => res.json(rows));
});

app.post('/api/update-skill', (req, res) => {
  const { userId, skillId, level } = req.body;
  if (level === 0) {
    db.run(`DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?`, [userId, skillId], () => res.json({ message: '已移除' }));
  } else {
    db.run(`REPLACE INTO user_skills (user_id, skill_id, level) VALUES (?, ?, ?)`, [userId, skillId, level], () => res.json({ message: '更新成功' }));
  }
});

// --- 學習目標系統 (Learning Goals / Interests) ---
// 對應 Profile.jsx 的 fetchLearningGoals
app.get('/api/learning-goals/:userId', (req, res) => {
  const sql = `
    SELECT s.id, s.name, s.category, ui.level
    FROM skills s
    LEFT JOIN user_interests ui ON s.id = ui.skill_id AND ui.user_id = ?`;
  db.all(sql, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 對應 Profile.jsx 的 handleLearningUpdate
app.post('/api/update-learning-goal', (req, res) => {
  const { userId, skillId, level } = req.body;
  if (level === 0) {
    db.run(`DELETE FROM user_interests WHERE user_id = ? AND skill_id = ?`, [userId, skillId], () => res.json({ message: '已移除' }));
  } else {
    db.run(`REPLACE INTO user_interests (user_id, skill_id, level) VALUES (?, ?, ?)`, [userId, skillId, level], () => res.json({ message: '更新成功' }));
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));