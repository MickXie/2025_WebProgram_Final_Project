import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("loggedIn", "true");
    alert("登入成功，即將前往探索頁面");
    navigate("/explore");
  };

  return (
    <main>
      <div className="form-container" style={{ maxWidth: 400, margin: "0 auto" }}>
        <h2 id="form-title">學號登入</h2>
        <form id="auth-form" onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label>學號 (Student ID):</label><br />
            <input type="text" required style={{ width: "100%", padding: "8px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>密碼:</label><br />
            <input type="password" required style={{ width: "100%", padding: "8px" }} />
          </div>
          <button type="submit">登入</button>
        </form>
        <hr />
        <p>還沒有帳號？ <a href="#">註冊新帳號</a></p>
      </div>
    </main>
  );
}
