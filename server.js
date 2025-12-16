const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// 1. 初始化 SQLite 資料庫
const db = new sqlite3.Database('./skill_exchange.db', (err) => {
  if (err) console.error('資料庫連接失敗:', err.message);
  else console.log('已成功連接 SQLite 資料庫');
});

// 2. 建立資料表與初始化
db.serialize(() => {
  // Users 表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, 
    password TEXT,
    name TEXT,
    bio TEXT,
    avatar_url TEXT
  )`);

  // User_Skills 表
  db.run(`CREATE TABLE IF NOT EXISTS user_skills (
    user_id TEXT,
    skill_id INTEGER,
    level INTEGER,
    PRIMARY KEY (user_id, skill_id)
  )`);

  // Skills 表 (修正了原本的語法錯誤)
  db.run(`CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT
  )`, (err) => {
    if (!err) {
      // 檢查是否需要塞入預設資料
      db.get("SELECT count(*) as count FROM skills", (err, row) => {
        if (row && row.count === 0) {
          console.log("正在初始化技能資料庫...");
          const stmt = db.prepare("INSERT INTO skills (name, category) VALUES (?, ?)");
          const seedData = [
            ['Python', 'Programming'], ['JavaScript', 'Programming'], ['C++', 'Programming'],
            ['英文', 'Language'], ['日文', 'Language'], ['韓文', 'Language'],
            ['吉他', 'Music'], ['鋼琴', 'Music'], ['唱歌', 'Music'],
            ['籃球', 'Sports'], ['羽球', 'Sports'], ['健身', 'Sports']
          ];
          seedData.forEach(skill => stmt.run(skill));
          stmt.finalize();
          console.log("技能資料初始化完成！");
        }
      });
    }
  });
});

// --- API 區域 ---

// [POST] 註冊
app.post('/api/register', (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ error: '請輸入學號與密碼' });
  const sql = `INSERT INTO users (id, password) VALUES (?, ?)`;
  db.run(sql, [id, password], function(err) {
    if (err) return res.status(400).json({ error: '此學號已被註冊' });
    res.json({ message: '註冊成功！' });
  });
});

// [POST] 登入
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  const sql = `SELECT * FROM users WHERE id = ? AND password = ?`;
  db.get(sql, [id, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) {
      res.json({ message: '登入成功', user: { id: user.id, name: user.name, bio: user.bio } });
    } else {
      res.status(401).json({ error: '學號或密碼錯誤' });
    }
  });
});

// [POST] 更新個人資料 (補上這個以防 Profile 頁面報錯)
app.post('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, bio } = req.body;
    db.run(`UPDATE users SET name = ?, bio = ? WHERE id = ?`, [name, bio, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "更新成功" });
    });
});

// [GET] 取得單一使用者資料
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// [GET] 取得所有技能 (含狀態)
app.get('/api/skills/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT s.id, s.name, s.category, us.level 
    FROM skills s
    LEFT JOIN user_skills us ON s.id = us.skill_id AND us.user_id = ?
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// [POST] 更新技能
app.post('/api/update-skill', (req, res) => {
  const { userId, skillId, level } = req.body;
  if (level === 0) {
    db.run("DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?", [userId, skillId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "已移除技能" });
    });
  } else {
    db.run("REPLACE INTO user_skills (user_id, skill_id, level) VALUES (?, ?, ?)", 
      [userId, skillId, level], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "技能更新成功" });
    });
  }
});
// [POST] 更新個人資料 (修改這段，加入 avatar_url)
app.post('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, bio, avatar_url } = req.body; // 多接收一個 avatar_url
    
    // SQL 語法加入 avatar_url = ?
    db.run(`UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?`, 
      [name, bio, avatar_url, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "更新成功" });
    });
});

// 部署設定
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`後端伺服器運行中: http://localhost:${PORT}`);
});