import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchOverlay from '../components/MatchOverlay'; // 引入剛剛的動畫組件

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
  // 自動切換 API 網址
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

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
         if(data.user) setCurrentUser(data.user);
      });

  }, [navigate, API_URL]);

  // --- 輔助函式：取得技能顏色 ---
  const getLevelColor = (level) => {
    if (level === 3) return '#D32F2F'; // 紅色 (精通)
    if (level === 2) return '#1976D2'; // 藍色 (熟練)
    return '#388E3C';                  // 綠色 (略懂)
  };

  // --- 輔助函式：產生推薦評語 ---
  const getMatchComment = (card) => {
    if (card.is_exploration || card.match_percentage < 30) {
        return { 
          title: "🌱 探索新領域", 
          text: `雖然目前的興趣重疊度不高 (${card.match_percentage}%)，但這也許是接觸未知領域的好機會？跨出舒適圈試試看！`, 
          color: '#4CAF50' 
        };
    }
    if (card.is_mutual) { 
        return { 
          title: "🤝 互惠學習夥伴", 
          text: `太棒了！你們彼此都擁有對方想學的技能，這是最理想的「技能交換」組合，教學相長效率最高！`, 
          color: '#9C27B0' 
        };
    }
    if (card.match_percentage >= 80) {
        return { 
          title: "🔥 天作之合", 
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

  // --- 3. 核心動作：處理 "邀請學習" (Match) ---
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
        const audio = new Audio('/public/match-sound.mp3'); 
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

  // --- 4. 核心動作：處理 "跳過" 或 "動畫結束後繼續" ---
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

  // 載入中狀態
  if (loading) return (
    <div style={{padding:'40px', textAlign:'center', color: '#666', marginTop: '100px'}}>
        <h3>📐 演算法運算中...</h3>
        <p>正在為您尋找最佳學習夥伴</p>
    </div>
  );

  // 沒資料狀態
  if (candidates.length === 0) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
        <h2>🔍 找不到配對對象</h2>
        <p>目前沒有符合的學習夥伴，或是你已經看過所有人了。</p>
        <button onClick={() => navigate('/profile')} style={styles.btnSecondary}>去更新個人檔案</button>
    </div>
  );

  // 取得當前卡片資料
  const card = candidates[currentIndex];
  const comment = getMatchComment(card);

  return (
    <div style={styles.container}>

      {/* --- 配對動畫組件 (Overlay) --- */}
      {showMatchAnimation && (
        <MatchOverlay 
            currentUser={currentUser}   // 傳入自己
            matchedUser={matchedUser}   // 傳入對方
            onClose={handleNext}        // 如果按關閉，就換下一位
        />
      )}

      {/* --- 主要內容區塊 --- */}
      <h2 style={{width:'100%', textAlign:'center', marginBottom:'20px', color:'#444'}}>
        每日精選學習夥伴 ({currentIndex + 1}/{candidates.length})
      </h2>

      <div style={styles.splitLayout}>
        
        {/* --- 左側：決策面板 (Profile Card) --- */}
        <div style={styles.leftPanel}>
            <div style={styles.imageWrapper}>
                <img 
                    src={card.avatar_url || 'https://via.placeholder.com/300'} 
                    alt={card.name} 
                    style={styles.avatar} 
                />
                {/* 顯示匹配度標籤 */}
                <div style={styles.matchBadge}>
                   {card.match_percentage}% Match
                </div>
            </div>
            
            <div style={{padding: '20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column'}}>
                <h2 style={{margin: '5px 0 20px 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#333'}}>
                    {card.name}
                </h2>
                
                {/* 決策按鈕區 */}
                <div style={styles.actions}>
                    <button onClick={handleNext} style={{...styles.btn, ...styles.btnSkip}}>
                        跳過
                    </button>
                    <button onClick={handleMatch} style={{...styles.btn, ...styles.btnLike}}>
                        邀請學習
                    </button>
                </div>
            </div>
        </div>

        {/* --- 右側：詳細資料 (Resume) --- */}
        <div style={styles.rightPanel}>
            
            {/* 關於我 */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📖 關於我</h3>
                <p style={{lineHeight: '1.6', color: '#555', fontSize: '1rem'}}>
                    {card.bio || "這位同學很專心學習，還沒空寫自我介紹..."}
                </p>
            </div>

            {/* 技能樹 */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>⚡ 我能教你的 (Skills)</h3>
                <div style={styles.tagContainer}>
                    {card.skills && card.skills.length > 0 ? (
                        card.skills.map((skill, i) => (
                            <div key={i} style={{...styles.skillTag, backgroundColor: getLevelColor(skill.level)}}>
                                {skill.name} 
                                <span style={{opacity:0.8, fontSize:'0.8em', marginLeft: '4px'}}>
                                    Lv.{skill.level}
                                </span>
                            </div>
                        ))
                    ) : (
                        <span style={{color:'#999'}}>未填寫技能</span>
                    )}
                </div>
            </div>

            {/* 學習目標 */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🎯 我想學的 (Goals)</h3>
                <div style={styles.tagContainer}>
                    {card.interests && card.interests.length > 0 ? (
                        card.interests.map((skill, i) => (
                            <div key={i} style={{...styles.skillTag, backgroundColor: '#FF9800'}}>
                                {skill.name} 
                                <span style={{opacity:0.8, fontSize:'0.8em', marginLeft: '4px'}}>
                                    Lv.{skill.level}
                                </span>
                            </div>
                        ))
                    ) : (
                        <span style={{color:'#999'}}>未填寫目標</span>
                    )}
                </div>
            </div>
            
            {/* AI 智慧評語區塊 */}
            <div style={{
                ...styles.suggestionBox, 
                borderLeft: `5px solid ${comment.color}`, 
                backgroundColor: `${comment.color}15` // 加上 15 Hex 透明度
            }}>
                <h4 style={{margin:'0 0 8px 0', color: comment.color, display:'flex', alignItems:'center', gap:'8px'}}>
                   {comment.title}
                </h4>
                <p style={{margin:0, fontSize: '0.95rem', color: '#444', lineHeight: '1.5'}}>
                    {comment.text}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- CSS Styles (完整樣式表) ---
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
  matchBadge: {
    position: 'absolute', bottom: '15px', right: '15px',
    backgroundColor: 'rgba(33, 150, 243, 0.95)', color: 'white', 
    padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', 
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontSize: '1.1rem',
    backdropFilter: 'blur(4px)'
  },
  actions: { display: 'flex', gap: '15px', marginTop: 'auto', width: '100%' },
  btn: { 
    flex: 1, padding: '14px', borderRadius: '50px', border: 'none', 
    cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'transform 0.2s' 
  },
  btnSkip: { backgroundColor: '#f0f0f0', color: '#666' },
  btnLike: { 
    backgroundColor: '#2196F3', color: 'white', 
    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)'
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
  skillTag: {
    padding: '6px 14px', borderRadius: '20px', color: 'white',
    fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'
  },
  suggestionBox: {
    marginTop: 'auto', padding: '20px', borderRadius: '16px', 
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
  },
};

export default Match;