import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // 切換 登入/註冊
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  // 定義 API 網址
  // 如果是本地開發，連到 3001；如果是上線後(Render)，用相對路徑
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
        body: JSON.stringify({ id: studentId, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          setMessage('註冊成功！請切換至登入。');
          setIsRegistering(false);
        } else {
          // 1. 登入成功，將使用者資料存起來 (這裡先用 localStorage 示範)
          localStorage.setItem('user', JSON.stringify(data.user));
          alert('登入成功！');
          // 2. 跳轉到個人頁面或探索頁面
          navigate('/Profile'); 
        }
      } else {
        setMessage(data.error || '發生錯誤');
      }
    } catch (error) {
      console.error(error);
      setMessage('無法連接伺服器，請確認 server.js 有沒有開');
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'left' }}>
      <h2 style={{ textAlign: 'center' }}>{isRegistering ? '註冊帳號' : '學生登入'}</h2>
      
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

        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          {isRegistering ? '註冊' : '登入'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        {message && <span style={{ color: 'red', display: 'block', marginBottom: '10px' }}>{message}</span>}
        
        <span 
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            setIsRegistering(!isRegistering);
            setMessage('');
          }}
        >
          {isRegistering ? '已有帳號？點此登入' : '沒有帳號？點此註冊'}
        </span>
      </p>
    </div>
  );
}

export default Login;