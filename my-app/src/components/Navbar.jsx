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
      // 過期自動清除
      localStorage.removeItem("loginToken");
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    // 初始檢查
    checkLogin();

    // ✅ 同分頁登入 / 登出（Login.jsx 會 dispatch）
    window.addEventListener("auth-changed", checkLogin);

    // ✅ 不同分頁同步
    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("auth-changed", checkLogin);
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  // 🚪 登出
  const handleLogout = () => {
    localStorage.clear();

    // 🔔 通知 Navbar / 其他元件
    window.dispatchEvent(new Event("auth-changed"));

    navigate("/login");
  };

  return (
    <nav>
      <div className="logo">SkillSwap</div>

      <ul>
        {/* 永遠可見 */}
        <li><NavLink to="/" end>首頁</NavLink></li>
        <li><NavLink to="/about">關於</NavLink></li>

        {/* 未登入 */}
        {!loggedIn && (
          <li><NavLink to="/login">登入 / 註冊</NavLink></li>
        )}

        {/* 已登入 */}
        {loggedIn && (
          <>
            <li><NavLink to="/explore">探索</NavLink></li>
            <li><NavLink to="/match">配對</NavLink></li>
            <li><NavLink to="/chat">聊天室</NavLink></li>
            <li><NavLink to="/profile">我的檔案</NavLink></li>
            <li>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "red"
                }}
              >
                登出
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
