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

// 5. 好友關係表 (新增部分)
  // status 預設為 'accepted' 代表直接成為好友 (也可以設計成 pending 等待確認)
  db.run(`CREATE TABLE IF NOT EXISTS friendships (
    user_id TEXT,
    friend_id TEXT,
    status TEXT DEFAULT 'accepted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id)
  )`);

  // 6. 訊息記錄表 (新增)
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id TEXT,
    receiver_id TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
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

// 在 server.js 新增此路由
app.get('/api/explore', (req, res) => {
  const sql = `
    SELECT 
      u.id, u.name, u.bio, u.avatar_url,
      (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('name', s.name, 'level', us.level))
       FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id) as skills,
      (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('name', s.name, 'level', ui.level))
       FROM user_interests ui JOIN skills s ON ui.skill_id = s.id WHERE ui.user_id = u.id) as interests
    FROM users u
  `;
  //Explore 路由
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // 解析 JSON 字串
    const users = rows.map(row => ({
      ...row,
      skills: JSON.parse(row.skills || '[]'),
      interests: JSON.parse(row.interests || '[]')
    }));
    res.json(users);
  });
});

// 新增：添加好友路由
// ✅ 新的：送出好友邀請（pending）
app.post('/api/add-friend', (req, res) => {
  const { userId, friendId } = req.body;

  if (userId === friendId) {
    return res.status(400).json({ error: '不能加自己為好友' });
  }

  const checkSql = `
    SELECT status FROM friendships
    WHERE (user_id=? AND friend_id=?)
       OR (user_id=? AND friend_id=?)
  `;

  db.get(checkSql, [userId, friendId, friendId, userId], (err, row) => {
    if (row) {
      if (row.status === 'accepted')
        return res.status(400).json({ error: '已經是好友' });
      if (row.status === 'pending')
        return res.status(400).json({ error: '好友邀請已送出' });
      if (row.status === 'rejected')
        return res.status(400).json({ error: '對方曾拒絕過邀請' });
    }

    const sql = `
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES (?, ?, 'pending')
    `;

    db.run(sql, [userId, friendId], function(err) {
      if (err) return res.status(500).json({ error: '資料庫錯誤' });
      res.json({ message: '好友邀請已發出', success: true });
    });
  });
});



// =======================
// 新增：聊天室相關路由
// =======================

