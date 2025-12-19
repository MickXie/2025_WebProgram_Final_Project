// src/components/MatchOverlay.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MatchOverlay.css'; // 記得引入 CSS

const MatchOverlay = ({ currentUser, matchedUser, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5); // 倒數 5 秒
  const navigate = useNavigate();

  useEffect(() => {
    // 這裡是你「自己匯入音效」的最佳位置
    // const audio = new Audio('/sounds/match-success.mp3');
    // audio.play();

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // 時間到之後，自動跳轉到聊天室
    if (timeLeft === 0) {
      clearInterval(timer);
      navigate('/chat');
    }

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  if (!matchedUser) return null;

  return (
    <div style={styles.overlay} className="overlay-fade-in">
      <div style={styles.content}>
        
        {/* 標題動畫 */}
        <h1 style={styles.title} className="animate-pop-in">IT'S A MATCH!</h1>
        <p style={styles.subtitle}>你與 {matchedUser.name} 配對成功！</p>

        {/* 頭像區域 */}
        <div style={styles.avatarContainer}>
          {/* 左邊：我 */}
          <div className="animate-slide-left" style={styles.avatarWrapper}>
            <img 
              src={currentUser?.avatar_url || "https://via.placeholder.com/150"} 
              alt="Me" 
              style={styles.avatar} 
            />
          </div>

          {/* 中間 ICON */}
          <div style={styles.iconWrapper}>⚡</div>

          {/* 右邊：對方 */}
          <div className="animate-slide-right" style={styles.avatarWrapper}>
            <img 
              src={matchedUser?.avatar_url || "https://via.placeholder.com/150"} 
              alt="Friend" 
              style={styles.avatar} 
            />
          </div>
        </div>

        {/* 倒數計時與按鈕 */}
        <div style={styles.footer}>
          <button onClick={() => navigate('/chat')} style={styles.chatButton}>
            立刻聊天 ({timeLeft})
          </button>
          
          <button onClick={onClose} style={styles.keepButton}>
            繼續探索
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS-in-JS 用於結構佈局
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999,
  },
  content: { textAlign: 'center', color: 'white' },
  title: {
    fontSize: '4rem', fontStyle: 'italic', fontWeight: '900',
    color: '#00E676', textShadow: '0 0 20px rgba(0,230,118,0.6)',
    margin: '0 0 10px 0', fontFamily: 'Arial, sans-serif'
  },
  subtitle: { fontSize: '1.2rem', color: '#ddd', marginBottom: '40px' },
  avatarContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', marginBottom: '40px',
  },
  avatarWrapper: {
    width: '130px', height: '130px', borderRadius: '50%',
    border: '5px solid white', overflow: 'hidden',
    boxShadow: '0 0 30px rgba(255,255,255,0.4)'
  },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },
  iconWrapper: { fontSize: '3rem', color: '#FFD700', textShadow: '0 0 10px #FFD700' },
  footer: { display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' },
  chatButton: {
    padding: '14px 45px', borderRadius: '50px', border: 'none',
    fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
    background: 'linear-gradient(45deg, #00E676, #00C853)', color: 'white',
    boxShadow: '0 5px 15px rgba(0, 230, 118, 0.4)'
  },
  keepButton: {
    background: 'transparent', border: '1px solid #aaa', color: '#aaa',
    padding: '8px 20px', borderRadius: '20px', cursor: 'pointer'
  },
};

export default MatchOverlay;