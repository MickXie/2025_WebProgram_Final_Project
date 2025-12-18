import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
  const navigate = useNavigate();

  // --- 狀態管理 ---
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  
  // 圖片相關狀態
  const [avatarUrl, setAvatarUrl] = useState(''); // 資料庫原本存的圖片 URL
  const [selectedFile, setSelectedFile] = useState(null); // 使用者新選的檔案物件
  const [previewUrl, setPreviewUrl] = useState(''); // 前端預覽用的 URL

  // 技能相關狀態
  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusMessage, setStatusMessage] = useState('');

  // --- 1. 身分驗證與初始化 ---
  useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem('loginToken');
        if (!token) { navigate('/login'); return; }
        try {
            const res = await fetch(`${API_URL}/api/me`, { headers: { 'Authorization': token } });
            if (res.ok) {
                const data = await res.json();
                setCurrentUserId(data.user.id);
                setName(data.user.name || '');
                setBio(data.user.bio || '');
                setAvatarUrl(data.user.avatar_url || '');
            } else { throw new Error('Auth failed'); }
        } catch (e) { localStorage.removeItem('loginToken'); navigate('/login'); }
    };
    checkAuth();
  }, [navigate, API_URL]);

  // 當取得 UserID 後，去抓取技能資料
  useEffect(() => {
    if (currentUserId) fetchSkills();
  }, [currentUserId]);

  // --- 2. 核心功能函式 (這裡修復了！) ---

  // 抓取技能清單
  const fetchSkills = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`${API_URL}/api/skills/${currentUserId}`);
      const data = await res.json();
      if (res.ok) {
        setSkills(data); // ★ 關鍵：把資料存入狀態，畫面才會顯示
      }
    } catch (error) { console.error("Fetch skills failed:", error); }
  };

  // 更新技能程度 (點選 L/M/H 按鈕時觸發)
  const handleSkillUpdate = async (skillId, newLevel) => {
    if (!currentUserId) return;
    
    // 1. 先在前端立刻更新畫面 (讓使用者覺得很快)
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, level: newLevel } : s));
    
    // 2. 背景發送請求給後端儲存
    try {
      await fetch(`${API_URL}/api/update-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, skillId, level: newLevel }),
      });
    } catch (error) { 
        console.error("Update failed", error); 
    }
  };

  // 處理圖片選擇與預覽
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 儲存個人資料 (包含圖片上傳)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;

    setStatusMessage('儲存中...');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (selectedFile) {
      formData.append('avatarFile', selectedFile);
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${currentUserId}`, {
        method: 'POST',
        body: formData, 
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMessage('✅ 個人檔案已更新！');
        if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
            setPreviewUrl('');
            setSelectedFile(null);
        }
      } else {
        setStatusMessage('❌ 更新失敗');
      }
    } catch (error) { 
        console.error(error);
        setStatusMessage('❌ 連線錯誤'); 
    }
  };

  // --- 3. 畫面計算邏輯 ---
  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const filteredSkills = selectedCategory === 'All' ? skills : skills.filter(s => s.category === selectedCategory);
  // 篩選出已經選擇程度的技能 (level > 0)
  const mySelectedSkills = skills.filter(s => s.level > 0);

  const getLevelColor = (level) => {
    if (level === 1) return '#4CAF50'; // Low: 綠色
    if (level === 2) return '#2196F3'; // Mid: 藍色
    if (level === 3) return '#F44336'; // High: 紅色
    return '#ddd';
  };

  if (!currentUserId) return <div>Loading...</div>;

  return (
    <div className="form-container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '30px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>編輯個人檔案</h2>

      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', flexWrap: 'wrap' }}>
          
          {/* 左側：頭像區 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', 
              border: '3px solid #eee', backgroundColor: '#f9f9f9',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              <img 
                src={previewUrl || avatarUrl || 'https://via.placeholder.com/150?text=User'} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
              />
            </div>
            
            <label style={{ cursor: 'pointer', padding: '6px 12px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}>
                📷 上傳圖片
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            <small style={{ color: '#888', fontSize: '0.7rem' }}>支援 .jpg, .png</small>
          </div>

          {/* 右側：姓名與自介區 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>姓名 / 暱稱</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>自我介紹</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                style={{ width: '100%', height: '120px', padding: '10px', fontSize: '0.95rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />
        
        {/* --- 技能專長設定區 --- */}
        <h3 style={{ marginBottom: '15px' }}>技能專長設定</h3>
        
        {/* 分類按鈕 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto' }}>
            {categories.map(cat => (
                <button key={cat} type="button" onClick={() => setSelectedCategory(cat)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: selectedCategory === cat ? '#333' : '#f0f0f0', color: selectedCategory === cat ? '#fff' : '#333', fontWeight: 'bold' }}>
                    {cat === 'All' ? '全部' : cat}
                </button>
            ))}
        </div>
        
        {/* 技能列表卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px', maxHeight: '350px', overflowY: 'auto', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
          {filteredSkills.map(skill => (
            <div key={skill.id} style={{ border: skill.level > 0 ? `2px solid ${getLevelColor(skill.level)}` : '1px solid #ddd', padding: '10px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{skill.name}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                {[1, 2, 3].map(lvl => (
                  <button key={lvl} type="button" onClick={() => handleSkillUpdate(skill.id, skill.level === lvl ? 0 : lvl)}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: skill.level === lvl ? getLevelColor(lvl) : '#eee', color: skill.level === lvl ? '#fff' : '#666', fontWeight: 'bold', fontSize: '12px' }}>
                    {lvl === 1 ? 'L' : lvl === 2 ? 'M' : 'H'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* --- 我的技能標籤區 (這裡是你貼的那一段，現在有資料就會顯示了) --- */}
        {mySelectedSkills.length > 0 && (
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
             <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>已選擇的專長：</h4>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {mySelectedSkills.map(skill => (
                <span key={skill.id} style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '20px', backgroundColor: getLevelColor(skill.level), color: 'white', fontSize: '0.9rem' }}>
                  {skill.name}
                  {/* 按下 X 會呼叫 handleSkillUpdate 將 level 設為 0 */}
                  <button type="button" onClick={() => handleSkillUpdate(skill.id, 0)} style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }}>
          儲存所有變更
        </button>
      </form>
      
      {statusMessage && <div style={{ marginTop: '15px', textAlign: 'center', color: statusMessage.includes('失敗') || statusMessage.includes('錯誤') ? 'red' : 'green', fontWeight: 'bold' }}>{statusMessage}</div>}
    </div>
  );
}

export default Profile;