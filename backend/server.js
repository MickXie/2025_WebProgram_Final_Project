// server.js (修正版 - 完整檔 - 支援聊天室檔案上傳)

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
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

// --- 資料庫連線 ---
const db = new sqlite3.Database('./skill_exchange.db', (err) => {
  if (err) console.error('資料庫連接失敗:', err.message);
  else console.log('已成功連接 SQLite 資料庫');
});

// --- 小工具：用 token 找目前登入者 id ---
function getUserIdByToken(req, cb) {
  const token = req.headers.authorization;
  if (!token) return cb({ status: 401, message: '未登入' });

  db.get(`SELECT id FROM users WHERE login_token = ?`, [token], (err, user) => {
    if (err) return cb({ status: 500, message: err.message });
    if (!user) return cb({ status: 401, message: '未登入' });
    cb(null, user.id);
  });
}

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

  // 4. 使用者-學習目標關聯表 (我想學的)
  db.run(`CREATE TABLE IF NOT EXISTS user_interests (
    user_id TEXT,
    skill_id INTEGER,
    level INTEGER,
    PRIMARY KEY (user_id, skill_id)
  )`);

  // 5. 好友關係表（pending/accepted/rejected）
  db.run(`CREATE TABLE IF NOT EXISTS friendships (
    user_id TEXT,
    friend_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id)
  )`);

  // 6. 訊息記錄表 (✅ 修改：新增 file_url 和 file_type)
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id TEXT,
    receiver_id TEXT,
    content TEXT,
    file_url TEXT,
    file_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// --- ✅ 新增：通用檔案上傳路由 (Chat 使用) ---
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '沒有上傳檔案' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ fileUrl, fileType: req.file.mimetype });
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
    db.run(
      `UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?`,
      [name, bio, avatar_url, userId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '更新成功', avatar_url });
      }
    );
  } else {
    db.run(
      `UPDATE users SET name = ?, bio = ? WHERE id = ?`,
      [name, bio, userId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '更新成功' });
      }
    );
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
    db.run(`DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?`, [userId, skillId], () =>
      res.json({ message: '已移除' })
    );
  } else {
    db.run(
      `REPLACE INTO user_skills (user_id, skill_id, level) VALUES (?, ?, ?)`,
      [userId, skillId, level],
      () => res.json({ message: '更新成功' })
    );
  }
});

// --- 學習目標系統 (Learning Goals / Interests) ---
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

app.post('/api/update-learning-goal', (req, res) => {
  const { userId, skillId, level } = req.body;
  if (level === 0) {
    db.run(`DELETE FROM user_interests WHERE user_id = ? AND skill_id = ?`, [userId, skillId], () =>
      res.json({ message: '已移除' })
    );
  } else {
    db.run(
      `REPLACE INTO user_interests (user_id, skill_id, level) VALUES (?, ?, ?)`,
      [userId, skillId, level],
      () => res.json({ message: '更新成功' })
    );
  }
});

// Explore
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
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const users = rows.map(row => ({
      ...row,
      skills: JSON.parse(row.skills || '[]'),
      interests: JSON.parse(row.interests || '[]'),
    }));
    res.json(users);
  });
});

/* =======================
   ✅ 新：送出好友邀請（pending）
   - 修正：用 token 反查 senderId（避免 Match 後 Chat 撈不到）
   ======================= */
