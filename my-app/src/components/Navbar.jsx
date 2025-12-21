import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const FOUR_HOURS = 4 * 60 * 60 * 1000;

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 🔐 檢查是否登入 + 是否過期
  const checkLogin = () => {
    const token = localStorage.getItem("loginToken");
    const timestamp = localStorage.getItem("loginTimestamp");

    if (!token || !timestamp) {
      setLoggedIn(false);
      return;
    }

    const now = Date.now();
    const loginTime = Number(timestamp);

    if (now - loginTime < FOUR_HOURS) {
      setLoggedIn(true);
    } else {
      localStorage.removeItem("loginToken");
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLogin();
    window.addEventListener("auth-changed", checkLogin);
    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("auth-changed", checkLogin);
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  // 🚪 登出
  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  // --- 樣式定義 (高級灰/黑白主題) ---
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff', // 純白背景
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', // 極輕微的陰影提升質感
    borderBottom: '1px solid rgba(15, 23, 42, 0.08)', // ← 高級細底線
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a', // Slate-900 深黑色
    letterSpacing: '-0.5px',
    textDecoration: 'none',
  };

  const ulStyle = {
    display: 'flex',
    listStyle: 'none',
    gap: '2rem', // 選項之間的間距
    alignItems: 'center',
    margin: 0,
    padding: 0,
  };

  // 連結樣式生成函數 (處理 Active 狀態)
  const getLinkStyle = ({ isActive }) => ({
    textDecoration: 'none', // 🚫 移除底線
    color: isActive ? '#0f172a' : '#64748b', // Active: 深黑 / Inactive: 岩灰
    fontWeight: isActive ? '700' : '500', // Active 時加粗
    fontSize: '1rem',
    transition: 'color 0.2s ease',
  });

  const logoutBtnStyle = {
    padding: '8px 24px',
    borderRadius: '50px', // 🟢 橢圓形
    border: 'none',
    backgroundColor: '#334155', // Slate-700 高級深灰
    color: '#ffffff', // 白色文字
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  };

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <div style={logoStyle}>Brain Barter</div>

      <ul style={ulStyle}>
        {/* 永遠可見 */}
        <li>
          <NavLink to="/" end style={getLinkStyle}>
            Home
          </NavLink>
        </li>

        {/* 未登入 */}
        {!loggedIn && (
          <li>
            <NavLink to="/login" style={getLinkStyle}>
              Login / Register
            </NavLink>
          </li>
        )}

        {/* 已登入 */}
        {loggedIn && (
          <>
            <li>
              <NavLink to="/explore" style={getLinkStyle}>
                Explore
              </NavLink>
            </li>
            <li>
              <NavLink to="/match" style={getLinkStyle}>
                Match
              </NavLink>
            </li>
            <li>
              <NavLink to="/chat" style={getLinkStyle}>
                Chat
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" style={getLinkStyle}>
                Profile
              </NavLink>
            </li>
            <li>
              <button
                onClick={handleLogout}
                style={logoutBtnStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0f172a'} // Hover 變更黑
                onMouseOut={(e) => e.target.style.backgroundColor = '#334155'}
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}