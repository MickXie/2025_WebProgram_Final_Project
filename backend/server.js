// server.js

// =======================
// 1. 引入模組 (Imports)
// =======================
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer'); // 新增：處理檔案上傳
const fs = require('fs');         // 新增：處理檔案系統

// =======================
// 2. 伺服器設定 (Setup)
// =======================
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// 注意：bodyParser.json() 只能處理 JSON，處理圖片上傳會由 multer 接手
app.use(bodyParser.json());

// =======================
// 新增：圖片上傳相關設定
// =======================

// 1. 確保專案目錄下有 'uploads' 資料夾，沒有就自動建立
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('已建立 uploads 資料夾');
}

// 2. 設定 Multer 儲存策略 (位置與檔名)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 檔案存到 uploads/
  },
  filename: function (req, file, cb) {
    // 避免檔名重複，加上時間戳記：例如 17150000_mypic.jpg
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 3. 開放 'uploads' 資料夾，讓前端可以透過 URL (http://.../uploads/xxx.jpg) 讀取圖片
app.use('/uploads', express.static('uploads'));


// =======================
// 3. 資料庫連線 (Database Connection)
// =======================
const db = new sqlite3.Database('./skill_exchange.db', (err) => {
  if (err) console.error('資料庫連接失敗:', err.message);
  else console.log('已成功連接 SQLite 資料庫');
});

// =======================
// 4. 資料庫初始化 (Initialize Tables)
// =======================
db.serialize(() => {
  
  // --- 1. 使用者表 ---
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

  // --- 2. 技能表 (包含完整初始化清單) ---
  db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT
    )
  `, () => {
    // 當表格確認建立後，檢查是否為空
    db.get(`SELECT COUNT(*) as count FROM skills`, (err, row) => {
      if (row && row.count === 0) {
        console.log("偵測到技能表為空，開始插入完整分類資料...");
        const stmt = db.prepare(`INSERT INTO skills (name, category) VALUES (?, ?)`);
        
        const fullSkillList = [
          // --- 程式與科技 ---
          { name: 'Python', category: '程式設計' },
          { name: 'JavaScript', category: '程式設計' },
          { name: 'React', category: '程式設計' },
          { name: 'C/C++', category: '程式設計' },
          { name: 'Java', category: '程式設計' },
          { name: '網頁切版 (HTML/CSS)', category: '程式設計' },
          { name: 'App開發 (iOS/Android)', category: '程式設計' },
          { name: 'AI/機器學習', category: '程式設計' },

          // --- 語言學習 ---
          { name: '英文口說', category: '語言' },
          { name: '多益 (TOEIC)', category: '語言' },
          { name: '日文', category: '語言' },
          { name: '韓文', category: '語言' },
          { name: '法文', category: '語言' },
          { name: '德文', category: '語言' },
          { name: '西班牙文', category: '語言' },
          { name: '中文導覽', category: '語言' },

          // --- 大學學科 ---
          { name: '微積分', category: '學科' },
          { name: '統計學', category: '學科' },
          { name: '普通物理', category: '學科' },
          { name: '經濟學', category: '學科' },
          { name: '會計學', category: '學科' },
          { name: '心理學概論', category: '學科' },

          // --- 音樂與藝術 ---
          { name: '木吉他', category: '音樂' },
          { name: '電吉他', category: '音樂' },
          { name: '烏克麗麗', category: '音樂' },
          { name: '鋼琴', category: '音樂' },
          { name: '流行歌唱', category: '音樂' },
          { name: '混音/編曲', category: '音樂' },
          { name: '素描/水彩', category: '藝術' },
          { name: '電繪 (Procreate/PS)', category: '藝術' },
          { name: '攝影', category: '藝術' },
          { name: '影片剪輯 (Premiere/Final Cut)', category: '藝術' },

          // --- 運動與健康 ---
          { name: '籃球', category: '運動' },
          { name: '羽球', category: '運動' },
          { name: '排球', category: '運動' },
          { name: '網球', category: '運動' },
          { name: '重訓/健身', category: '運動' },
          { name: '瑜珈', category: '運動' },
          { name: '跑步', category: '運動' },
          { name: '滑板', category: '運動' },

          // --- 生活與其他 ---
          { name: '投資理財', category: '生活' },
          { name: '烹飪/烘焙', category: '生活' },
          { name: '塔羅牌/占卜', category: '生活' },
          { name: '桌遊/狼人殺', category: '生活' },
          { name: '電競 (LoL/Valorant)', category: '生活' }
        ];
        
        fullSkillList.forEach(s => stmt.run(s.name, s.category));
        
        stmt.finalize(() => {
            console.log('✅ 完整技能列表初始化完成！');
        });
      } else {
        console.log(`技能表已有 ${row.count} 筆資料，跳過初始化。`);
      }
    });
  });

  // --- 3. 使用者-技能關聯表 ---
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
// 5. API 路由：註冊與登入
// =======================

// 註冊
app.post('/api/register', (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ error: '請輸入學號與密碼' });

  db.run(`INSERT INTO users (id, password) VALUES (?, ?)`, [id, password], (err) => {
    if (err) return res.status(400).json({ error: '此學號已被註冊' });
    res.json({ message: '註冊成功' });
  });
});

// 登入
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
    if (err) return res.status(500).json({ error: '資料庫錯誤' });
    if (!user) return res.status(401).json({ error: '用戶不存在' });
    if (user.password !== password) return res.status(401).json({ error: '密碼錯誤' });

    const loginToken = crypto.randomUUID();
    db.run(`UPDATE users SET login_token = ? WHERE id = ?`, [loginToken, id], () => {
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
    });
  });
});

// 身分驗證 (Check Auth)
app.get('/api/me', (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: '未提供 token' });
  
  db.get(`SELECT id, name, bio, avatar_url FROM users WHERE login_token = ?`, [token], (err, user) => {
    if (!user) return res.status(401).json({ error: 'token 無效' });
    res.json({ user });
  });
});

// 登出
app.post('/api/logout', (req, res) => {
  const token = req.headers.authorization;
  db.run(`UPDATE users SET login_token = NULL WHERE login_token = ?`, [token], () => res.json({ message: '已登出' }));
});

// =======================
// 6. API 路由：使用者資料管理 (Profile)
// =======================

// 取得特定使用者公開資料
app.get('/api/users/:id', (req, res) => {
  db.get(`SELECT * FROM users WHERE id = ?`, [req.params.id], (err, row) => {
    res.json(row || {});
  });
});

// [重要修改] 更新個人資料 (支援圖片上傳)
app.post('/api/users/:id', upload.single('avatarFile'), (req, res) => {
  const userId = req.params.id;
  const { name, bio } = req.body;
  
  // 檢查是否有上傳新檔案
  let newAvatarUrl = null;
  if (req.file) {
    const protocol = req.protocol;
    const host = req.get('host');
    // 組合完整的圖片網址： http://localhost:3001/uploads/檔名
    newAvatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  }

  // 根據是否有新圖片，執行不同的 SQL 更新指令
  if (newAvatarUrl) {
    db.run(
      `UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?`,
      [name, bio, newAvatarUrl, userId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '更新成功', avatar_url: newAvatarUrl });
      }
    );
  } else {
    db.run(
      `UPDATE users SET name = ?, bio = ? WHERE id = ?`,
      [name, bio, userId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '更新成功 (無圖片變更)' });
      }
    );
  }
});

// =======================
// 7. API 路由：技能系統
// =======================

// 取得技能清單
app.get('/api/skills/:userId', (req, res) => {
  const sql = `
    SELECT s.id, s.name, s.category, us.level
    FROM skills s
    LEFT JOIN user_skills us
    ON s.id = us.skill_id AND us.user_id = ?
  `;
  db.all(sql, [req.params.userId], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: '資料庫讀取錯誤' });
    } else {
      res.json(rows);
    }
  });
});

// 更新技能程度
app.post('/api/update-skill', (req, res) => {
  const { userId, skillId, level } = req.body;

  if (level === 0) {
    db.run(`DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?`, [userId, skillId], () => res.json({ message: '已移除技能' }));
  } else {
    db.run(`REPLACE INTO user_skills (user_id, skill_id, level) VALUES (?, ?, ?)`, [userId, skillId, level], () => res.json({ message: '技能更新成功' }));
  }
});

// =======================
// 8. 生產環境與啟動
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