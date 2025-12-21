import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const FOUR_HOURS = 4 * 60 * 60 * 1000;

export default function PrivateLayout() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState("checking");
  // checking | loggedIn | expired | notLoggedIn

  useEffect(() => {
    const token = localStorage.getItem("loginToken");
    const timestamp = localStorage.getItem("loginTimestamp");

    if (!token || !timestamp) {
      setAuthState("notLoggedIn");
      return;
    }

    const loginTime = Number(timestamp);
    const now = Date.now();

    if (now - loginTime > FOUR_HOURS) {
      localStorage.removeItem("loginToken");
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      // 建議：過期時不要用 alert，體驗不好，直接顯示鎖定畫面即可
      setAuthState("expired");
    } else {
      setAuthState("loggedIn");
    }
  }, [navigate]);

  if (authState === "checking") return null;

  // ✅ 已登入
  if (authState === "loggedIn") return <Outlet />;

  // ❌ 未登入或過期 -> 顯示高級灰鎖定畫面
  return (
    <div style={styles.container}>
      {/* 背景模糊層 */}
      <div style={styles.blurContent}>
         {/* 這裡稍微顯示Outlet內容但被模糊，製造層次感，如果不想要可以拿掉 */}
         <Outlet /> 
      </div>
      
      {/* 覆蓋在上方的鎖定卡片 */}
      <div style={styles.overlay}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>
            🔒
          </div>
          <h2 style={styles.title}>
            {authState === "expired" ? "登入已過期" : "權限受限"}
          </h2>
          <p style={styles.message}>
            探索完整功能，請先登入您的學號與密碼。
            <br />
            加入我們的技能交換社群。
          </p>
          
          <button 
            onClick={() => navigate("/login")}
            style={styles.button}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#000'; // Hover 變全黑
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#333'; // 恢復高級灰
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
          >
            前往登入
          </button>
        </div>
      </div>
    </div>
  );
}

// ✨ 高級灰樣式定義 (JSS)
const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9', // 極淺的灰底
  },
  blurContent: {
    filter: 'blur(8px) grayscale(50%)', // 模糊 + 去色，讓背景不要搶戲
    opacity: 0.6,
    pointerEvents: 'none', // 禁止點擊背景
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // 確保在最上層
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // 極淡的白色遮罩
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px 50px',
    borderRadius: '16px', // 圓潤邊角
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)', // 擴散的大陰影，營造懸浮感
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    border: '1px solid #eaeaea', // 極細的邊框增加精緻度
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    backgroundColor: '#f5f5f5',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    margin: '0 auto 20px auto',
    color: '#333',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a1a1a', // 接近黑色的深灰
    letterSpacing: '1px', // 增加字距提升高級感
  },
  message: {
    margin: '0 0 30px 0',
    fontSize: '0.95rem',
    color: '#666', // 中灰色文字
    lineHeight: '1.6',
  },
  button: {
    backgroundColor: '#333', // 經典深灰 (Charcoal)
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '30px', // 膠囊型按鈕
    cursor: 'pointer',
    transition: 'all 0.3s ease', // 平滑過渡動畫
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    letterSpacing: '0.5px',
  }
};