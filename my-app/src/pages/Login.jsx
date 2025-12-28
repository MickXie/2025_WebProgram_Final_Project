import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MagicCard } from "@/components/UI/magic-card";
import API_URL from "../api";

function Login() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("loginToken");
    const timestamp = localStorage.getItem("loginTimestamp");

    if (token && timestamp) {
      const now = Date.now();
      const loginTime = parseInt(timestamp, 10);
      if (now - loginTime < 4 * 60 * 60 * 1000) {
        navigate("/profile");
      }
    }
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const endpoint = isRegistering ? "/api/register" : "/api/login";
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: studentId,
          password: password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "發生錯誤");
        return;
      }
      if (isRegistering) {
        setMessage("註冊成功！請直接登入。");
        setIsRegistering(false);
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("loginToken", data.user.login_token);
      localStorage.setItem("loginTimestamp", Date.now().toString());
      alert("登入成功！");
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/profile");
    } catch (error) {
      console.error(error);
      setMessage("無法連接伺服器，請確認後端是否啟動");
    }
  };
  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-50 px-4 pt-24 text-[#334155]">
      <MagicCard
        className="
          w-full max-w-md
          rounded-xl
          border border-slate-200
          shadow-[0_1px_2px_rgba(0,0,0,0.04)]
        "
        gradientSize={220}
        gradientOpacity={0.35}
        gradientFrom="#000000"
        gradientTo="#555555"
        gradientColor="rgba(0,0,0,0.12)"
      >
        <div className="p-8">
          <h2 className="mb-1 text-center text-2xl font-semibold">
            學生帳號
          </h2>
          <p className="mb-8 text-center text-sm text-slate-500">
            登入以繼續使用 Brain Barter
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm text-slate-500">
                學號
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="
                  w-full
                  rounded-md
                  border border-slate-300
                  bg-white
                  px-3 py-2
                  text-slate-900
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-1
                  focus:ring-slate-400/40
                "
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-500">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full
                  rounded-md
                  border border-slate-300
                  bg-white
                  px-3 py-2
                  text-slate-900
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-1
                  focus:ring-slate-400/40
                "
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                onClick={() => setIsRegistering(false)}
                className={`
                  inline-flex items-center justify-center
                  rounded-md
                  py-2.5
                  text-sm font-medium
                  transition
                  active:scale-[0.98]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-slate-400/50
                  ${
                    !isRegistering
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white text-slate-500 border border-slate-300 hover:text-slate-700"
                  }
                `}
              >
                登入
              </button>
              <button
                type="submit"
                onClick={() => setIsRegistering(true)}
                className={`
                  inline-flex items-center justify-center
                  rounded-md
                  py-2.5
                  text-sm font-medium
                  transition
                  active:scale-[0.98]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-slate-400/50
                  ${
                    isRegistering
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white text-slate-500 border border-slate-300 hover:text-slate-700"
                  }
                `}
              >
                註冊
              </button>
            </div>
          </form>
          {message && (
            <p className="mt-4 text-center text-sm text-red-500">
              {message}
            </p>
          )}
        </div>
      </MagicCard>
    </div>
  );
}

export default Login;
