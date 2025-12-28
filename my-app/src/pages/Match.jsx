import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchOverlay from '../components/MatchOverlay'; 
import API_URL from "../api";

function Match() {
  const [candidates, setCandidates] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        console.log("正在離開 Match 頁面，停止音效...");
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);
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
    fetch(`${API_URL}/api/me`, { headers: { 'Authorization': token } })
      .then(res => res.json())
      .then(data => {
        if (data.user) setCurrentUser(data.user);
      });

  }, [navigate, API_URL]);
  const getLevelColor = (level) => {
    if (level === 3) return '#D32F2F'; 
    if (level === 2) return '#1976D2'; 
    return '#388E3C';                 
  };
  const getSkillTagVisual = (level) => {
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
  const handleMatch = async () => {
    const target = candidates[currentIndex];
    const token = localStorage.getItem('loginToken');
    try {
      await fetch(`${API_URL}/api/add-friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ friendId: target.id })
      });
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio('/match-sound.mp3');
      audio.volume = 0.8; 
      audioRef.current = audio; 
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("自動播放被瀏覽器阻擋:", error);
        });
      }
      setMatchedUser(target);
      setShowMatchAnimation(true);

    } catch (error) { console.error("配對失敗", error); }
  };
  const handleNext = () => {
    setShowMatchAnimation(false);
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert("今日推薦人選已瀏覽完畢！請明天再來。");
    }
  };
  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#666', marginTop: '100px' }}>
      <h3>📐 演算法運算中...</h3>
      <p>正在為您尋找最佳學習夥伴</p>
    </div>
  );
  if (candidates.length === 0) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
      <h2>🔍 找不到配對對象</h2>
      <p>目前沒有符合的學習夥伴，或是你已經看過所有人了。</p>
      <button onClick={() => navigate('/profile')} style={styles.btnSecondary}>去更新個人檔案</button>
    </div>
  );
  const card = candidates[currentIndex];
  const comment = getMatchComment(card);

  return (
    <div style={styles.container}>
      {showMatchAnimation && (
        <MatchOverlay
          currentUser={currentUser}  
          matchedUser={matchedUser}   
          onClose={handleNext}        
        />
      )}
      <h2 style={{ width: '100%', textAlign: 'center', marginBottom: '20px', color: '#444' }}>
        每日精選學習夥伴 ({currentIndex + 1}/{candidates.length})
      </h2>
      <div style={styles.splitLayout}>
        <div style={styles.leftPanel}>
          <div style={styles.imageWrapper}>
            <img
              src={card.avatar_url || 'https://via.placeholder.com/300'}
              alt={card.name}
              style={styles.avatar}
            />
            <div style={styles.matchBadge}>
              {card.match_percentage}% Match
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '5px 0 20px 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
              {card.name}
            </h2>
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
        <div style={styles.rightPanel}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>關於我</h3>
            <p style={{ lineHeight: '1.6', color: '#555', fontSize: '1rem' }}>
              {card.bio || "這位同學很專心學習，還沒空寫自我介紹..."}
            </p>
          </div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>我能教你的 (Skills)</h3>
            <div style={styles.tagContainer}>
              {card.skills && card.skills.length > 0 ? (
                card.skills.map((skill, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.skillTag,
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
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>我想學的 (Goals)</h3>
            <div style={styles.tagContainer}>
              {card.interests && card.interests.length > 0 ? (
                card.interests.map((skill, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.skillTag,
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
  btnLike: {
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: 'white',
    boxShadow: '0 10px 24px rgba(37,99,235,0.28)'
  },

  btnSecondary: {
    padding: '10px 20px', marginTop: '10px', backgroundColor: '#333', color: '#fff',
    border: 'none', borderRadius: '5px', cursor: 'pointer'
  },
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
    padding: '6px 14px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundSize: '200% 200%',
    letterSpacing: '0.1px',
  },
  suggestionBox: {
    marginTop: 'auto', padding: '20px', borderRadius: '16px',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
  },
};
export default Match;