app.get('/api/my-friends', (req, res) => {
  const token = req.headers.authorization;
  db.get(
    `SELECT id FROM users WHERE login_token = ?`,
    [token],
    (err, user) => {
      if (!user) return res.status(401).json({ error: '未登入' });
      const myId = user.id;

      const sql = `
        SELECT u.id, u.name, u.avatar_url, f.status
        FROM users u
        JOIN friendships f
          ON (f.user_id = u.id OR f.friend_id = u.id)
        WHERE (f.user_id = ? OR f.friend_id = ?)
          AND u.id != ?
          AND f.status = 'accepted'
      `;

      db.all(sql, [myId, myId, myId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    }
  );
});


// 取得 pending 的好友邀請
app.get('/api/friend-requests', (req, res) => {
  const token = req.headers.authorization;

  db.get(
    `SELECT id FROM users WHERE login_token = ?`,
    [token],
    (err, user) => {
      if (!user) return res.status(401).json({ error: '未登入' });
      const myId = user.id;

      const sql = `
        SELECT
          f.user_id,
          f.friend_id,
          u.id AS other_id,
          u.name,
          u.avatar_url,
          f.status
        FROM friendships f
        JOIN users u
          ON u.id = CASE
            WHEN f.user_id = ? THEN f.friend_id
            ELSE f.user_id
          END
        WHERE (f.user_id = ? OR f.friend_id = ?)
          AND f.status = 'pending'
      `;

      db.all(sql, [myId, myId, myId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    }
  );
});

app.post('/api/accept-friend', (req, res) => {
  const { userId, friendId } = req.body;

  const sql = `
    UPDATE friendships
    SET status = 'accepted'
    WHERE user_id = ? AND friend_id = ? AND status = 'pending'
  `;

  db.run(sql, [userId, friendId], function(err) {
    if (err) return res.status(500).json({ error: '資料庫錯誤' });
    if (this.changes === 0)
      return res.status(400).json({ error: '邀請不存在或已處理' });

    res.json({ message: '好友邀請已接受' });
  });
});

app.post('/api/reject-friend', (req, res) => {
  const { userId, friendId } = req.body;

  const sql = `
    UPDATE friendships
    SET status = 'rejected'
    WHERE user_id = ? AND friend_id = ? AND status = 'pending'
  `;

  db.run(sql, [userId, friendId], function(err) {
    if (err) return res.status(500).json({ error: '資料庫錯誤' });
    if (this.changes === 0)
      return res.status(400).json({ error: '邀請不存在或已處理' });

    res.json({ message: '好友邀請已拒絕' });
  });
});
app.post('/api/remove-friend', (req, res) => {
  const token = req.headers.authorization;
  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ error: '缺少 friendId' });
  }

  // 用 token 找我是誰
  db.get(
    `SELECT id FROM users WHERE login_token = ?`,
    [token],
    (err, user) => {
      if (!user) return res.status(401).json({ error: '未登入' });

      const myId = user.id;

      const sql = `
        DELETE FROM friendships
        WHERE
          (user_id = ? AND friend_id = ?)
          OR
          (user_id = ? AND friend_id = ?)
      `;

      db.run(sql, [myId, friendId, friendId, myId], function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: '資料庫錯誤' });
        }

        if (this.changes === 0) {
          return res.status(400).json({ error: '好友關係不存在' });
        }

        res.json({ message: '已刪除好友' });
      });
    }
  );
});
// 2. 取得與某人的聊天記錄 (Polling 會一直呼叫這支 API)
app.get('/api/messages/:friendId', (req, res) => {
  const token = req.headers.authorization;
  const friendId = req.params.friendId;

  db.get(`SELECT id FROM users WHERE login_token = ?`, [token], (err, user) => {
    if (!user) return res.status(401).json({ error: '未登入' });
    const myId = user.id;

    const sql = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `;
    db.all(sql, [myId, friendId, friendId, myId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

// 3. 發送訊息
app.post('/api/messages', (req, res) => {
  const { senderId, receiverId, content } = req.body;
  
  if (!content || !receiverId) return res.status(400).json({ error: '內容不能為空' });

  const sql = `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
  db.run(sql, [senderId, receiverId, content], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '發送成功', id: this.lastID });
  });
});



