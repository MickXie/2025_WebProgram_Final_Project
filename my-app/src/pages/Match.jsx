import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Match() {
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [showMatchAnimation, setShowMatchAnimation] = useState(false); 
  const [matchedUser, setMatchedUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  // 自動判斷是本地開發還是上線環境
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  // --- 1. 載入配對人選 ---
  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    if (!token) { navigate('/login'); return; }

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
  }, [navigate, API_URL]);

  // --- 輔助函式：取得技能標籤顏色 ---
  const getLevelColor = (level) => {
    if (level === 3) return '#D32F2F'; // 紅 (精通)
    if (level === 2) return '#1976D2'; // 藍 (熟練)
    return '#388E3C';                  // 綠 (略懂)
  };

  // --- 輔助函式：產生動態評語 ---
  const getMatchComment = (card) => {
    // 1. 探索型 (低分或隨機推薦)
    if (card.is_exploration || card.match_percentage < 30) {
        return {
            title: "🌱 探索新領域",
            text: `雖然目前的興趣重疊度不高 (${card.match_percentage}%)，但這也許是接觸未知領域的好機會？跨出舒適圈試試看！`,
            color: '#4CAF50' // 綠色系
        };
    }
    // 2. 互惠型 (雙方都想學對方的技能) - 後端有回傳 is_mutual
    if (card.is_mutual) { 
        return {
            title: "🤝 互惠學習夥伴",
            text: `太棒了！你們彼此都擁有對方想學的技能，這是最理想的「技能交換」組合，教學相長效率最高！`,
            color: '#9C27B0' // 紫色系
        };
    }
    // 3. 高分型 (單向需求強烈)
    if (card.match_percentage >= 80) {
        return {
            title: "🔥 天作之合",
            text: `演算法分析顯示你們有極高的契合度 (${card.match_percentage}%)！對方完全符合你的學習需求，千萬別錯過這位大神。`,
            color: '#FF5722' // 橘紅色系
        };
    }
    // 4. 一般推薦
    return {
        title: "✨ 推薦人選",
        text: `根據你的興趣，你們在「${card.common_skills || '學習目標'}」上有不錯的交集，適合一起進步。`,
        color: '#2196F3' // 藍色系
    };
  };

  // --- 2. 處理 "配對/邀請" (Match) ---
  const handleMatch = async () => {
    const target = candidates[currentIndex];
    const token = localStorage.getItem('loginToken');
    
    try {
        // 先抓取我的 ID (為了 API 參數完整性)
        const resMe = await fetch(`${API_URL}/api/me`, { headers: {'Authorization': token}});
        const dataMe = await resMe.json();
        
        // 呼叫 API 加好友
        await fetch(`${API_URL}/api/add-friend`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': token 
            },
            body: JSON.stringify({ userId: dataMe.user.id, friendId: target.id })
        });

        // 觸發動畫
        setMatchedUser(target);
        setShowMatchAnimation(true);
        
        // 1.5秒後關閉動畫，換下一張
        setTimeout(() => {
            setShowMatchAnimation(false);
            handleNext(); 
        }, 1500);

    } catch (error) { console.error("配對失敗", error); }
  };

  // --- 3. 處理 "跳過" (Next) ---
  const handleNext = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert("今日推薦人選已瀏覽完畢！請明天再來。");
    }
  };

  // --- Render: 載入中 ---
  if (loading) return (
    <div style={{padding:'40px', textAlign:'center', color: '#666'}}>
        <h3>📐 演算法運算中...</h3>
        <p>正在為您尋找最佳學習夥伴</p>
    </div>
  );

  // --- Render: 沒資料 ---
  if (candidates.length === 0) return (
    <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
        <h2>🔍 找不到配對對象</h2>
        <p>目前沒有符合的學習夥伴，或是你已經看過所有人了。</p>
        <button onClick={() => navigate('/profile')} style={styles.btnSecondary}>去更新個人檔案</button>
    </div>
  );

  const card = candidates[currentIndex];
  const comment = getMatchComment(card); // 取得當前卡片的評語

  return (
    <div style={styles.container}>
      
      {/* --- 配對成功全螢幕動畫 (Overlay) --- */}
      {showMatchAnimation && (
        <div style={styles.overlay}>
          <div style={styles.matchBox}>
            <h1 style={styles.matchTitle}>It's a Match! 🎉</h1>
            <p style={{color: 'white', fontSize: '1.2rem'}}>你已經送出學習邀請！</p>
            
            <div style={styles.matchAvatarGroup}>
                <div style={styles.avatarCircle}>Me</div>
                <div style={{color:'white', fontSize:'2rem'}}>⚡</div>
                <img src={matchedUser?.avatar_url || 'https://via.placeholder.com/100'} style={styles.matchAvatar} alt="Partner" />
            </div>

            <button onClick={() => navigate('/chat')} style={styles.chatButton}>
                前往聊天室 💬
            </button>
          </div>
        </div>
      )}

      {/* --- 主要內容區塊：左右分割佈局 --- */}
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
                
                {/* 百分比顯示 (取代原本的分數) */}
                <div style={styles.matchBadge}>
                   {card.match_percentage}% Match
                </div>
            </div>
            
            <div style={{padding: '20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column'}}>
                <h2 style={{margin: '5px 0 20px 0', fontSize: '1.8rem'}}>{card.name}</h2>
                
                {/* 按鈕區 */}
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

        {/* --- 右側：詳細資料 (Detail Resume) --- */}
        <div style={styles.rightPanel}>
            
            {/* 1. 自我介紹 */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📖 關於我</h3>
                <p style={{lineHeight: '1.6', color: '#555', fontSize: '1rem'}}>
                    {card.bio || "這位同學很專心學習，還沒空寫自我介紹..."}
                </p>
            </div>

            {/* 2. 技能樹 (對方會什麼) */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>⚡ 我能教你的 (My Skills)</h3>
                <div style={styles.tagContainer}>
                    {card.skills && card.skills.length > 0 ? (
                        card.skills.map((skill, i) => (
                            <div key={i} style={{...styles.skillTag, backgroundColor: getLevelColor(skill.level)}}>
                                {skill.name} <span style={{opacity:0.8, fontSize:'0.8em', marginLeft: '4px'}}>Lv.{skill.level}</span>
                            </div>
                        ))
                    ) : (
                        <span style={{color:'#999'}}>未填寫技能</span>
                    )}
                </div>
            </div>

            {/* 3. 學習目標 (對方想學什麼) */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🎯 我想學的 (Learning Goals)</h3>
                <div style={styles.tagContainer}>
                    {card.interests && card.interests.length > 0 ? (
                        card.interests.map((skill, i) => (
                            <div key={i} style={{...styles.skillTag, backgroundColor: '#FF9800'}}>
                                {skill.name} <span style={{opacity:0.8, fontSize:'0.8em', marginLeft: '4px'}}>Lv.{skill.level}</span>
                            </div>
                        ))
                    ) : (
                        <span style={{color:'#999'}}>未填寫目標</span>
                    )}
                </div>
            </div>
            
            {/* 4. 底部智慧評語區 (AI Suggestion) */}
            <div style={{
                ...styles.suggestionBox, 
                borderLeft: `5px solid ${comment.color}`,
                backgroundColor: `${comment.color}15` // 加上 15 透明度當背景
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

// --- CSS Styles (樣式表) ---
const styles = {
  container: { 
    maxWidth: '1000px', margin: '0 auto', padding: '20px', 
    display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '85vh'
  },
  // 核心佈局：Flexbox 左右分割
  splitLayout: {
    display: 'flex', width: '100%', height: '600px', // 固定高度讓介面整齊
    backgroundColor: '#fff', borderRadius: '24px', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden',
    border: '1px solid #eaeaea'
  },
  
  // 左側樣式
  leftPanel: {
    width: '38%', backgroundColor: '#fdfdfd', borderRight: '1px solid #eee',
    display: 'flex', flexDirection: 'column',
    position: 'relative'
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
    cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.2s' 
  },
  btnSkip: { backgroundColor: '#f0f0f0', color: '#666' },
  btnLike: { 
    backgroundColor: '#2196F3', color: 'white', // 專業藍
    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)'
  },
  btnSecondary: {
    padding: '10px 20px', marginTop: '10px', backgroundColor: '#333', color: '#fff',
    border: 'none', borderRadius: '5px', cursor: 'pointer'
  },

  // 右側樣式
  rightPanel: {
    width: '62%', padding: '40px', overflowY: 'auto', // 內容過長可捲動
    display: 'flex', flexDirection: 'column',
    backgroundColor: '#fff'
  },
  section: { marginBottom: '30px' },
  sectionTitle: { 
    borderLeft: '4px solid #ddd', paddingLeft: '12px', 
    marginBottom: '15px', color: '#333', fontSize: '1.1rem' 
  },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  skillTag: {
    padding: '6px 14px', borderRadius: '20px', color: 'white',
    fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'
  },
  suggestionBox: {
    marginTop: 'auto', // 推到底部
    padding: '20px',
    borderRadius: '16px',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
  },

  // 動畫層 Overlay
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'fadeIn 0.3s'
  },
  matchBox: { textAlign: 'center', animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
  matchTitle: { 
    color: '#00E676', fontSize: '3.5rem', margin: '0 0 10px 0',
    textShadow: '0 0 20px rgba(0,230,118,0.5)', fontFamily: 'sans-serif'
  },
  matchAvatarGroup: { 
    display:'flex', alignItems:'center', justifyContent:'center', gap:'20px', margin:'30px 0' 
  },
  avatarCircle: {
    width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#555', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem',
    border: '4px solid white'
  },
  matchAvatar: { 
    width: '100px', height: '100px', borderRadius: '50%', 
    border: '4px solid white', objectFit: 'cover' 
  },
  chatButton: {
    padding: '16px 45px', fontSize: '1.2rem', fontWeight: 'bold',
    background: 'linear-gradient(45deg, #00E676, #00C853)', color: 'white', 
    border: 'none', borderRadius: '50px', cursor: 'pointer',
    boxShadow: '0 5px 20px rgba(0, 230, 118, 0.4)'
  }
};

export default Match;