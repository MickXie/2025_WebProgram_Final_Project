import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  
  useEffect(() => {
  const token = localStorage.getItem('loginToken');
  const timestamp = localStorage.getItem('loginTimestamp');

  if (token && timestamp) {
    const now = Date.now();
    const loginTime = parseInt(timestamp, 10);

    // 4 小時內 → 已登入 → 不准看 login
    if (now - loginTime < 4 * 60 * 60 * 1000) {
      navigate('/profile');
      }
    }
  }, [navigate]);

  // API 位址（本地 / Render 自動切換）
  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isRegistering ? '/api/register' : '/api/login';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: studentId,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || '發生錯誤');
        return;
      }

      // ===== 註冊成功 =====
      if (isRegistering) {
        setMessage('註冊成功！請切換至登入。');
        setIsRegistering(false);
        return;
      }

      // ===== 登入成功（核心重點）=====
      // 1️⃣ 存使用者資料
      localStorage.setItem('user', JSON.stringify(data.user));

      // 2️⃣ 存 login_token（後端產生）
      localStorage.setItem('loginToken', data.user.login_token);

      // 3️⃣ 存登入時間（毫秒）
      localStorage.setItem('loginTimestamp', Date.now().toString());

      // ===== 登入成功 =====
      alert('登入成功！');
      // 🔔 關鍵：通知 Navbar
      window.dispatchEvent(new Event("auth-changed"));
      navigate('/Profile');

    } catch (error) {
      console.error(error);
      setMessage('無法連接伺服器，請確認後端是否啟動');
    }
  };

  return (
    <div
      className="form-container"
      style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'left' }}
    >
      <h2 style={{ textAlign: 'center' }}>
        {isRegistering ? '註冊帳號' : '學生登入'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>學號</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
        >
          {isRegistering ? '註冊' : '登入'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        {message && (
          <span
            style={{
              color: 'red',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            {message}
          </span>
        )}

        <span
          style={{
            color: 'blue',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => {
            setIsRegistering(!isRegistering);
            setMessage('');
          }}
        >
          {isRegistering
            ? '已有帳號？點此登入'
            : '沒有帳號？點此註冊'}
        </span>
      </p>
    </div>
  );
}

export default Login;
