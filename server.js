// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // 本地端會用 3001，Render 會用它分配的 port

app.use(cors()); // 允許前端 (Port 5173) 呼叫後端 (Port 3001)
app.use(bodyParser.json());

// 1. 初始化 SQLite 資料庫
const db = new sqlite3.Database('./skill_exchange.db', (err) => {
  if (err) {
    console.error('資料庫連接失敗:', err.message);
  } else {
    console.log('已成功連接 SQLite 資料庫');
  }
});

// 2. 建立資料表 (先寫學號 密碼，這兩個拿來登入 ，後面名子跟自介還有頭像連結登入後填)
//id 設為primary key 可以避免謝小米不看就merge，可以避免id重複 用於檢查註冊
db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, 
    password TEXT,
    name TEXT,
    bio TEXT,
    avatar_url TEXT
)`);

// --- API 區域 ---

// [POST] 註冊 API (讓你先創帳號用的)
app.post('/api/register', (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ error: '請輸入學號與密碼' });

  const sql = `INSERT INTO users (id, password) VALUES (?, ?)`;
  db.run(sql, [id, password], function(err) {
    if (err) {
      // 如果學號重複 (UNIQUE constraint failed)
      return res.status(400).json({ error: '此學號已被註冊' });
    }
    res.json({ message: '註冊成功！' });
  });
});

// [POST] 登入 API
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  
  const sql = `SELECT * FROM users WHERE id = ? AND password = ?`;
  db.get(sql, [id, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (user) {
      // 登入成功，回傳使用者基本資料 (不回傳密碼)
      res.json({ 
        message: '登入成功', 
        user: { id: user.id, name: user.name, bio: user.bio } 
      });
    } else {
      res.status(401).json({ error: '學號或密碼錯誤' });
    }
  });
});

// --- 部署設定 (關鍵部分) ---
// 這段意思是：如果環境變數是 production (Render 上)，才去讀取前端靜態檔案
// 本地開發時，這段不會執行，這樣你就可以開兩個視窗分別跑前後端
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`後端伺服器運行中: http://localhost:${PORT}`);
});


//狀態馬
//200 (預設)：成功。
//400：Bad Request (前端傳錯資料，例如沒填學號)。
//401：Unauthorized (未授權，就是登入失敗)。
//500：Internal Server Error (後端伺服器自己爆炸了)。 
