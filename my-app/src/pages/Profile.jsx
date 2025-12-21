import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from "../api";

function Profile() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  // --- 狀態管理 ---
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  
  // 圖片相關狀態
  const [avatarUrl, setAvatarUrl] = useState(''); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(''); 

  // 技能相關狀態 (我擁有的)
  const [skills, setSkills] = useState([]);
  
  // 學習目標相關狀態 (我想學的) - 新增
  const [learningGoals, setLearningGoals] = useState([]);

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

  // 當取得 UserID 後，抓取所有清單
  useEffect(() => {
    if (currentUserId) {
        fetchSkills();
        fetchLearningGoals(); // 新增抓取
    }
  }, [currentUserId]);

  // --- 2. 核心功能函式 ---

  // 抓取「我擁有的技能」
  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_URL}/api/skills/${currentUserId}`);
      const data = await res.json();
      if (res.ok) setSkills(data);
    } catch (error) { console.error("Fetch skills failed:", error); }
  };

  // 抓取「我想學的技能」
  const fetchLearningGoals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/learning-goals/${currentUserId}`);
      const data = await res.json();
      if (res.ok) setLearningGoals(data);
    } catch (error) { console.error("Fetch goals failed:", error); }
  };

  // 更新技能程度 (Level: 1-Low, 2-Mid, 3-High)
  const handleSkillUpdate = async (skillId, newLevel) => {
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, level: newLevel } : s));
    try {
      await fetch(`${API_URL}/api/update-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, skillId, level: newLevel }),
      });
    } catch (error) { console.error("Update failed", error); }
  };

  // 更新學習意願度 (Level: 1-Low, 2-Mid, 3-High) - 新增
  const handleLearningUpdate = async (skillId, newLevel) => {
    setLearningGoals(prev => prev.map(g => g.id === skillId ? { ...g, level: newLevel } : g));
    try {
      await fetch(`${API_URL}/api/update-learning-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, skillId, level: newLevel }),
      });
    } catch (error) { console.error("Update learning goal failed", error); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMessage('儲存中...');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (selectedFile) formData.append('avatarFile', selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/users/${currentUserId}`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage('✅ 個人檔案已更新！');
        if (data.avatar_url) { setAvatarUrl(data.avatar_url); setPreviewUrl(''); setSelectedFile(null); }
      } else { setStatusMessage('❌ 更新失敗'); }
    } catch (error) { setStatusMessage('❌ 連線錯誤'); }
  };

  // --- 3. 視覺樣式輔助 ---
  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const getLevelColor = (level) => {
    if (level === 1) return '#A8E6CF';
    if (level === 2) return '#3D84B8';
    if (level === 3) return '#1A3C40';
    return '#eee';
  };

  const getGoalColor = (level) => {
    if (level === 1) return '#E1BEE7';
    if (level === 2) return '#9C27B0';
    if (level === 3) return '#FF4081'; 
    return '#eee';
  };
  if (!currentUserId) return <div>載入中...</div>;

  return (
    <div className="form-container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>編輯個人檔案與技能</h2>

      <form onSubmit={handleSave}>
        {/* 個人資料區 */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #eee' }}>
              <img src={previewUrl || avatarUrl || 'https://via.placeholder.com/150'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <label style={{ cursor: 'pointer', padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                📷 上傳圖片
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>姓名 / 暱稱</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>自我介紹</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', height: '100px', padding: '10px', marginTop: '5px' }} />
            </div>
          </div>
        </div>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />
        
        {/* 分類按鈕 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {categories.map(cat => (
                <button key={cat} type="button" onClick={() => setSelectedCategory(cat)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: selectedCategory === cat ? '#333' : '#f0f0f0', color: selectedCategory === cat ? '#fff' : '#333' }}>
                    {cat === 'All' ? '全部' : cat}
                </button>
            ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* 左側：我擁有的技能 */}
          <div>
            <h3 style={{ borderLeft: '5px solid #4CAF50', paddingLeft: '10px' }}>我的專長 (Skills)</h3>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>選擇你擅長的程度 (L/M/H)</p>
            <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
              {skills.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map(skill => (
                <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f9f9f9' }}>
                  <span>{skill.name}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[1, 2, 3].map(lvl => (
                      <button key={lvl} type="button" onClick={() => handleSkillUpdate(skill.id, skill.level === lvl ? 0 : lvl)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: skill.level === lvl ? getLevelColor(lvl) : '#eee', color: '#fff', fontSize: '10px' }}>
                        {lvl === 1 ? 'L' : lvl === 2 ? 'M' : 'H'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右側：我想學的技能 */}
          <div>
            <h3 style={{ borderLeft: '5px solid #9C27B0', paddingLeft: '10px' }}>我想學習 (Learning)</h3>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>選擇你渴望學習的程度</p>
            <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
              {learningGoals.filter(g => selectedCategory === 'All' || g.category === selectedCategory).map(goal => (
                <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f9f9f9' }}>
                  <span>{goal.name}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[1, 2, 3].map(lvl => (
                      <button key={lvl} type="button" onClick={() => handleLearningUpdate(goal.id, goal.level === lvl ? 0 : lvl)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: goal.level === lvl ? getGoalColor(lvl) : '#eee', color: '#fff', fontSize: '10px' }}>
                        {lvl === 1 ? 'L' : lvl === 2 ? 'M' : 'H'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 
  marginTop: '40px', 
  padding: '25px', 
  backgroundColor: '#fff', 
  borderRadius: '12px', 
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
}}>
  <h4 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#555', letterSpacing: '1px' }}>
     ✨ 個人標籤預覽
  </h4>
  
  <div style={{ display: 'flex', alignItems: 'stretch', gap: '20px' }}>
    
    {/* 左側：專長區 */}
    <div style={{ flex: 1 }}>
      <p style={{ fontWeight: 'bold', color: '#2E7D32', marginBottom: '10px', fontSize: '0.9rem' }}>已掌握的技能</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {skills.filter(s => s.level > 0).length > 0 ? (
          skills.filter(s => s.level > 0).map(s => (
            <span key={s.id} style={{ 
              padding: '6px 12px', borderRadius: '20px', 
              backgroundColor: getLevelColor(s.level), color: '#fff', 
              fontSize: '0.85rem', fontWeight: '500', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {s.name}
            </span>
          ))
        ) : (
          <span style={{ color: '#999', fontSize: '0.8rem' }}>尚未選擇專長</span>
        )}
      </div>
    </div>

    {/* 中間分隔線 */}
    <div style={{ width: '2px', backgroundColor: '#eee', margin: '0 10px' }}></div>

    {/* 右側：想學區 */}
    <div style={{ flex: 1 }}>
      <p style={{ fontWeight: 'bold', color: '#512DA8', marginBottom: '10px', fontSize: '0.9rem' }}>渴望學習的技能</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {learningGoals.filter(g => g.level > 0).length > 0 ? (
          learningGoals.filter(g => g.level > 0).map(g => (
            <span key={g.id} style={{ 
              padding: '6px 12px', borderRadius: '20px', 
              backgroundColor: getGoalColor(g.level), color: '#fff', 
              fontSize: '0.85rem', fontWeight: '500', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {g.name}
            </span>
          ))
        ) : (
          <span style={{ color: '#999', fontSize: '0.8rem' }}>尚未選擇目標</span>
        )}
      </div>
    </div>

  </div>
</div>

        <button type="submit" style={{ width: '100%', padding: '12px', marginTop: '20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          儲存個人資料
        </button>
      </form>
      
      {statusMessage && <div style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>{statusMessage}</div>}
    </div>
  );
}

export default Profile;