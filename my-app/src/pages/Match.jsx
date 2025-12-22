import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchOverlay from '../components/MatchOverlay'; // 引入剛剛的動畫組件
import API_URL from "../api";

function Match() {
  // --- State 定義 ---
  const [candidates, setCandidates] = useState([]); // 候選人列表
  const [currentIndex, setCurrentIndex] = useState(0); // 目前看到第幾個

  // 動畫相關 State
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // 存自己的資料(為了顯示頭像)

  const [loading, setLoading] = useState(true);

  // --- 音效控制 Ref ---
  const audioRef = useRef(null);

  const navigate = useNavigate();

  // --- 1. 頁面生命週期管理：離開頁面時停止音效 ---
  useEffect(() => {
    return () => {
      // 這段程式碼會在「組件卸載 (跳轉頁面)」時執行
      if (audioRef.current) {
        console.log("正在離開 Match 頁面，停止音效...");
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // --- 2. 載入資料 (候選人 & 自己) ---
  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    if (!token) { navigate('/login'); return; }

    // (A) 抓取配對候選人
    fetch(`${API_URL}/api/match-candidates`, {
      headers: { 'Authorization': token }
    })
      .then(res => res.json())
      .then(data => {
        setCandidates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("配對資料載入失敗:", err);
        setLoading(false);
      });

    // (B) 抓取「我」的資料 (為了顯示頭像)
    fetch(`${API_URL}/api/me`, { headers: { 'Authorization': token } })
      .then(res => res.json())
      .then(data => {
        if (data.user) setCurrentUser(data.user);
      });

  }, [navigate, API_URL]);

  // --- 輔助函式：取得技能顏色 ---（✅ 原本保留）
  const getLevelColor = (level) => {
    if (level === 3) return '#D32F2F'; // 紅色 (精通)
    if (level === 2) return '#1976D2'; // 藍色 (熟練)
    return '#388E3C';                  // 綠色 (略懂)
  };

  // =====================
  // 🎨 UI 升級：標籤「漸層 + 層次」(新增，不動你原本邏輯)
  // - 仍保留 getLevelColor / 既有 map/資料
  // - 只是最終 render 時改用更高級的背景與陰影
  // =====================
  const getSkillTagVisual = (level) => {
    // 低飽和、但仍有彩度層次（更高級，不刺眼）
    if (level === 3) {
      return {
        backgroundImage: 'linear-gradient(135deg, rgba(244,63,94,0.95), rgba(225,29,72,0.95))',
        boxShadow: '0 8px 22px rgba(225,29,72,0.22)',
      };
    }
    if (level === 2) {
      return {
        backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.95), rgba(37,99,235,0.95))',
        boxShadow: '0 8px 22px rgba(37,99,235,0.20)',
      };
    }
    return {
      backgroundImage: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))',
      boxShadow: '0 8px 22px rgba(5,150,105,0.18)',
    };
  };

  const getGoalTagVisual = (level) => {
    // 目標一樣分層，但用暖色系（橘/琥珀）更好辨識
    if (level === 3) {
      return {
        backgroundImage: 'linear-gradient(135deg, rgba(245,158,11,0.95), rgba(217,119,6,0.95))',
        boxShadow: '0 8px 22px rgba(217,119,6,0.18)',
      };
    }
    if (level === 2) {
      return {
        backgroundImage: 'linear-gradient(135deg, rgba(251,191,36,0.92), rgba(245,158,11,0.92))',
        boxShadow: '0 8px 22px rgba(245,158,11,0.14)',
      };
    }
    return {
      backgroundImage: 'linear-gradient(135deg, rgba(254,215,170,0.92), rgba(251,146,60,0.92))',
      boxShadow: '0 8px 22px rgba(251,146,60,0.12)',
    };
  };

  // --- 輔助函式：產生推薦評語 ---（✅ 原本保留）
  const getMatchComment = (card) => {
    if (card.is_exploration || card.match_percentage < 30) {
      return {
        title: "_探索新領域_",
        text: `雖然目前的興趣重疊度不高 (${card.match_percentage}%)，但這也許是接觸未知領域的好機會？跨出舒適圈試試看！`,
        color: '#4CAF50'
      };
    }
    if (card.is_mutual) {
      return {
        title: "-互惠學習夥伴-",
        text: `太棒了！你們彼此都擁有對方想學的技能，這是最理想的「技能交換」組合，教學相長效率最高！`,
        color: '#9C27B0'
      };
    }
    if (card.match_percentage >= 80) {
      return {
        title: "!天作之合!",
        text: `演算法分析顯示你們有極高的契合度 (${card.match_percentage}%)！對方完全符合你的學習需求，千萬別錯過這位大神。`,
        color: '#FF5722'
      };
    }
    return {
      title: "✨ 推薦人選",
      text: `根據你的興趣，你們在「${card.common_skills || '學習目標'}」上有不錯的交集，適合一起進步。`,
      color: '#2196F3'
    };
  };

  // --- 3. 核心動作：處理 "邀請學習" (Match) ---（✅ 原本保留）
  const handleMatch = async () => {
    const target = candidates[currentIndex];
    const token = localStorage.getItem('loginToken');

    try {
      // (1) 發送 API 請求
      await fetch(`${API_URL}/api/add-friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ friendId: target.id })
      });

      // (2) 播放音效邏輯
      // 如果舊的還在播，先停止
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // 建立新音效 (請確認檔案路徑正確)
      const audio = new Audio('/match-sound.mp3');
      audio.volume = 0.8; // 音量 80%
      audioRef.current = audio; // 存入 Ref

      // 嘗試播放 (處理瀏覽器自動播放限制)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("自動播放被瀏覽器阻擋:", error);
        });
      }

      // (3) 開啟視覺動畫
      setMatchedUser(target);
      setShowMatchAnimation(true);

    } catch (error) { console.error("配對失敗", error); }
  };

  // --- 4. 核心動作：處理 "跳過" 或 "動畫結束後繼續" ---（✅ 原本保留）
  const handleNext = () => {
    // 關閉動畫 (但音效會繼續播，因為我們沒有在這裡 pause)
    setShowMatchAnimation(false);

    // 檢查是否還有下一個人
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert("今日推薦人選已瀏覽完畢！請明天再來。");
    }
  };

  // --- Render 渲染層 ---

  // 載入中狀態（✅ 原本保留）
  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#666', marginTop: '100px' }}>
      <h3>📐 演算法運算中...</h3>
      <p>正在為您尋找最佳學習夥伴</p>
    </div>
  );

  // 沒資料狀態（✅ 原本保留）
  if (candidates.length === 0) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
      <h2>🔍 找不到配對對象</h2>
      <p>目前沒有符合的學習夥伴，或是你已經看過所有人了。</p>
      <button onClick={() => navigate('/profile')} style={styles.btnSecondary}>去更新個人檔案</button>
    </div>
  );

  // 取得當前卡片資料（✅ 原本保留）
  const card = candidates[currentIndex];
  const comment = getMatchComment(card);

  return (
    <div style={styles.container}>

      {/* --- 配對動畫組件 (Overlay) ---（✅ 原本保留） */}
      {showMatchAnimation && (
        <MatchOverlay
          currentUser={currentUser}   // 傳入自己
          matchedUser={matchedUser}   // 傳入對方
          onClose={handleNext}        // 如果按關閉，就換下一位
        />
      )}

      {/* --- 主要內容區塊 ---（✅ 原本保留） */}
      <h2 style={{ width: '100%', textAlign: 'center', marginBottom: '20px', color: '#444' }}>
        每日精選學習夥伴 ({currentIndex + 1}/{candidates.length})
      </h2>

      <div style={styles.splitLayout}>

        {/* --- 左側：決策面板 (Profile Card) ---（✅ 原本保留） */}
        <div style={styles.leftPanel}>
          <div style={styles.imageWrapper}>
            <img
              src={card.avatar_url || 'https://via.placeholder.com/300'}
              alt={card.name}
              style={styles.avatar}
            />

            {/* 顯示匹配度標籤（✅ 原本保留 + UI 升級） */}
            <div style={styles.matchBadge}>
              {card.match_percentage}% Match
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '5px 0 20px 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
              {card.name}
            </h2>

            {/* 決策按鈕區（✅ 原本保留 + hover 微互動） */}
            <div style={styles.actions}>
              <button
                onClick={handleNext}
                style={{ ...styles.btn, ...styles.btnSkip }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                跳過
              </button>

              <button
                onClick={handleMatch}
                style={{ ...styles.btn, ...styles.btnLike }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                邀請學習
              </button>
            </div>
          </div>
        </div>

        {/* --- 右側：詳細資料 (Resume) ---（✅ 原本保留） */}
        <div style={styles.rightPanel}>

          {/* 關於我（✅ 原本保留） */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>關於我</h3>
            <p style={{ lineHeight: '1.6', color: '#555', fontSize: '1rem' }}>
              {card.bio || "這位同學很專心學習，還沒空寫自我介紹..."}
            </p>
          </div>

          {/* 技能樹（✅ 原本保留 + tag 彩色層次升級） */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>我能教你的 (Skills)</h3>
            <div style={styles.tagContainer}>
              {card.skills && card.skills.length > 0 ? (
                card.skills.map((skill, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.skillTag,
                      // ✅ 原本邏輯：有 level -> getLevelColor(level)
                      // ✅ UI 升級：以漸層覆蓋 backgroundColor（不改資料邏輯）
                      backgroundColor: getLevelColor(skill.level),
                      ...getSkillTagVisual(skill.level),
                      border: '1px solid rgba(255,255,255,0.22)',
                    }}
                  >
                    {skill.name}
                    <span style={{ opacity: 0.88, fontSize: '0.8em', marginLeft: '4px' }}>
                      Lv.{skill.level}
                    </span>
                  </div>
                ))
              ) : (
                <span style={{ color: '#999' }}>未填寫技能</span>
              )}
            </div>
          </div>

          {/* 學習目標（✅ 原本保留 + tag 彩色層次升級） */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>我想學的 (Goals)</h3>
            <div style={styles.tagContainer}>
              {card.interests && card.interests.length > 0 ? (
                card.interests.map((skill, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.skillTag,
                      // ✅ 原本：'#FF9800'
                      // ✅ UI 升級：仍是暖色系，但有層次（依 level 也分層）
                      backgroundColor: '#FF9800',
                      ...getGoalTagVisual(skill.level),
                      border: '1px solid rgba(255,255,255,0.22)',
                    }}
                  >
                    {skill.name}
                    <span style={{ opacity: 0.88, fontSize: '0.8em', marginLeft: '4px' }}>
                      Lv.{skill.level}
                    </span>
                  </div>
                ))
              ) : (
                <span style={{ color: '#999' }}>未填寫目標</span>
              )}
            </div>
          </div>

          {/* AI 智慧評語區塊（✅ 原本保留 + 背景層次微提升） */}
          <div style={{
            ...styles.suggestionBox,
            borderLeft: `5px solid ${comment.color}`,
            background: `linear-gradient(135deg, ${comment.color}18, ${comment.color}08)`,
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: comment.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {comment.title}
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#444', lineHeight: '1.5' }}>
              {comment.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CSS Styles (完整樣式表) ---（✅ 原本保留 + 僅做 UI 增強，不刪 key）
const styles = {
  container: {
    maxWidth: '1000px', margin: '0 auto', padding: '20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '85vh'
  },
  splitLayout: {
    display: 'flex', width: '100%', height: '600px',
    backgroundColor: '#fff', borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden',
    border: '1px solid #eaeaea'
  },

  // 左側
  leftPanel: {
    width: '38%', backgroundColor: '#fdfdfd', borderRight: '1px solid #eee',
    display: 'flex', flexDirection: 'column', position: 'relative'
  },
  imageWrapper: {
    height: '60%', width: '100%', position: 'relative', overflow: 'hidden',
    borderBottom: '1px solid #eee'
  },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },

  // ✅ matchBadge：保留原本結構，但升級成更高級的漸層 + 光暈
  matchBadge: {
    position: 'absolute', bottom: '15px', right: '15px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.96), rgba(59,130,246,0.96))',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '30px',
    fontWeight: 'bold',
    boxShadow: '0 12px 28px rgba(59,130,246,0.28)',
    fontSize: '1.1rem',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.18)'
  },

  actions: { display: 'flex', gap: '15px', marginTop: 'auto', width: '100%' },

  btn: {
    flex: 1, padding: '14px', borderRadius: '50px', border: 'none',
    cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'transform 0.2s'
  },
  btnSkip: { backgroundColor: '#f0f0f0', color: '#666' },

  // ✅ btnLike：保留你原本藍色，但升級層次（更乾淨、較不刺眼）
  btnLike: {
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: 'white',
    boxShadow: '0 10px 24px rgba(37,99,235,0.28)'
  },

  btnSecondary: {
    padding: '10px 20px', marginTop: '10px', backgroundColor: '#333', color: '#fff',
    border: 'none', borderRadius: '5px', cursor: 'pointer'
  },

  // 右側
  rightPanel: {
    width: '62%', padding: '40px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', backgroundColor: '#fff'
  },
  section: { marginBottom: '30px' },
  sectionTitle: {
    borderLeft: '4px solid #ddd', paddingLeft: '12px',
    marginBottom: '15px', color: '#333', fontSize: '1.1rem', fontWeight: 'bold'
  },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },

  // ✅ skillTag：保留原本結構（白字、圓角、flex），但加一些高級細節
  skillTag: {
    padding: '6px 14px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    // 讓漸層更像產品級
    backgroundSize: '200% 200%',
    letterSpacing: '0.1px',
  },

  // ✅ suggestionBox：保留原本
  suggestionBox: {
    marginTop: 'auto', padding: '20px', borderRadius: '16px',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
  },
};

export default Match;
