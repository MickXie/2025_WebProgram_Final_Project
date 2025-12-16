import React, { useState, useEffect } from 'react';

function Profile() {
  const currentUserId = "B123456"; // 模擬登入
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  // 狀態管理
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // 新增：頭像連結
  const [skills, setSkills] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState('All'); 
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/${currentUserId}`);
      const data = await res.json();
      if (res.ok) {
        setName(data.name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || ''); // 讀取資料庫的頭像
      }
    } catch (error) { console.error(error); }
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_URL}/api/skills/${currentUserId}`);
      const data = await res.json();
      if (res.ok) setSkills(data);
    } catch (error) { console.error(error); }
  };

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

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMessage('儲存中...');
    try {
      await fetch(`${API_URL}/api/users/${currentUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          bio, 
          avatar_url: avatarUrl // 傳送頭像連結給後端
        }),
      });
      setStatusMessage('✅ 個人檔案已更新！');
    } catch (error) { setStatusMessage('❌ 連線錯誤'); }
  };

  // 技能邏輯 (保持不變)
  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const filteredSkills = selectedCategory === 'All' ? skills : skills.filter(s => s.category === selectedCategory);
  const mySelectedSkills = skills.filter(s => s.level > 0);
  const getLevelColor = (level) => {
    if (level === 1) return '#4CAF50';
    if (level === 2) return '#2196F3';
    if (level === 3) return '#f44336';
    return '#ddd';
  };

  return (
    <div className="form-container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '30px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>編輯個人檔案</h2>

      <form onSubmit={handleSave}>
        
        {/* --- 上半部：頭像與基本資料區 (Flex 排版) --- */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', flexWrap: 'wrap' }}>
          
          {/* 左側：頭像區 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            {/* 圓形頭像顯示區 */}
            <div style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: '3px solid #eee',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img 
                src={avatarUrl || 'https://via.placeholder.com/150?text=User'} // 若無圖片顯示預設圖
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }} // 網址錯誤時的備案
              />
            </div>
            
            {/* 匯入圖片框 */}
            <input 
              type="text" 
              placeholder="輸入圖片網址(URL)..." 
              value={avatarUrl} 
              onChange={(e) => setAvatarUrl(e.target.value)}
              style={{ 
                width: '160px', 
                padding: '6px', 
                fontSize: '0.8rem', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                textAlign: 'center'
              }}
            />
            <small style={{ color: '#888', fontSize: '0.7rem' }}>請貼上 .jpg 或 .png 結尾的網址</small>
          </div>

          {/* 右側：姓名與自介區 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 姓名輸入 */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>姓名 / 暱稱</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="你的名字"
              />
            </div>

            {/* 自我介紹 (放在姓名下面) */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>自我介紹</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '120px', // 固定高度讓它對齊
                  padding: '10px', 
                  fontSize: '0.95rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc',
                  resize: 'vertical'
                }}
                placeholder="介紹一下你自己，或是你想學什麼？"
              />
            </div>
          </div>
        </div>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

        {/* --- 下半部：技能選擇區 (保持原樣) --- */}
        <h3 style={{ marginBottom: '15px' }}>技能專長設定</h3>
        
        {/* 分類導覽列 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto' }}>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat ? '#333' : '#f0f0f0',
                color: selectedCategory === cat ? '#fff' : '#333',
                fontWeight: 'bold'
              }}
            >
              {cat === 'All' ? '全部' : cat}
            </button>
          ))}
        </div>

        {/* 技能卡片區 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '30px',
          maxHeight: '350px', 
          overflowY: 'auto',
          border: '1px solid #eee',
          padding: '15px',
          borderRadius: '8px'
        }}>
          {filteredSkills.map(skill => (
            <div key={skill.id} style={{ 
              border: skill.level > 0 ? `2px solid ${getLevelColor(skill.level)}` : '1px solid #ddd',
              padding: '10px', 
              borderRadius: '8px', 
              textAlign: 'center',
              backgroundColor: '#fff'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{skill.name}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                {[1, 2, 3].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSkillUpdate(skill.id, skill.level === lvl ? 0 : lvl)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      border: 'none', cursor: 'pointer',
                      backgroundColor: skill.level === lvl ? getLevelColor(lvl) : '#eee',
                      color: skill.level === lvl ? '#fff' : '#666',
                      fontWeight: 'bold', fontSize: '12px'
                    }}
                  >
                    {lvl === 1 ? 'L' : lvl === 2 ? 'M' : 'H'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 已選標籤展示 */}
        {mySelectedSkills.length > 0 && (
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>我的技能標籤</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {mySelectedSkills.map(skill => (
                <span key={skill.id} style={{
                  display: 'inline-flex', alignItems: 'center', padding: '6px 12px',
                  borderRadius: '20px', backgroundColor: getLevelColor(skill.level), color: 'white', fontSize: '0.9rem'
                }}>
                  {skill.name}
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
      
      {statusMessage && <div style={{ marginTop: '15px', textAlign: 'center', color: 'green', fontWeight: 'bold' }}>{statusMessage}</div>}
    </div>
  );
}

export default Profile;