// --- 核心：智慧配對系統 (JS 邏輯版) ---
app.get('/api/match-candidates', async (req, res) => {
  const token = req.headers.authorization;
  
  // 1. 取得我的資料
  db.get(`SELECT id FROM users WHERE login_token = ?`, [token], (err, me) => {
    if (!me) return res.status(401).json({ error: '未登入' });

    // 2. 抓取我的「需求」與「能力」
    const mySql = `
      SELECT 'interest' as type, skill_id, level FROM user_interests WHERE user_id = ?
      UNION
      SELECT 'skill' as type, skill_id, level FROM user_skills WHERE user_id = ?
    `;

    db.all(mySql, [me.id, me.id], (err, myData) => {
      if (err) return res.status(500).json({ error: err.message });

      const myInterests = myData.filter(d => d.type === 'interest');
      const mySkills = myData.filter(d => d.type === 'skill');

      // 3. 抓取所有「候選人」的完整資料 (排除自己 & 排除好友)
      // 這裡直接抓出所有需要的欄位，稍後用 JS 算分
      const candidatesSql = `
        SELECT 
          u.id, u.name, u.bio, u.avatar_url,
          (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('id', s.id, 'name', s.name, 'level', us.level)) 
           FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id) as skills_json,
          (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('id', s.id, 'name', s.name, 'level', ui.level)) 
           FROM user_interests ui JOIN skills s ON ui.skill_id = s.id WHERE ui.user_id = u.id) as interests_json
        FROM users u
        WHERE u.id != ? 
        AND u.id NOT IN (
           SELECT friend_id FROM friendships WHERE user_id = ?
           UNION
           SELECT user_id FROM friendships WHERE friend_id = ?
        )
      `;

      db.all(candidatesSql, [me.id, me.id, me.id], (err, candidates) => {
        if (err) return res.status(500).json({ error: err.message });

        // --- 演算法開始 (The Algorithm) ---
        
        // 權重轉換函式: 1->1, 2->3, 3->5
        const getWeight = (lvl) => lvl === 3 ? 5 : (lvl === 2 ? 3 : 1);

        const scoredCandidates = candidates.map(user => {
          const theirSkills = JSON.parse(user.skills_json || '[]');
          const theirInterests = JSON.parse(user.interests_json || '[]');

          let rawScore = 0;
          let commonSkills = [];

          // A. 計算「我想學，他會教」 (Forward Match)
          myInterests.forEach(myInt => {
            const match = theirSkills.find(s => s.id === myInt.skill_id);
            if (match) {
              // 公式：我的慾望等級 * 他的能力等級
              const score = getWeight(myInt.level) * getWeight(match.level);
              rawScore += score;
              commonSkills.push(match.name);
            }
          });

          // B. 檢查「互惠加成」 (Reverse Match Bonus)
          let hasReverseMatch = false;
          mySkills.forEach(mySkill => {
             const match = theirInterests.find(target => target.id === mySkill.skill_id);
             if (match) hasReverseMatch = true;
          });

          // 如果互相需要，分數 x 1.3
          if (hasReverseMatch && rawScore > 0) {
            rawScore = Math.round(rawScore * 1.3);
          }

          // C. 轉換成百分比 (Normalization)
          // 假設 40 分算 99% (約等於兩個完美契合的技能 5x5 + 5x5 = 50)
          let percentage = Math.min(Math.round((rawScore / 40) * 100), 99);
          // 確保至少有 10% 避免太難看 (如果是純探索卡，可以更低)
          if (percentage === 0 && rawScore > 0) percentage = 10;

          return {
            ...user,
            skills: theirSkills,
            interests: theirInterests,
            raw_score: rawScore,
            match_percentage: percentage,
            common_skills: commonSkills.join(', '),
            is_mutual: hasReverseMatch // 標記是否為互惠
          };
        });

        // --- 排序與篩選邏輯 (2 高 + 1 低) ---
        
        // 1. 先把有分數的人抓出來排序
        const activeMatches = scoredCandidates.filter(u => u.raw_score > 0)
                                              .sort((a, b) => b.raw_score - a.raw_score);
        
        // 2. 抓出「探索型」 (分數很低甚至是 0 的人，用來探索未知)
        const lowMatches = scoredCandidates.filter(u => u.raw_score <= 5) // 分數低於 5 分算探索
                                           .sort(() => 0.5 - Math.random()); // 隨機打亂

        let finalResults = [];

        // 取前 2 名高分
        if (activeMatches.length > 0) finalResults.push(activeMatches[0]);
        if (activeMatches.length > 1) finalResults.push(activeMatches[1]);

        // 取 1 名探索 (如果有剩下的低分者，且不是已經被選入的前兩名)
        const explorationCandidate = lowMatches.find(u => !finalResults.includes(u));
        if (explorationCandidate) {
          // 給探索卡加上一個標記，前端可以用
          explorationCandidate.is_exploration = true;
          finalResults.push(explorationCandidate);
        } else if (activeMatches.length > 2) {
            // 如果沒人可探索，就補第 3 名高分
            finalResults.push(activeMatches[2]);
        }

        res.json(finalResults);
      });
    });
  });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));