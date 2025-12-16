import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 小時

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
      // 登入過期
      localStorage.removeItem("loginToken");
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");

      alert("登入已超過 4 小時，請重新登入");
      setAuthState("expired");
      navigate("/login");
    } else {
      setAuthState("loggedIn");
    }
  }, [navigate]);

  // ⏳ 檢查中（避免畫面閃爍）
  if (authState === "checking") {
    return null;
  }

  // ❌ 未登入或已過期 → 顯示你原本的模糊 UI
  if (authState !== "loggedIn") {
    return (
      <div className="blur-container">
        <div className="blur-content">
          <Outlet />
        </div>
        <div className="login-required-warning">
          請先登入才能使用此功能
          <br />
          <button onClick={() => navigate("/login")}>
            前往登入
          </button>
        </div>
      </div>
    );
  }

  // ✅ 已登入 → 正常顯示頁面
  return <Outlet />;
}
