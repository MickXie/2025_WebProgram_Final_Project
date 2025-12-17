// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// =======================
// SQLite 初始化
// =======================
const db = new sqlite3.Database('./skill_exchange.db', (err) => {
  if (err) console.error('資料庫連接失敗:', err.message);
  else console.log('已成功連接 SQLite 資料庫');
});

// =======================
// 建立資料表
// =======================
db.serialize(() => {
  // users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      password TEXT,
      name TEXT,
      bio TEXT,
      avatar_url TEXT,
      login_token TEXT
    )
  `);

  // skills
  db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT
    )
  `, () => {
    db.get(`SELECT COUNT(*) as count FROM skills`, (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO skills (name, category) VALUES (?, ?)`);
        [
          ['Python', 'Programming'], ['JavaScript', 'Programming'], ['C++', 'Programming'],
          ['英文', 'Language'], ['日文', 'Language'], ['韓文', 'Language'],
          ['吉他', 'Music'], ['鋼琴', 'Music'], ['唱歌', 'Music'],
          ['籃球', 'Sports'], ['羽球', 'Sports'], ['健身', 'Sports']
        ].forEach(s => stmt.run(s));
        stmt.finalize();
        console.log('技能資料初始化完成');
      }
    });
  });

  // user_skills
  db.run(`
    CREATE TABLE IF NOT EXISTS user_skills (
      user_id TEXT,
      skill_id INTEGER,
      level INTEGER,
      PRIMARY KEY (user_id, skill_id)
    )
  `);
});

// =======================
// 註冊
// =======================
app.post('/api/register', (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: '請輸入學號與密碼' });
  }

  db.run(
    `INSERT INTO users (id, password) VALUES (?, ?)`,
    [id, password],
    (err) => {
      if (err) return res.status(400).json({ error: '此學號已被註冊' });
      res.json({ message: '註冊成功' });
    }
  );
});

// =======================
// 登入（token 版）
// =======================
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;

  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
    if (err) return res.status(500).json({ error: '資料庫錯誤' });
    if (!user) return res.status(401).json({ error: '用戶不存在' });
    if (user.password !== password) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    const loginToken = crypto.randomUUID();

    db.run(
      `UPDATE users SET login_token = ? WHERE id = ?`,
      [loginToken, id],
      () => {
        res.json({
          message: '登入成功',
          user: {
            id: user.id,
            name: user.name,
            bio: user.bio,
            avatar_url: user.avatar_url,
            login_token: loginToken
          }
        });
      }
    );
  });
});

// =======================
// 🔐 驗證登入
// =======================
app.get('/api/me', (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: '未提供 token' });

  db.get(
    `SELECT id, name, bio, avatar_url FROM users WHERE login_token = ?`,
    [token],
    (err, user) => {
      if (!user) return res.status(401).json({ error: 'token 無效' });
      res.json({ user });
    }
  );
});

// =======================
// 🚪 登出
// =======================
app.post('/api/logout', (req, res) => {
  const token = req.headers.authorization;

  db.run(
    `UPDATE users SET login_token = NULL WHERE login_token = ?`,
    [token],
    () => res.json({ message: '已登出' })
  );
});

// =======================
// 使用者資料
// =======================
app.get('/api/users/:id', (req, res) => {
  db.get(`SELECT * FROM users WHERE id = ?`, [req.params.id], (err, row) => {
    res.json(row || {});
  });
});

app.post('/api/users/:id', (req, res) => {
  const { name, bio, avatar_url } = req.body;
  db.run(
    `UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?`,
    [name, bio, avatar_url, req.params.id],
    () => res.json({ message: '更新成功' })
  );
});

// =======================
// 技能系統
// =======================
app.get('/api/skills/:userId', (req, res) => {
  const sql = `
    SELECT s.id, s.name, s.category, us.level
    FROM skills s
    LEFT JOIN user_skills us
    ON s.id = us.skill_id AND us.user_id = ?
  `;
  db.all(sql, [req.params.userId], (err, rows) => res.json(rows));
});

app.post('/api/update-skill', (req, res) => {
  const { userId, skillId, level } = req.body;

  if (level === 0) {
    db.run(
      `DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?`,
      [userId, skillId],
      () => res.json({ message: '已移除技能' })
    );
  } else {
    db.run(
      `REPLACE INTO user_skills (user_id, skill_id, level) VALUES (?, ?, ?)`,
      [userId, skillId, level],
      () => res.json({ message: '技能更新成功' })
    );
  }
});

// =======================
// production
// =======================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`後端伺服器運行中: http://localhost:${PORT}`);
});