app.post('/api/add-friend', (req, res) => {
  // 前端可以傳 friendId；userId 允許不傳（用 token 反查）
  const { friendId } = req.body;

  if (!friendId) return res.status(400).json({ error: '缺少 friendId' });

  getUserIdByToken(req, (e, senderId) => {
    if (e) return res.status(e.status).json({ error: e.message });

    if (senderId === friendId) {
      return res.status(400).json({ error: '不能加自己為好友' });
    }

    const checkSql = `
      SELECT status FROM friendships
      WHERE (user_id=? AND friend_id=?)
         OR (user_id=? AND friend_id=?)
    `;

    db.get(checkSql, [senderId, friendId, friendId, senderId], (err, row) => {
      if (err) return res.status(500).json({ error: '資料庫錯誤' });

      if (row) {
        if (row.status === 'accepted') return res.status(400).json({ error: '已經是好友' });
        if (row.status === 'pending') return res.status(400).json({ error: '好友邀請已送出' });
        if (row.status === 'rejected') return res.status(400).json({ error: '對方曾拒絕過邀請' });
      }

      const sql = `
        INSERT INTO friendships (user_id, friend_id, status)
        VALUES (?, ?, 'pending')
      `;

      db.run(sql, [senderId, friendId], function (err) {
        if (err) return res.status(500).json({ error: '資料庫錯誤' });
        res.json({ message: '好友邀請已發出', success: true });
      });
    });
  });
});

/* =======================
   聊天室相關路由
   ======================= */

