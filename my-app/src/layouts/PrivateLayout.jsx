import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const FOUR_HOURS = 4 * 60 * 60 * 1000;

export default function PrivateLayout() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState("checking");
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
      setAuthState("expired");
    } else {
      setAuthState("loggedIn");
    }
  }, [navigate]);
  if (authState === "checking") return null;
  if (authState === "loggedIn") return <Outlet />;
  return (
    <div style={styles.container}>
      <div style={styles.blurContent}>
         <Outlet /> 
      </div>
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
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#333'; 
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
const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9', 
  },
  blurContent: {
    filter: 'blur(8px) grayscale(50%)', 
    opacity: 0.6,
    pointerEvents: 'none', 
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
    zIndex: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px 50px',
    borderRadius: '16px', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    border: '1px solid #eaeaea', 
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
    color: '#1a1a1a', 
    letterSpacing: '1px', 
  },
  message: {
    margin: '0 0 30px 0',
    fontSize: '0.95rem',
    color: '#666', 
    lineHeight: '1.6',
  },
  button: {
    backgroundColor: '#333', 
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '30px', 
    cursor: 'pointer',
    transition: 'all 0.3s ease', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    letterSpacing: '0.5px',
  }
};
