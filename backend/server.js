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
  if (err) {
    console.error('資料庫連接失敗:', err.message);
  } else {
    console.log('已成功連接 SQLite 資料庫');
  }
});

// =======================
// users 資料表
// =======================
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

// 舊資料表補欄位（安全）
db.run(`ALTER TABLE users ADD COLUMN login_token TEXT`, () => {});

// =======================
// 註冊 API
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
      if (err) {
        return res.status(400).json({ error: '此學號已被註冊' });
      }
      res.json({ message: '註冊成功' });
    }
  );
});

// =======================
// 登入 API（token）
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
      [loginToken, user.id],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: '無法儲存 login_token' });
        }

        res.json({
          message: '登入成功',
          user: {
            id: user.id,
            name: user.name,
            bio: user.bio,
            login_token: loginToken
          }
        });
      }
    );
  });
});

// =======================
// 🔐 驗證登入狀態 API（重點）
// =======================
app.get('/api/me', (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: '未提供 token' });
  }

  db.get(
    `SELECT id, name, bio FROM users WHERE login_token = ?`,
    [token],
    (err, user) => {
      if (err) return res.status(500).json({ error: '資料庫錯誤' });
      if (!user) return res.status(401).json({ error: 'token 無效' });

      res.json({ user });
    }
  );
});

// =======================
// 🚪 登出 API
// =======================
app.post('/api/logout', (req, res) => {
  const token = req.headers.authorization;

  db.run(
    `UPDATE users SET login_token = NULL WHERE login_token = ?`,
    [token],
    () => {
      res.json({ message: '已登出' });
    }
  );
});

// =======================
// production 靜態檔
// =======================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// =======================
app.listen(PORT, () => {
  console.log(`後端伺服器運行中: http://localhost:${PORT}`);
});