// 取得已接受好友列表（修正：DISTINCT 防重複）
app.get('/api/my-friends', (req, res) => {
  getUserIdByToken(req, (e, myId) => {
    if (e) return res.status(e.status).json({ error: e.message });

    const sql = `
      SELECT DISTINCT u.id, u.name, u.avatar_url, f.status
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
  });
});

// 取得 pending 邀請（包含我送出的 & 我收到的）
app.get('/api/friend-requests', (req, res) => {
  getUserIdByToken(req, (e, myId) => {
    if (e) return res.status(e.status).json({ error: e.message });

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
      ORDER BY f.created_at DESC
    `;

    db.all(sql, [myId, myId, myId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

/* ✅ 接受邀請：只能「被邀請者」接受
   body: { userId: 發出者, friendId: 接受者 }
*/
app.post('/api/accept-friend', (req, res) => {
  const { userId, friendId } = req.body;

  getUserIdByToken(req, (e, myId) => {
    if (e) return res.status(e.status).json({ error: e.message });

    // 只有被邀請者（friendId）本人才能按接受
    if (myId !== friendId) {
      return res.status(403).json({ error: '你不是此邀請的接收者，不能接受' });
    }

    const sql = `
      UPDATE friendships
      SET status = 'accepted'
      WHERE user_id = ? AND friend_id = ? AND status = 'pending'
    `;

    db.run(sql, [userId, friendId], function (err) {
      if (err) return res.status(500).json({ error: '資料庫錯誤' });
      if (this.changes === 0) return res.status(400).json({ error: '邀請不存在或已處理' });
      res.json({ message: '好友邀請已接受', success: true });
    });
  });
});

/* ✅ 拒絕邀請：只能「被邀請者」拒絕 */
app.post('/api/reject-friend', (req, res) => {
  const { userId, friendId } = req.body;

  getUserIdByToken(req, (e, myId) => {
    if (e) return res.status(e.status).json({ error: e.message });

    if (myId !== friendId) {
      return res.status(403).json({ error: '你不是此邀請的接收者，不能拒絕' });
    }

    const sql = `
      UPDATE friendships
      SET status = 'rejected'
      WHERE user_id = ? AND friend_id = ? AND status = 'pending'
    `;

    db.run(sql, [userId, friendId], function (err) {
      if (err) return res.status(500).json({ error: '資料庫錯誤' });
      if (this.changes === 0) return res.status(400).json({ error: '邀請不存在或已處理' });
      res.json({ message: '好友邀請已拒絕', success: true });
    });
  });
});

// 刪除好友（保留你原功能）
app.post('/api/remove-friend', (req, res) => {
  const { friendId } = req.body;
  if (!friendId) return res.status(400).json({ error: '缺少 friendId' });

  getUserIdByToken(req, (e, myId) => {
    if (e) return res.status(e.status).json({ error: e.message });

    const sql = `
      DELETE FROM friendships
      WHERE (user_id = ? AND friend_id = ?)
         OR (user_id = ? AND friend_id = ?)
    `;

    db.run(sql, [myId, friendId, friendId, myId], function (err) {
      if (err) return res.status(500).json({ error: '資料庫錯誤' });
      if (this.changes === 0) return res.status(400).json({ error: '好友關係不存在' });
      res.json({ message: '已刪除好友', success: true });
    });
  });
});

// 取得聊天記錄（保留，SELECT * 會自動抓到新欄位）
app.get('/api/messages/:friendId', (req, res) => {
  const friendId = req.params.friendId;

  getUserIdByToken(req, (e, myId) => {
    if (e) return res.status(e.status).json({ error: e.message });

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

// ✅ 修改：發送訊息（支援文字 或 檔案）
app.post('/api/messages', (req, res) => {
  const { senderId, receiverId, content, fileUrl, fileType } = req.body;
  
  // 檢查：一定要有 接收者 且 (有文字 或 有檔案)
  if ((!content && !fileUrl) || !receiverId) {
    return res.status(400).json({ error: '內容或檔案不能為空' });
  }

  const sql = `INSERT INTO messages (sender_id, receiver_id, content, file_url, file_type) VALUES (?, ?, ?, ?, ?)`;
  
  // 如果沒有值則存 null
  db.run(sql, [senderId, receiverId, content || '', fileUrl || null, fileType || null], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '發送成功', id: this.lastID });
  });
});

// --- 核心：智慧配對系統 (你原本保留) ---
app.get('/api/match-candidates', async (req, res) => {
  const token = req.headers.authorization;

  db.get(`SELECT id FROM users WHERE login_token = ?`, [token], (err, me) => {
    if (!me) return res.status(401).json({ error: '未登入' });

    const mySql = `
      SELECT 'interest' as type, skill_id, level FROM user_interests WHERE user_id = ?
      UNION
      SELECT 'skill' as type, skill_id, level FROM user_skills WHERE user_id = ?
    `;

    db.all(mySql, [me.id, me.id], (err, myData) => {
      if (err) return res.status(500).json({ error: err.message });

      const myInterests = myData.filter(d => d.type === 'interest');
      const mySkills = myData.filter(d => d.type === 'skill');

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

        const getWeight = (lvl) => (lvl === 3 ? 5 : (lvl === 2 ? 3 : 1));

        const scoredCandidates = candidates.map(user => {
          const theirSkills = JSON.parse(user.skills_json || '[]');
          const theirInterests = JSON.parse(user.interests_json || '[]');

          let rawScore = 0;
          let commonSkills = [];

          myInterests.forEach(myInt => {
            const match = theirSkills.find(s => s.id === myInt.skill_id);
            if (match) {
              rawScore += getWeight(myInt.level) * getWeight(match.level);
              commonSkills.push(match.name);
            }
          });

          let hasReverseMatch = false;
          mySkills.forEach(mySkill => {
            const match = theirInterests.find(target => target.id === mySkill.skill_id);
            if (match) hasReverseMatch = true;
          });

          if (hasReverseMatch && rawScore > 0) rawScore = Math.round(rawScore * 1.3);

          let percentage = Math.min(Math.round((rawScore / 40) * 100), 99);
          if (percentage === 0 && rawScore > 0) percentage = 10;

          return {
            ...user,
            skills: theirSkills,
            interests: theirInterests,
            raw_score: rawScore,
            match_percentage: percentage,
            common_skills: commonSkills.join(', '),
            is_mutual: hasReverseMatch
          };
        });

        const activeMatches = scoredCandidates
          .filter(u => u.raw_score > 0)
          .sort((a, b) => b.raw_score - a.raw_score);

        const lowMatches = scoredCandidates
          .filter(u => u.raw_score <= 5)
          .sort(() => 0.5 - Math.random());

        let finalResults = [];
        if (activeMatches.length > 0) finalResults.push(activeMatches[0]);
        if (activeMatches.length > 1) finalResults.push(activeMatches[1]);

        const explorationCandidate = lowMatches.find(u => !finalResults.includes(u));
        if (explorationCandidate) {
          explorationCandidate.is_exploration = true;
          finalResults.push(explorationCandidate);
        } else if (activeMatches.length > 2) {
          finalResults.push(activeMatches[2]);
        }

        res.json(finalResults);
      });
    });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));